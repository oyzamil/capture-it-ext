export default defineBackground(() => {
  try {
    // const { settings } = settingsHook.getState();
    // console.log(settings);

    // settingsHook.subscribe(({ settings }) => {
    //   console.log('settings changed', settings);
    // });

    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.captureVisibleTab) {
        browser.tabs
          .captureVisibleTab(sender.tab!.windowId!, { format: 'png' })
          .then((screenshotUrl) => {
            sendResponse({ screenshotUrl });
          })
          .catch((err) => {
            console.error(err);
            sendResponse({ error: err.message });
          });

        return true; // keep the message channel open
      }

      if (request.message === 'showOptions') {
        browser.tabs.create({
          url: browser.runtime.getURL('/options.html'),
        });
      }

      if (request.message === 'internalPage') {
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
