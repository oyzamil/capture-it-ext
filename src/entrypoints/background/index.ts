import { settingsHook } from '@/hooks/useSettings';
export const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';
const EDITOR_PAGE_URL = browser.runtime.getURL('/editor.html');

export default defineBackground(() => {
  try {
    const { settings } = settingsHook.getState();
    // console.log(settings);

    // settingsHook.subscribe(({ settings }) => {
    //   console.log('settings changed', settings);
    // });

    onMessage(CAPTURE_MESSAGES.CAPTURE_TAB, () => {
      return captureVisible();
    });
    onMessage(CAPTURE_MESSAGES.CAPTURE_FULL_TAB, async ({ data }) => {
      const dataUrl = await captureTabScreenshot({
        tabId: data.tabId,
        format: data.format,
        scaleFactor: data.scaleFactor,
      });
      await settingsHook.saveSettings({ base64Image: dataUrl });
      openPage(EDITOR_PAGE_URL);
    });

    // Open Editor Page
    onMessage(GENERAL_MESSAGES.SHOW_EDITOR, async () => {
      openPage(EDITOR_PAGE_URL);
    });

    onMessage(GENERAL_MESSAGES.OPEN_TAB, async ({ data }) => {
      return openPage(data.url, data.options);
    });

    // Download file
    onMessage(GENERAL_MESSAGES.DOWNLOAD, async ({ data }) => {
      return handleImageDownload(data.dataUrl, data.filename);
    });

    // Show Notification
    onMessage(GENERAL_MESSAGES.NOTIFY, ({ data }) => {
      notify(data.title, data.message);
    });

    // Create Offscreen page to start capturing
    onMessage(GENERAL_MESSAGES.CREATE_OFFSCREEN, async ({ data }) => {
      if (!(await hasOffscreenDocument())) {
        await createOffscreenDocument();
      }
    });

    onMessage(GENERAL_MESSAGES.CLOSE_OFFSCREEN, async ({ data }) => {
      if (data.dataUrl) await settingsHook.saveSettings({ base64Image: data.dataUrl });
      if (await hasOffscreenDocument()) {
        await closeOffscreenDocument();
      }
    });
  } catch (error) {
    console.error('Service Worker Error:', error);
  }
});

function notify(title: string, message: string) {
  browser.notifications.create('quick-div-capture', {
    type: 'basic',
    iconUrl: browser.runtime.getURL('/icons/128.png'),
    title: title,
    message: message,
  });
}

const captureVisible = async (windowId?: number): Promise<{ dataUrl: string }> => {
  try {
    const getWindowId = async (): Promise<number> => {
      if (windowId !== undefined) return windowId;

      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];

      if (activeTab?.windowId === undefined) {
        throw new Error('Unable to determine active window');
      }

      return activeTab.windowId;
    };

    const finalWindowId = await getWindowId();
    const dataUrl = await browser.tabs.captureVisibleTab(finalWindowId, { format: 'png' });

    return { dataUrl };
  } catch (err) {
    console.error('captureVisible failed:', err);
    throw err;
  }
};

const handleImageDownload = async (dataUrl: string, filename: string): Promise<{ downloadId: number | undefined }> => {
  try {
    const downloadId = await browser.downloads.download({
      url: dataUrl,
      filename,
      saveAs: false,
    });

    return { downloadId };
  } catch (e) {
    console.error('Download failed', e);
    return { downloadId: undefined };
  }
};

const openPage = async (url: string, options: OpenPageOptions = {}) => {
  if (!url) {
    return { success: false, message: 'URL not valid!' };
  }

  const { current = false, active = true, newWindow = false } = options;

  // 👉 Replace current tab
  if (current) {
    const [activeTab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (activeTab?.id != null) {
      await browser.tabs.update(activeTab.id, { url, active });
      return { success: true, message: 'Current tab updated!' };
    }
  }

  // 👉 Open in new window (optional)
  if (newWindow) {
    await browser.windows.create({
      url,
      focused: active,
    });
    return { success: true, message: 'Opened in new window!' };
  }

  // 👉 Reuse existing tab
  const tabs = await browser.tabs.query({});
  const existingTab = tabs.find((tab) => tab.url === url);

  if (existingTab?.id != null) {
    await browser.tabs.update(existingTab.id, { active });
    await browser.windows.update(existingTab.windowId, { focused: active });
  } else {
    await browser.tabs.create({
      url,
      active,
    });
  }

  return { success: true, message: 'Tab opened!' };
};

async function createOffscreenDocument() {
  if (await hasOffscreenDocument()) {
    return;
  }

  await browser.offscreen.createDocument({
    url: browser.runtime.getURL(OFFSCREEN_DOCUMENT_PATH),
    reasons: ['DISPLAY_MEDIA'],
    justification: 'Screen capture',
  });
}

async function closeOffscreenDocument() {
  if (!(await hasOffscreenDocument())) {
    return;
  }
  await browser.offscreen.closeDocument();
}

async function hasOffscreenDocument(): Promise<boolean> {
  // Use the new getContexts API if supported
  const contexts = await browser.runtime?.getContexts?.({
    contextTypes: [browser.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [browser.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)],
  });

  if (contexts != null) {
    return contexts.length > 0;
  } else {
    // fallback for older browsers or untyped runtime
    // self here is Service Worker scope
    const matchedClients = await (self as any).clients.matchAll();
    return matchedClients.some((client: any) => client.url.includes(browser.runtime.id));
  }
}
export type ScreenshotFormat = 'png' | 'jpeg' | 'webp';

export interface CaptureScreenshotOptions {
  tabId?: number;
  format?: ScreenshotFormat;
  quality?: number;
  scaleFactor?: number;
  delayMs?: number;
}
async function captureTabScreenshot(options: CaptureScreenshotOptions): Promise<string> {
  const { tabId, format = 'png', quality = 90, scaleFactor = 1, delayMs = 300 } = options;

  const [activeTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  const debuggerTarget = { tabId: tabId || activeTab.id };

  // --- attach debugger
  await browser.debugger.attach(debuggerTarget, '1.3');

  try {
    // --- enable page
    await browser.debugger.sendCommand(debuggerTarget, 'Page.enable');

    // --- transparent background
    await browser.debugger.sendCommand(debuggerTarget, 'Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });

    // --- get layout size
    const metrics = (await browser.debugger.sendCommand(debuggerTarget, 'Page.getLayoutMetrics')) as {
      contentSize: { width: number; height: number };
    };

    const { width, height } = metrics.contentSize;

    // --- override device metrics
    await browser.debugger.sendCommand(debuggerTarget, 'Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: scaleFactor,
      mobile: false,
    });

    // --- allow layout settle
    await sleep(delayMs);

    // --- capture screenshot
    const result = (await browser.debugger.sendCommand(debuggerTarget, 'Page.captureScreenshot', {
      format,
      fromSurface: true,
      ...(format === 'jpeg' ? { quality } : {}),
    })) as { data: string };

    return `data:image/${format};base64,${result.data}`;
  } finally {
    // --- cleanup ALWAYS
    await browser.debugger.sendCommand(debuggerTarget, 'Emulation.clearDeviceMetricsOverride');

    await browser.debugger.detach(debuggerTarget);
  }
}
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
