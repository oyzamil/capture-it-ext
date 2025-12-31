export interface CaptureOptions {
  platform?: 'facebook' | 'youtube' | 'twitter' | 'chatgpt';
  onProgress?: (current: number, total: number) => void;
  onComplete?: (imageData: string) => void;
  scrollInnerElements?: boolean;
}

interface FrameData {
  url: string;
  offsetHeight: number;
  lastFrame: boolean;
  lastFrameHeight: number;
}

/* ------------------------------------------------------------------ */
/* Utility: find tallest scrollable element */
/* ------------------------------------------------------------------ */

function isScrollable(el: HTMLElement): boolean {
  const overflowY = window.getComputedStyle(el).overflowY;
  return (overflowY === 'scroll' || overflowY === 'auto') && el.scrollHeight > el.clientHeight && el.clientHeight !== 0 && el.scrollTop === 0;
}

function getTallestScrollableElement(): HTMLElement {
  const allElements = document.body.getElementsByTagName('*');
  const body = document.body;

  let tallest: HTMLElement | null = body.scrollHeight > window.innerHeight ? body : null;

  for (const el of Array.from(allElements)) {
    if (el.scrollHeight >= el.clientHeight && isScrollable(el as HTMLElement) && el.scrollHeight - el.clientHeight > 50) {
      if (!tallest || el.scrollHeight >= tallest.scrollHeight) {
        tallest = el as HTMLElement;
      }
    }
  }

  return tallest || body;
}

/* ------------------------------------------------------------------ */
/* Utility: find all scrollable elements */
/* ------------------------------------------------------------------ */

function getAllScrollableElements(): HTMLElement[] {
  const allElements = document.body.getElementsByTagName('*');
  const scrollables: HTMLElement[] = [];

  for (const el of Array.from(allElements)) {
    const htmlEl = el as HTMLElement;
    if (isScrollable(htmlEl)) {
      scrollables.push(htmlEl);
    }
  }

  return scrollables;
}

function isPageScrollable(): boolean {
  return document.body.scrollHeight > window.innerHeight || document.documentElement.scrollHeight > window.innerHeight;
}

function getTotalHeight(): number {
  let maxHeight = 0;

  function traverse(nodes: NodeListOf<ChildNode>) {
    nodes.forEach((node) => {
      if (node instanceof HTMLElement) {
        maxHeight = Math.max(maxHeight, node.scrollHeight || 0, node.clientHeight || 0);
        if (node.childNodes.length) traverse(node.childNodes);
      }
    });
  }

  traverse(document.documentElement.childNodes);
  return maxHeight;
}

/* ------------------------------------------------------------------ */
/* Sticky / fixed / absolute element handling */
/* ------------------------------------------------------------------ */

const hiddenElements = new Map<HTMLElement, string>();

function getStickyFixedAndAbsoluteElements(): HTMLElement[] {
  return Array.from(document.querySelectorAll('*')).filter((el) => {
    const pos = window.getComputedStyle(el).position.toLowerCase();
    return pos.includes('fixed') || pos.includes('sticky');
  }) as HTMLElement[];
}

function isInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();

  return (rect.y > 0 && rect.y < window.innerHeight && rect.y < el.clientHeight) || (rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth);
}

async function hideProblematicElements(): Promise<void> {
  getStickyFixedAndAbsoluteElements().forEach((el) => {
    if (!hiddenElements.has(el)) {
      hiddenElements.set(el, el.style.visibility);
      // el.style.visibility = 'hidden';
    }
  });
}

async function restoreHiddenElements(): Promise<void> {
  hiddenElements.forEach((originalVisibility, el) => {
    el.style.visibility = originalVisibility;
  });
  hiddenElements.clear();
}

/* ------------------------------------------------------------------ */
/* Scroll inner element completely */
/* ------------------------------------------------------------------ */

