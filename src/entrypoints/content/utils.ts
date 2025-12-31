/**
 * Copy an image Blob to the clipboard.
 * @param imageBlob - The image Blob to copy (must be PNG, JPEG, etc.)
 */
export async function copyImageToClipboard(imageBlob: Blob): Promise<void> {
  const isFirefox = navigator.userAgent.includes('Firefox');

  if (!('ClipboardItem' in window)) {
    throw new Error('Clipboard API not supported in this browser');
  }

  if (isFirefox) {
    throw new Error('Copying images to clipboard is not supported in Firefox');
  }

  const clipboardItem = new ClipboardItem({ [imageBlob.type || 'image/png']: imageBlob });
  await navigator.clipboard.write([clipboardItem]);
}

export const ensureFontsReady = async (timeoutMs = 1000) => {
  const controller = new AbortController();

  setTimeout(() => controller.abort(), timeoutMs);

  try {
    await Promise.race([document.fonts.ready, new Promise((_, reject) => controller.signal.addEventListener('abort', reject))]);
  } catch {}
};

export const getEffectiveBackground = (el: HTMLElement, defaultColor: string): string => {
  let current: HTMLElement | null = el;

  while (current) {
    const bg = window.getComputedStyle(current).backgroundColor;

    if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
      return bg;
    }

    current = current.parentElement;
  }

  return defaultColor;
};

export const getComputedPadding = (el: HTMLElement) => {
  const style = getComputedStyle(el);

  return {
    top: parseFloat(style.paddingTop) || 0,
    right: parseFloat(style.paddingRight) || 0,
    bottom: parseFloat(style.paddingBottom) || 0,
    left: parseFloat(style.paddingLeft) || 0,
  };
};

interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface SketchOptions {
  captureMargin?: number;
  padding?: Padding;
  paddingColor?: string;
  transparentPadding?: boolean;
  roundedRadius?: number;
  squircleRounding?: boolean;
  cornerSmoothing?: number;
  format?: ExportFormats;
  resolution?: Resolution;
}

interface ViewportSize {
  width: number;
  height: number;
}

interface Tile {
  docX: number;
  docY: number;
  width: number;
  height: number;
  col: number;
  row: number;
}

interface CaptureStyle {
  format: ExportFormats;
  roundedRadius: number;
  squircleRounding: boolean;
  cornerSmoothing: number;
  paddingColor: string;
  transparentPadding: boolean;
}

export async function sketchImage(selection: ElementSelection, options: SketchOptions = {}): Promise<CanvasResult> {
  const {
    captureMargin = 0,
    padding = { top: 0, right: 0, bottom: 0, left: 0 },
    paddingColor = '#ffffff',
    transparentPadding = false,
    roundedRadius = 0,
    squircleRounding = false,
    cornerSmoothing = 0.6,
    format = 'png',
    resolution = 'normal',
  } = options;

  const dpr = window.devicePixelRatio || 1;

  // Convert padding to device pixels
  const pad = {
    left: Math.floor(padding.left * dpr),
    right: Math.floor(padding.right * dpr),
    top: Math.floor(padding.top * dpr),
    bottom: Math.floor(padding.bottom * dpr),
  };

  // Get element rect in document coordinates
  let elementDocRect: Rect;
  if (selection.element) {
    elementDocRect = getElementDocumentRect(selection.element);
  } else {
    elementDocRect = { ...selection.rect };
  }
  const viewportSize = { width: window.innerWidth, height: window.innerHeight };

  // Check if element needs stitching (exceeds viewport)
  const totalWidth = elementDocRect.width + captureMargin * 2;
  const totalHeight = elementDocRect.height + captureMargin * 2;
  const needsStitching = totalWidth > viewportSize.width || totalHeight > viewportSize.height;

  let canvas: HTMLCanvasElement;

  if (needsStitching) {
    canvas = await captureStitched(selection, elementDocRect, viewportSize, dpr, captureMargin, pad, {
      paddingColor,
      transparentPadding,
      roundedRadius,
      squircleRounding,
      cornerSmoothing,
      format,
    });
  } else {
    canvas = await captureSingle(selection, dpr, captureMargin, pad, {
      paddingColor,
      transparentPadding,
      roundedRadius,
      squircleRounding,
      cornerSmoothing,
      format,
    });
  }

  // Convert canvas to output format
  const { dataUrl, blob } = await canvasToOutput(canvas, format, resolution);
  return { dataUrl, blob };
}

/**
 * Get element's bounding rect relative to the document
 */
