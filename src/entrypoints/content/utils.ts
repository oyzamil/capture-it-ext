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

const getEffectiveBackground = (el: HTMLElement, defaultColor: string): string => {
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

function getStickyAndFixedElements(): HTMLElement[] {
  return Array.from(document.querySelectorAll('*')).filter((el) => {
    const pos = window.getComputedStyle(el).position.toLowerCase();
    return pos.includes('fixed') || pos.includes('sticky');
  }) as HTMLElement[];
}
async function hideStickyAndFixedElements(): Promise<void> {
  getStickyAndFixedElements().forEach((el) => {
    el.style.visibility = 'hidden';
  });
}
async function showStickyAndFixedElements(): Promise<void> {
  getStickyAndFixedElements().forEach((el) => {
    el.style.visibility = '';
  });
}

interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface ViewportSize {
  width: number;
  height: number;
}

interface Tile {
  scrollX: number;
  scrollY: number;

  elementOverlapX: number;
  elementOverlapY: number;
  elementOverlapWidth: number;
  elementOverlapHeight: number;

  destX: number;
  destY: number;
}

export async function sketchImage(
  selection: ElementSelection,
  options: {
    padding?: Padding;
  } = {}
): Promise<CanvasResult> {
  const { padding = { top: 0, right: 0, bottom: 0, left: 0 } } = options;

  const dpr = window.devicePixelRatio || 1;

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
  const totalWidth = elementDocRect.width;
  const totalHeight = elementDocRect.height;
  const needsStitching = totalWidth > viewportSize.width || totalHeight > viewportSize.height;
  let canvas: HTMLCanvasElement;

  if (needsStitching) {
    canvas = await captureStitched(selection, elementDocRect, viewportSize, dpr, pad);
  } else {
    canvas = await captureSingle(selection, dpr, pad);
  }

  // Convert canvas to output format
  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
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

async function captureScreenshotWithThrottle(delay = 500, waitFrameCount = 2): Promise<string> {
  // Wait for the throttle delay
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Wait for a few animation frames
  await new Promise<void>((resolve) => {
    function step(i: number) {
      if (i <= 0) return resolve();
      requestAnimationFrame(() => step(i - 1));
    }
    step(waitFrameCount);
  });

  const { dataUrl } = await sendMessage(CAPTURE_MESSAGES.CAPTURE_TAB);
  return dataUrl;
}

/**
 * Calculate tiles for stitched capture
 */
function calculateTiles(
  elementRect: Rect,
  viewportSize: ViewportSize
): {
  tiles: Tile[];
  cols: number;
  rows: number;
  captureRect: Rect;
} {
  const tiles: Tile[] = [];

  // Expanded capture rectangle (CSS pixels, document coords)
  const captureRect: Rect = {
    x: elementRect.x,
    y: elementRect.y,
    width: elementRect.width,
    height: elementRect.height,
  };

  const cols = Math.ceil(captureRect.width / viewportSize.width);
  const rows = Math.ceil(captureRect.height / viewportSize.height);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Where we scroll the viewport
      const scrollX = captureRect.x + col * viewportSize.width;
      const scrollY = captureRect.y + row * viewportSize.height;

      // Viewport bounds after scrolling
      const viewportLeft = scrollX;
      const viewportTop = scrollY;
      const viewportRight = scrollX + viewportSize.width;
      const viewportBottom = scrollY + viewportSize.height;

      // Element bounds
      const elementLeft = captureRect.x;
      const elementTop = captureRect.y;
      const elementRight = captureRect.x + captureRect.width;
      const elementBottom = captureRect.y + captureRect.height;

      // Intersection (overlap)
      const overlapLeft = Math.max(elementLeft, viewportLeft);
      const overlapTop = Math.max(elementTop, viewportTop);
      const overlapRight = Math.min(elementRight, viewportRight);
      const overlapBottom = Math.min(elementBottom, viewportBottom);

      const overlapWidth = overlapRight - overlapLeft;
      const overlapHeight = overlapBottom - overlapTop;

      if (overlapWidth <= 0 || overlapHeight <= 0) {
        continue;
      }

      tiles.push({
        scrollX,
        scrollY,

        // Where the element appears inside the viewport (CSS px)
        elementOverlapX: overlapLeft - viewportLeft,
        elementOverlapY: overlapTop - viewportTop,
        elementOverlapWidth: overlapWidth,
        elementOverlapHeight: overlapHeight,

        // Where this part goes in the final stitched canvas (CSS px)
        destX: overlapLeft - elementLeft,
        destY: overlapTop - elementTop,
      });
    }
  }

  return { tiles, cols, rows, captureRect };
}

/**
 * Capture element using multiple screenshots stitched together
 */