async function scrollElementCompletely(element: HTMLElement, capturedFrames: FrameData[], onProgress?: (current: number, total: number) => void): Promise<void> {
  const viewportHeight = element.clientHeight;
  let totalHeight = element.scrollHeight;

  if (totalHeight <= viewportHeight) {
    return; // Element is not scrollable
  }

  // Save original scroll position
  const originalScrollTop = element.scrollTop;
  element.scrollTop = 0;

  await sleep(300);

  let previousScrollTop = 0;
  let scrollAttempts = 0;
  const maxScrollAttempts = 3;

  while (true) {
    await hideProblematicElements();
    await sleep(100);

    const dataUrl = await captureCurrentTab();
    const currentScrollTop = element.scrollTop;
    const scrolledFromTop = currentScrollTop;

    // Recalculate total height after each capture (handles dynamic content)
    totalHeight = element.scrollHeight;
    const remainingHeight = totalHeight - scrolledFromTop;

    // Check if we've reached the bottom
    const isAtBottom = Math.abs(currentScrollTop + viewportHeight - totalHeight) < 10;
    const canScrollMore = remainingHeight > viewportHeight;

    capturedFrames.push({
      url: dataUrl,
      offsetHeight: viewportHeight,
      lastFrame: isAtBottom || !canScrollMore,
      lastFrameHeight: Math.min(remainingHeight, viewportHeight),
    });

    if (onProgress) {
      onProgress(capturedFrames.length, capturedFrames.length + 1);
    }

    // Break if we're at the bottom or can't scroll more
    if (isAtBottom || !canScrollMore) break;

    // Check if scroll position hasn't changed (stuck)
    if (Math.abs(currentScrollTop - previousScrollTop) < 5) {
      scrollAttempts++;
      if (scrollAttempts >= maxScrollAttempts) break;
    } else {
      scrollAttempts = 0;
    }

    previousScrollTop = currentScrollTop;
    element.scrollBy(0, viewportHeight);

    await sleep(300);
  }

  // Restore original scroll position and elements
  element.scrollTop = originalScrollTop;
  await restoreHiddenElements();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ------------------------------------------------------------------ */
/* Frame recalculation */
/* ------------------------------------------------------------------ */

async function recalculateFrames(container: HTMLElement, currentFrame: number, totalHeight: number, coveredHeight: number, viewportHeight: number, stepHeight: number): Promise<number> {
  let frames = Math.ceil((container.scrollHeight || getTotalHeight()) / stepHeight);

  if (currentFrame === frames) {
    const extraFrames = Math.ceil((totalHeight - coveredHeight) / viewportHeight);
    if (extraFrames) frames += extraFrames - 1;
  }

  return frames === Infinity ? 0 : frames;
}

/* ------------------------------------------------------------------ */
/* Capture visible frame using chrome.tabs.captureVisibleTab */
/* ------------------------------------------------------------------ */

async function captureCurrentTab(): Promise<string> {
  const { dataUrl } = await sendMessage(CAPTURE_MESSAGES.CAPTURE_TAB);
  return dataUrl;
}

/* ------------------------------------------------------------------ */
/* Merge screenshots */
/* ------------------------------------------------------------------ */

async function mergeScreenshots(frames: FrameData[]): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const firstImage = new Image();
  firstImage.src = frames[0].url;
  await firstImage.decode();

  const ratio = firstImage.naturalHeight / frames[0].offsetHeight;
  let totalHeight = 0;

  for (const frame of frames) {
    totalHeight += frame.lastFrame ? frame.lastFrameHeight * ratio : firstImage.naturalHeight;
  }

  canvas.width = firstImage.naturalWidth;
  canvas.height = totalHeight;

  let y = 0;
  for (const frame of frames) {
    const img = new Image();
    img.src = frame.url;
    await img.decode();

    const height = frame.lastFrame ? frame.lastFrameHeight * ratio : img.naturalHeight;

    ctx.drawImage(img, 0, 0, canvas.width, height, 0, y, canvas.width, height);
    y += height;
  }

  return canvas.toDataURL();
}

/* ------------------------------------------------------------------ */
/* Main screenshot logic */
/* ------------------------------------------------------------------ */

