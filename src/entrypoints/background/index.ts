export default defineBackground(() => {
  try {
    // const { settings } = settingsHook.getState();
    // console.log(settings);

    // settingsHook.subscribe(({ settings }) => {
    //   console.log('settings changed', settings);
    // });

    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === EXT_MESSAGES.CAPTURE_VISIBLE) {
        browser.tabs
          .captureVisibleTab(sender.tab!.windowId!, { format: 'png' })
          .then((screenshotUrl) => {
            sendResponse({ screenshotUrl });
          })
          .catch((err) => {
            console.error(err);
            sendResponse({ error: err.message });
          });

        return true;
      }

      if (request.action === EXT_MESSAGES.SHOW_EDITOR) {
        browser.tabs.create({
          url: browser.runtime.getURL('/options.html'),
        });
      }

      if (request.action === EXT_MESSAGES.DOWNLOAD) {
        const { dataUrl, filename } = request;
        if (!dataUrl) return;
        handleImageDownload(dataUrl, filename);

        return true;
      }
      if (request.action === EXT_MESSAGES.INTERNAL_PAGE) {
        notify("The extension doesn't work on internal pages.");
      }
    });
  } catch (error) {
    console.error('Service Worker Error:', error);
  }
});

function notify(msg: string) {
  browser.notifications.create({
    type: 'basic',
    iconUrl: 'icons/128.png',
    title: 'Quick Div Capture',
    message: msg,
  });
}

const handleImageDownload = (dataUrl: string, filename: string) => {
  chrome.downloads.download(
    {
      url: dataUrl,
      filename,
      // saveAs: true,
    },
    (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('Download failed:', chrome.runtime.lastError);
      } else {
        notify('Downloading Image!');
        console.log('Download started, id:', downloadId);
      }
    }
  );
};
