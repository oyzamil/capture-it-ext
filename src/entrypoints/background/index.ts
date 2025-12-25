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
    onMessage(EXT_MESSAGES.SHOW_EDITOR, openEditorPage);

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

const openEditorPage = async () => {
  const editorUrl = browser.runtime.getURL('/editor.html');

  // Get all tabs in all windows
  const tabs = await browser.tabs.query({});

  // Find a tab that already has our extension editor open
  const editorTab = tabs.find((tab) => tab.url === editorUrl);

  if (editorTab?.id != null) {
    // Focus the existing tab and its window
    await browser.tabs.update(editorTab.id, { active: true });
    await browser.windows.update(editorTab.windowId, { focused: true });
  } else {
    // Open a new tab
    await browser.tabs.create({
      url: editorUrl,
      active: true,
    });
  }
};