async function captureStitched(selection: ElementSelection, elementRect: Rect, viewportSize: ViewportSize, dpr: number, padding: Padding): Promise<HTMLCanvasElement> {
  const { tiles, captureRect } = calculateTiles(elementRect, viewportSize);

  const originalScrollX = window.scrollX;
  const originalScrollY = window.scrollY;

  const capturedTiles: Array<{
    image: HTMLImageElement;
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
    destX: number;
    destY: number;
  }> = [];

  hideStickyAndFixedElements();

  try {
    for (const tile of tiles) {
      // Scroll viewport to tile position
      window.scrollTo({
        left: tile.scrollX,
        top: tile.scrollY,
        behavior: 'instant',
      });

      const dataUrl = await captureScreenshotWithThrottle();
      const image = await createImageFromData(dataUrl);
      const overlapLeft = Math.max(captureRect.x, window.scrollX);
      const overlapTop = Math.max(captureRect.y, window.scrollY);
      const cropX = Math.round((overlapLeft - window.scrollX) * dpr);
      const cropY = Math.round((overlapTop - window.scrollY) * dpr);

      const cropWidth = Math.round(Math.min(window.innerWidth - (overlapLeft - window.scrollX), captureRect.x + captureRect.width - overlapLeft) * dpr);

      const cropHeight = Math.round(Math.min(window.innerHeight - (overlapTop - window.scrollY), captureRect.y + captureRect.height - overlapTop) * dpr);

      capturedTiles.push({
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        destX: Math.round(tile.destX * dpr),
        destY: Math.round(tile.destY * dpr),
      });
    }
  } finally {
    window.scrollTo({
      left: originalScrollX,
      top: originalScrollY,
      behavior: 'instant',
    });

    showStickyAndFixedElements();
  }

  const stitchedWidth = Math.round(captureRect.width * dpr);
  const stitchedHeight = Math.round(captureRect.height * dpr);

  const canvas = document.createElement('canvas');
  canvas.width = stitchedWidth + padding.left + padding.right;
  canvas.height = stitchedHeight + padding.top + padding.bottom;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to get 2D canvas context');
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (const tile of capturedTiles) {
    context.drawImage(tile.image, tile.cropX, tile.cropY, tile.cropWidth, tile.cropHeight, padding.left + tile.destX, padding.top + tile.destY, tile.cropWidth, tile.cropHeight);
  }

  applyPaddingBackground(selection.element, context, canvas, padding, stitchedWidth, stitchedHeight);

  return canvas;
}
/**
 * Capture element in single screenshot
 */
async function captureSingle(selection: ElementSelection, dpr: number, pad: Padding): Promise<HTMLCanvasElement> {
  selection?.element?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
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

  const dataUrl = await captureScreenshotWithThrottle(0);
  const image = await createImageFromData(dataUrl);

  const canvas = document.createElement('canvas');
  const targetW = Math.max(1, Math.floor(currentRect.width * dpr));
  const targetH = Math.max(1, Math.floor(currentRect.height * dpr));

  const rawSx = Math.floor(currentRect.x * dpr);
  const rawSy = Math.floor(currentRect.y * dpr);

  const sx = Math.max(0, rawSx);
  const sy = Math.max(0, rawSy);
  const sWidth = Math.min(targetW - (sx - rawSx), Math.max(0, image.width - sx));
  const sHeight = Math.min(targetH - (sy - rawSy), Math.max(0, image.height - sy));

  canvas.width = sWidth + pad.left + pad.right;
  canvas.height = sHeight + pad.top + pad.bottom;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get 2D canvas context');
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sx, sy, sWidth, sHeight, pad.left, pad.top, sWidth, sHeight);

  applyPaddingBackground(selection.element, ctx, canvas, pad, sWidth, sHeight);

  return canvas;
}

/**
 * Add padding around the content and fill it with a background color
 */
function applyPaddingBackground(element: HTMLElement | null, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, padding: Padding, contentWidth: number, contentHeight: number): void {
  const defaultColor = '#ffffff';
  const backgroundColor = element ? getEffectiveBackground(element, defaultColor) : defaultColor;
  // Top padding
  if (padding.top > 0) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, padding.top);
  }

  // Bottom padding
  if (padding.bottom > 0) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, padding.top + contentHeight, canvas.width, padding.bottom);
  }

  // Left padding
  if (padding.left > 0) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, padding.top, padding.left, contentHeight);
  }

  // Right padding
  if (padding.right > 0) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(padding.left + contentWidth, padding.top, padding.right, contentHeight);
  }
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
function openPreview(source: HTMLCanvasElement | HTMLImageElement): void {
  // If already a canvas, use it directly
  if (source instanceof HTMLCanvasElement) {
    source.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');

      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }, 'image/png');
    return;
  }

  // If it's an image, draw it onto a canvas first
  const canvas = document.createElement('canvas');
  canvas.width = source.naturalWidth;
  canvas.height = source.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.drawImage(source, 0, 0);

  canvas.toBlob((blob) => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, 'image/png');
}