export async function CaptureTab(options: CaptureOptions = {}): Promise<string> {
  const { platform, onProgress, onComplete, scrollInnerElements = false } = options;

  const capturedFrames: FrameData[] = [];

  // Check if scrollInnerElements is enabled
  if (scrollInnerElements) {
    const scrollableElements = getAllScrollableElements();

    // If no scrollable elements found (including main page), capture full page
    if (scrollableElements.length === 0 && !isPageScrollable()) {
      const dataUrl = await captureCurrentTab();
      capturedFrames.push({
        url: dataUrl,
        offsetHeight: window.innerHeight,
        lastFrame: true,
        lastFrameHeight: window.innerHeight,
      });

      const finalImage = capturedFrames[0].url;
      if (onComplete) {
        onComplete(finalImage);
      }
      return finalImage;
    }

    // Scroll through each scrollable element
    for (let i = 0; i < scrollableElements.length; i++) {
      const element = scrollableElements[i];
      await scrollElementCompletely(element, capturedFrames, (current, total) => {
        if (onProgress) {
          onProgress(capturedFrames.length, capturedFrames.length + total);
        }
      });
    }

    // If we captured inner elements, merge and return
    if (capturedFrames.length > 0) {
      const finalImage = await mergeScreenshots(capturedFrames);
      if (onComplete) {
        onComplete(finalImage);
      }
      return finalImage;
    }
  }

  let container: HTMLElement;
  let viewportHeight: number;
  let totalHeight: number;

  // Determine container based on platform
  switch (platform) {
    case 'youtube':
      container = document.body;
      viewportHeight = window.innerHeight;
      totalHeight = container.scrollHeight;
      window.scrollTo(0, 0);
      break;

    case 'chatgpt':
      container = document.querySelectorAll('.h-full')[3]?.querySelector('div') ?? document.body;
      viewportHeight = container.offsetHeight;
      totalHeight = container.scrollHeight;
      container.scrollTo(0, 0);
      break;

    default:
      container = getTallestScrollableElement();
      viewportHeight = container === document.body ? window.innerHeight : container.offsetHeight;
      totalHeight = container.scrollHeight || getTotalHeight();
      container === document.body ? window.scrollTo(0, 0) : container.scrollTo(0, 0);
  }

  // Check if page is not scrollable - capture single frame
  if (totalHeight <= viewportHeight) {
    const dataUrl = await captureCurrentTab();
    const finalImage = dataUrl;
    if (onComplete) {
      onComplete(finalImage);
    }
    return finalImage;
  }

  let frames = Math.ceil(totalHeight / viewportHeight);
  if (frames === 1 && totalHeight < viewportHeight) frames = 2;

  let frameIndex = 0;
  let previousScrollTop = 0;
  let scrollAttempts = 0;
  const maxScrollAttempts = 3;

  // Save original overflow styles
  const originalBodyOverflow = document.body.style.overflow;
  const originalContainerOverflow = container.style.overflow;

  document.body.style.overflow = 'hidden';
  container.style.overflow = 'hidden';

  await sleep(1000);

  try {
    while (true) {
      // Hide problematic elements before capture
      await hideProblematicElements();
      await sleep(100);

      // Capture current visible tab
      const dataUrl = await captureCurrentTab();

      // Get current scroll position
      const currentScrollTop = container === document.body ? window.scrollY || window.pageYOffset : container.scrollTop;

      // Recalculate total height after each capture (handles dynamic content)
      totalHeight = container.scrollHeight || getTotalHeight();
      const scrolledFromTop = currentScrollTop;
      const remainingHeight = totalHeight - scrolledFromTop;

      // Check if we've reached the bottom (with 10px tolerance)
      const isAtBottom = Math.abs(scrolledFromTop + viewportHeight - totalHeight) < 10;
      const canScrollMore = remainingHeight > viewportHeight;

      capturedFrames.push({
        url: dataUrl,
        offsetHeight: viewportHeight,
        lastFrame: isAtBottom || !canScrollMore,
        lastFrameHeight: Math.min(remainingHeight, viewportHeight),
      });

      if (onProgress) {
        // Recalculate total frames based on current height
        frames = Math.ceil(totalHeight / viewportHeight);
        onProgress(frameIndex + 1, frames);
      }

      frameIndex++;

      // Break if we're at the bottom or can't scroll more
      if (isAtBottom || !canScrollMore) break;

      // Check if scroll position hasn't changed (stuck)
      if (Math.abs(currentScrollTop - previousScrollTop) < 5) {
        scrollAttempts++;
        if (scrollAttempts >= maxScrollAttempts) break;
      } else {
        scrollAttempts = 0;
      }

      previousScrollTop = currentScrollTop;

      // Scroll to next section
      if (container === document.body) {
        window.scrollBy(0, viewportHeight);
      } else {
        container.scrollBy(0, viewportHeight);
      }

      await sleep(500);
    }

    // Merge all captured frames
    const finalImage = await mergeScreenshots(capturedFrames);

    if (onComplete) {
      onComplete(finalImage);
    }

    return finalImage;
  } finally {
    // Restore original overflow styles and hidden elements
    document.body.style.overflow = originalBodyOverflow;
    container.style.overflow = originalContainerOverflow;
    await restoreHiddenElements();
  }
}

/* ------------------------------------------------------------------ */
/* Export for use in components */
/* ------------------------------------------------------------------ */

export default CaptureTab;
