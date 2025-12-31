import { settingsHook } from '@/hooks/useSettings';
export const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

export default defineBackground(() => {
  try {
    const { settings } = settingsHook.getState();
    // console.log(settings);

    // settingsHook.subscribe(({ settings }) => {
    //   console.log('settings changed', settings);
    // });

    onMessage(CAPTURE_MESSAGES.CAPTURE_TAB, ({ sender }) => {
      return captureVisible(sender.tab?.windowId);
    });

    // Open Editor Page
    onMessage(GENERAL_MESSAGES.SHOW_EDITOR, async () => {
      const editorUrl = browser.runtime.getURL('/editor.html');
      openPage(editorUrl);
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
