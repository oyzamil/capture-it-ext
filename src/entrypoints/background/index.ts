export default defineBackground(() => {
  try {
    // const { settings } = settingsHook.getState();
    // console.log(settings);

    // settingsHook.subscribe(({ settings }) => {
    //   console.log('settings changed', settings);
    // });

    onMessage(EXT_MESSAGES.CAPTURE_VISIBLE, ({ sender }) => {
      return captureVisible(sender.tab?.windowId);
    });

    // Open Editor Page
    onMessage(EXT_MESSAGES.SHOW_EDITOR, async () => {
      const editorUrl = browser.runtime.getURL('/editor.html');
      openPage(editorUrl);
    });
    onMessage(EXT_MESSAGES.OPEN_TAB, async ({ data }) => {
      return openPage(data.url, data.options);
    });

    // Download file
    onMessage(EXT_MESSAGES.DOWNLOAD, async ({ data }) => {
      return handleImageDownload(data.dataUrl, data.filename);
    });

    // Show Notification
    onMessage(EXT_MESSAGES.NOTIFY, ({ data }) => {
      notify(data.title, data.message);
    });
  } catch (error) {
    console.error('Service Worker Error:', error);
  }
});

function notify(title: string, message: string) {
  console.log(message);
  browser.notifications.create('quick-div-capture', {
    type: 'basic',
    iconUrl: browser.runtime.getURL('/icons/128.png'),
    title: title,
    message: message,
  });
}

const captureVisible = (windowId?: number): Promise<{ screenshotUrl: string }> => {
  return new Promise((resolve, reject) => {
    const getWindowId = (): Promise<number> => {
      // Case 1: windowId already exists
      if (windowId !== undefined) {
        return Promise.resolve(windowId);
      }

      // Case 2: fallback to active tab
      return browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        const activeTab = tabs[0];
        if (activeTab?.windowId === undefined) {
          throw new Error('Unable to determine active window');
        }
        return activeTab.windowId;
      });
    };

    getWindowId()
      .then((finalWindowId) => {
        return browser.tabs.captureVisibleTab(finalWindowId, { format: 'png' });
      })
      .then((screenshotUrl) => resolve({ screenshotUrl }))
      .catch((err) => {
        console.error('captureVisible failed:', err);
        reject(err);
      });
  });
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