function getElementDocumentRect(element: Element): Rect {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Calculate tiles for stitched capture
 */
function calculateTiles(
  elementRect: Rect,
  viewportSize: ViewportSize,
  captureMargin: number
): {
  tiles: Tile[];
  cols: number;
  rows: number;
  captureRect: Rect;
} {
  const tiles: Tile[] = [];

  const captureRect: Rect = {
    x: elementRect.x - captureMargin,
    y: elementRect.y - captureMargin,
    width: elementRect.width + captureMargin * 2,
    height: elementRect.height + captureMargin * 2,
  };

  const tileStepX = viewportSize.width;
  const tileStepY = viewportSize.height;

  const cols = Math.ceil(captureRect.width / tileStepX);
  const rows = Math.ceil(captureRect.height / tileStepY);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const docX = captureRect.x + col * tileStepX;
      const docY = captureRect.y + row * tileStepY;

      const tileWidth = Math.min(viewportSize.width, captureRect.x + captureRect.width - docX);
      const tileHeight = Math.min(viewportSize.height, captureRect.y + captureRect.height - docY);

      tiles.push({
        docX,
        docY,
        width: tileWidth,
        height: tileHeight,
        col,
        row,
      });
    }
  }

  return { tiles, cols, rows, captureRect };
}
let lastCaptureTime = 0;
const MIN_CAPTURE_INTERVAL = 600;

async function throttledCapture(): Promise<{ dataUrl: string }> {
  const now = Date.now();
  const wait = Math.max(0, MIN_CAPTURE_INTERVAL - (now - lastCaptureTime));

  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait));
  }

  lastCaptureTime = Date.now();
  return sendMessage(CAPTURE_MESSAGES.CAPTURE_TAB);
}

/**
 * Capture element using multiple screenshots stitched together
 */
async function captureStitched(
  selection: ElementSelection,
  elementRect: Rect,
  viewportSize: ViewportSize,
  dpr: number,
  captureMargin: number,
  pad: Padding,
  style: CaptureStyle
): Promise<HTMLCanvasElement> {
  const margin = Math.floor(captureMargin * dpr);
  const { tiles, captureRect } = calculateTiles(elementRect, viewportSize, captureMargin);
  const savedScrollX = window.scrollX;
  const savedScrollY = window.scrollY;
  const tileImages: Array<{
    image: HTMLImageElement;
    tile: Tile;
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
    destX: number;
    destY: number;
  }> = [];

  try {
    for (const tile of tiles) {
      window.scrollTo({
        left: tile.docX,
        top: tile.docY,
        behavior: 'instant',
      });

      await new Promise((r) => setTimeout(r, 120));
      await waitFrames(2);
      await new Promise((r) => setTimeout(r, 30));

      const { dataUrl } = await throttledCapture();
      const image = await createImageFromData(dataUrl);

      const cropX = 0;
      const cropY = 0;
      const cropWidth = Math.min(tile.width * dpr, image.width);
      const cropHeight = Math.min(tile.height * dpr, image.height);

      tileImages.push({
        image,
        tile,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        destX: (tile.docX - captureRect.x) * dpr,
        destY: (tile.docY - captureRect.y) * dpr,
      });
    }
  } finally {
    window.scrollTo({
      left: savedScrollX,
      top: savedScrollY,
      behavior: 'instant',
    });
    await new Promise((r) => setTimeout(r, 120));
  }

  const stitchedWidth = Math.ceil(captureRect.width * dpr);
  const stitchedHeight = Math.ceil(captureRect.height * dpr);

  const canvas = document.createElement('canvas');
  canvas.width = stitchedWidth + pad.left + pad.right;
  canvas.height = stitchedHeight + pad.top + pad.bottom;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D canvas context');
  }
  const isAlpha = supportsAlpha(style.format);
  const applyClip = style.roundedRadius > 0;

  if (applyClip) {
    ctx.save();
    const r = Math.min(style.roundedRadius, Math.floor(Math.min(canvas.width, canvas.height) / 2));
    ctx.beginPath();
    smartRectPath(ctx, 0, 0, canvas.width, canvas.height, r, style.squircleRounding, style.cornerSmoothing);
    ctx.clip();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const ti of tileImages) {
    ctx.drawImage(ti.image, ti.cropX, ti.cropY, ti.cropWidth, ti.cropHeight, pad.left + ti.destX, pad.top + ti.destY, ti.cropWidth, ti.cropHeight);
  }

  applyPaddingRings(selection, ctx, canvas, pad, margin, stitchedWidth, stitchedHeight, style, isAlpha);

  if (applyClip) {
    ctx.restore();
  }

  return canvas;
}

