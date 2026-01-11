import { createAndMountUI } from '@/providers/ThemeProvider';
import Cropper from './components/Cropper';

const dev = [
  '*://*.example.com/*',
  '*://*.softwebtuts.blogspot.com/*',
  '*://foundrlist.com/*',
  '*://*.shadcnstudio.com/*',
  '*://*.x.com/*',
];
const production = ['<all_urls>'];

const anchor = 'body';
const position = 'overlay';
export default defineContentScript({
  matches: dev,
  cssInjectionMode: 'ui',

  async main(ctx) {
    let mountedElem: any = null;
    mountedElem = await createAndMountUI(ctx, {
      anchor,
      position,
      children: <Cropper mode="custom" />,
    });

    // Capture Element
    onMessage(CAPTURE_MESSAGES.CAPTURE_DIV, async () => {
      if (mountedElem) return;

      mountedElem = await createAndMountUI(ctx, {
        anchor,
        position,
        children: <Cropper mode="element" />,
      });
    });

    // Capture Custom
    onMessage(CAPTURE_MESSAGES.CAPTURE_CUSTOM, async () => {
      if (mountedElem) return;

      mountedElem = await createAndMountUI(ctx, {
        anchor,
        children: <Cropper mode="custom" />,
      });
    });

    // onMessage(CAPTURE_MESSAGES.CAPTURE_FULL_PAGE, async () => {
    //   const url: string = window.location.href;
    //   let platform: 'facebook' | 'youtube' | 'twitter' | 'chatgpt' | undefined;

    //   if (url.includes('facebook.com')) platform = 'facebook';
    //   else if (url.includes('youtube.com')) platform = 'youtube';
    //   else if (url.includes('twitter.com')) platform = 'twitter';
    //   else if (url.includes('chatgpt.com')) platform = 'chatgpt';

    //   CaptureTab({
    //     platform,
    //     onProgress: (current, total) => {
    //       console.log(`Capturing frame ${current}/${total}`);
    //     },
    //     onComplete: async (base64Image) => {
    //       console.log('Screenshot complete!');
    //       await settingsHook.saveSettings({ base64Image });
    //       await sendMessage(GENERAL_MESSAGES.SHOW_EDITOR);
    //     },
    //   });
    // });

    // Message Handler to Unmount Injected React Nodes
    document.addEventListener('EXTENSION_MESSAGE', async (e: Event) => {
      const event = e as CustomEvent<{ action: string; payload?: any }>;

      const { action, payload } = event.detail;

      if (action === GENERAL_MESSAGES.UNMOUNT && mountedElem) {
        mountedElem.remove();
        mountedElem = null;
      }
    });
  },
});