/**
 * Capture element in single screenshot
 */
async function captureSingle(selection: ElementSelection, dpr: number, captureMargin: number, pad: Padding, style: CaptureStyle): Promise<HTMLCanvasElement> {
  selection?.element?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  await new Promise((r) => setTimeout(r, 120));

  let currentRect: Rect;
  if (selection.element) {
    const rect = selection.element.getBoundingClientRect();
    currentRect = {
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  } else {
    currentRect = { ...selection.rect };
  }

  await waitFrames(2);
  await new Promise((r) => setTimeout(r, 30));
  const { dataUrl } = await sendMessage(CAPTURE_MESSAGES.CAPTURE_TAB);
  const image = await createImageFromData(dataUrl);

  const canvas = document.createElement('canvas');
  const targetW = Math.max(1, Math.floor(currentRect.width * dpr));
  const targetH = Math.max(1, Math.floor(currentRect.height * dpr));
  const marginPx = Math.max(0, Math.floor(captureMargin * dpr));

  const rawSx = Math.floor(currentRect.x * dpr) - marginPx;
  const rawSy = Math.floor(currentRect.y * dpr) - marginPx;
  const rawSW = targetW + marginPx * 2;
  const rawSH = targetH + marginPx * 2;

  const sx = Math.max(0, rawSx);
  const sy = Math.max(0, rawSy);
  const sWidth = Math.min(rawSW - (sx - rawSx), Math.max(0, image.width - sx));
  const sHeight = Math.min(rawSH - (sy - rawSy), Math.max(0, image.height - sy));

  canvas.width = sWidth + pad.left + pad.right;
  canvas.height = sHeight + pad.top + pad.bottom;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get 2D canvas context');
  }

  const isAlpha = supportsAlpha(style.format);
  const applyClip = style.roundedRadius > 0;

  if (applyClip) {
    ctx.save();
    const r = Math.min(style.roundedRadius, Math.floor(Math.min(canvas.width, canvas.height) / 2));
    ctx.beginPath();
    smartRectPath(ctx, 0, 0, canvas.width, canvas.height, r, style.squircleRounding, style.cornerSmoothing);
    ctx.clip();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sx, sy, sWidth, sHeight, pad.left, pad.top, sWidth, sHeight);

  applyPaddingRings(selection, ctx, canvas, pad, marginPx, sWidth, sHeight, style, isAlpha);

  if (applyClip) {
    ctx.restore();
  }

  return canvas;
}

/**
 * Apply padding rings to canvas
 */
function applyPaddingRings(
  selection: ElementSelection,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  pad: Padding,
  margin: number,
  contentWidth: number,
  contentHeight: number,
  style: CaptureStyle,
  isAlpha: boolean
): void {
  const outer = { x: 0, y: 0, w: canvas.width, h: canvas.height };
  const marginRect = { x: pad.left, y: pad.top, w: contentWidth, h: contentHeight };
  const contentRect = {
    x: pad.left + margin,
    y: pad.top + margin,
    w: Math.max(0, contentWidth - margin * 2),
    h: Math.max(0, contentHeight - margin * 2),
  };

  const rr = style.roundedRadius;
  const rOuter = Math.min(rr, Math.floor(Math.min(outer.w, outer.h) / 2));
  const rMargin = Math.min(rr, Math.floor(Math.min(marginRect.w, marginRect.h) / 2));

  let fillColor;
  if (selection.element) {
    fillColor = getEffectiveBackground(selection.element, style.paddingColor);
  } else {
    fillColor = style.paddingColor;
  }

  if (pad.left + pad.right + pad.top + pad.bottom > 0) {
    if (!style.transparentPadding || !isAlpha) {
      ctx.beginPath();
      smartRectPath(ctx, outer.x, outer.y, outer.w, outer.h, rOuter, style.squircleRounding, style.cornerSmoothing);
      smartRectPath(ctx, marginRect.x, marginRect.y, marginRect.w, marginRect.h, rMargin, style.squircleRounding, style.cornerSmoothing);
      ctx.fillStyle = fillColor;
      ctx.fill('evenodd');
    }
  }
}

/**
 * Convert canvas to output format
 */
async function canvasToOutput(canvas: HTMLCanvasElement, format: ExportFormats, resolution: Resolution = 'normal'): Promise<{ dataUrl: string; blob: Blob }> {
  const scaleFactor = getScaleFactor(resolution, canvas.width, canvas.height);

  // Create a scaled temporary canvas
  // const scaledCanvas = document.createElement('canvas');
  // scaledCanvas.width = Math.round(canvas.width * scaleFactor);
  // scaledCanvas.height = Math.round(canvas.height * scaleFactor);

  // const ctx = scaledCanvas.getContext('2d')!;
  // ctx.scale(scaleFactor, scaleFactor);
  // ctx.drawImage(canvas, 0, 0);

  // SVG export
  if (format === 'svg') {
    const raster = canvas.toDataURL('image/png');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
      <image href="${raster}" width="${canvas.width}" height="${canvas.height}" />
    </svg>`;

    return {
      dataUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg),
      blob: new Blob([svg], { type: 'image/svg+xml' }),
    };
  }

  // PNG / JPEG / WebP
  const mime = format === 'jpg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';

  const dataUrl = canvas.toDataURL(mime);
  const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), mime));

  return { dataUrl, blob };
}

/**
 * Helper: Check if format supports alpha channel
 */
function supportsAlpha(fmt: ExportFormats) {
  return fmt === 'png' || fmt === 'webp' || fmt === 'svg';
}

/**
 * Helper: Wait for animation frames
 */
function waitFrames(n: number = 2): Promise<void> {
  return new Promise((resolve) => {
    function f(i: number): void {
      if (i <= 0) return resolve();
      requestAnimationFrame(() => f(i - 1));
    }
    f(n);
  });
}
/**
 * Create an HTMLImageElement from a Data URL or Blob
 */
function createImageFromData(input: string | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve(img);
      if (input instanceof Blob) {
        URL.revokeObjectURL(img.src);
      }
    };

    img.onerror = reject;

    if (typeof input === 'string') {
      img.src = input; // data URL
    } else if (input instanceof Blob) {
      img.src = URL.createObjectURL(input);
    } else {
      reject(new Error('Invalid image input'));
    }
  });
}

/**
 * Helper: Draw rounded rectangle path
 */
function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Helper: Squircle path (Figma-style smooth corners)
 */
function squircleRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, cornerSmoothing: number): void {
  if (r <= 0 || cornerSmoothing <= 0) {
    roundRectPath(ctx, x, y, w, h, r);
    return;
  }

  const roundingAndSmoothingBudget = Math.min(w, h) / 2;
  const cornerRadius = Math.min(r, roundingAndSmoothingBudget);

  if (cornerRadius <= 0 || roundingAndSmoothingBudget <= 0) {
    roundRectPath(ctx, x, y, w, h, Math.max(0, r));
    return;
  }

  const params = getPathParamsForCorner(cornerRadius, cornerSmoothing, roundingAndSmoothingBudget);
  const { a, b, c, d, p, arcSectionLength } = params;
  const R = params.cornerRadius;

  const effectiveSmoothing = Math.min(cornerSmoothing, roundingAndSmoothingBudget / cornerRadius - 1);

  if (effectiveSmoothing < 0.01) {
    roundRectPath(ctx, x, y, w, h, cornerRadius);
    return;
  }

  const arcMeasure = 90 * (1 - effectiveSmoothing);
  const arcAngleRad = toRadians(arcMeasure);
  const kappa = (4 / 3) * Math.tan(arcAngleRad / 4);

  const mag1 = Math.sqrt(c * c + d * d);

  if (mag1 < 0.001) {
    roundRectPath(ctx, x, y, w, h, cornerRadius);
    return;
  }

  const t1x = c / mag1;
  const t1y = d / mag1;
  const t2x = d / mag1;
  const t2y = c / mag1;

  const ctrlDist = kappa * R;

  ctx.moveTo(x + p, y);
  ctx.lineTo(x + w - p, y);

  let cx = x + w - p;
  let cy = y;

  // Top-right corner
  ctx.bezierCurveTo(cx + a, cy, cx + a + b, cy, cx + a + b + c, cy + d);
  cx += a + b + c;
  cy += d;

  {
    const cp1x = cx + ctrlDist * t1x;
    const cp1y = cy + ctrlDist * t1y;
    const endX = cx + arcSectionLength;
    const endY = cy + arcSectionLength;
    const cp2x = endX - ctrlDist * t2x;
    const cp2y = endY - ctrlDist * t2y;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    cx = endX;
    cy = endY;
  }

  ctx.bezierCurveTo(cx + d, cy + c, cx + d, cy + b + c, cx + d, cy + a + b + c);
  cx += d;
  cy += a + b + c;

  ctx.lineTo(x + w, y + h - p);
  cx = x + w;
  cy = y + h - p;

  // Bottom-right corner
  ctx.bezierCurveTo(cx, cy + a, cx, cy + a + b, cx - d, cy + a + b + c);
  cx -= d;
  cy += a + b + c;

  {
    const cp1x = cx + ctrlDist * -t2x;
    const cp1y = cy + ctrlDist * t2y;
    const endX = cx - arcSectionLength;
    const endY = cy + arcSectionLength;
    const cp2x = endX - ctrlDist * -t1x;
    const cp2y = endY - ctrlDist * t1y;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    cx = endX;
    cy = endY;
  }

  ctx.bezierCurveTo(cx - c, cy + d, cx - b - c, cy + d, cx - a - b - c, cy + d);
  cx -= a + b + c;
  cy += d;

  ctx.lineTo(x + p, y + h);
  cx = x + p;
  cy = y + h;

  // Bottom-left corner
  ctx.bezierCurveTo(cx - a, cy, cx - a - b, cy, cx - a - b - c, cy - d);
  cx -= a + b + c;
  cy -= d;

  {
    const cp1x = cx + ctrlDist * -t1x;
    const cp1y = cy + ctrlDist * -t1y;
    const endX = cx - arcSectionLength;
    const endY = cy - arcSectionLength;
    const cp2x = endX - ctrlDist * -t2x;
    const cp2y = endY - ctrlDist * -t2y;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    cx = endX;
    cy = endY;
  }

  ctx.bezierCurveTo(cx - d, cy - c, cx - d, cy - b - c, cx - d, cy - a - b - c);
  cx -= d;
  cy -= a + b + c;

  ctx.lineTo(x, y + p);
  cx = x;
  cy = y + p;

  // Top-left corner
  ctx.bezierCurveTo(cx, cy - a, cx, cy - a - b, cx + d, cy - a - b - c);
  cx += d;
  cy -= a + b + c;

  {
    const cp1x = cx + ctrlDist * t2x;
    const cp1y = cy + ctrlDist * -t2y;
    const endX = cx + arcSectionLength;
    const endY = cy - arcSectionLength;
    const cp2x = endX - ctrlDist * t1x;
    const cp2y = endY - ctrlDist * -t1y;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    cx = endX;
    cy = endY;
  }

  ctx.bezierCurveTo(cx + c, cy - d, cx + b + c, cy - d, cx + a + b + c, cy - d);
  ctx.closePath();
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function getPathParamsForCorner(
  cornerRadius: number,
  cornerSmoothing: number,
  roundingAndSmoothingBudget: number
): {
  a: number;
  b: number;
  c: number;
  d: number;
  p: number;
  arcSectionLength: number;
  cornerRadius: number;
} {
  let p = (1 + cornerSmoothing) * cornerRadius;
  const maxCornerSmoothing = roundingAndSmoothingBudget / cornerRadius - 1;
  cornerSmoothing = Math.min(cornerSmoothing, maxCornerSmoothing);
  p = Math.min(p, roundingAndSmoothingBudget);

  const arcMeasure = 90 * (1 - cornerSmoothing);
  const arcSectionLength = Math.sin(toRadians(arcMeasure / 2)) * cornerRadius * Math.sqrt(2);
  const angleAlpha = (90 - arcMeasure) / 2;
  const p3ToP4Distance = cornerRadius * Math.tan(toRadians(angleAlpha / 2));
  const angleBeta = 45 * cornerSmoothing;
  const c = p3ToP4Distance * Math.cos(toRadians(angleBeta));
  const d = c * Math.tan(toRadians(angleBeta));
  let b = (p - arcSectionLength - c - d) / 3;
  let a = 2 * b;

  return { a, b, c, d, p, arcSectionLength, cornerRadius };
}

/**
 * Helper: Smart path routing (chooses between rounded and squircle)
 */
function smartRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, useSquircle: boolean, cornerSmoothing: number): void {
  if (useSquircle && r > 0 && cornerSmoothing > 0) {
    squircleRectPath(ctx, x, y, w, h, r, cornerSmoothing);
  } else {
    roundRectPath(ctx, x, y, w, h, r);
  }
}

// Usage example:
/*
const element = document.querySelector('.my-element');
const result = await createCanvas(element, {
  captureMargin: 10,
  padding: { top: 20, right: 20, bottom: 20, left: 20 },
  paddingColor: "#ffffff",
  transparentPadding: false,
  roundedRadius: 12,
  squircleRounding: true,
  cornerSmoothing: 0.6,
  format: "png",
  quality: 90
});

// result.dataUrl - can be used in <img src="">
// result.blob - can be used for File API or downloads
*/
