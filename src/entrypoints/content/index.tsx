import { createAndMountUI } from '@/providers/ThemeProvider';
import Cropper from './components/Cropper';

//  ['*://*.example.com/*'];
// ['<all_urls>'];

const anchor = 'body';
export default defineContentScript({
  matches: ['*://*.example.com/*'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    let mountedElem: any = null;

    // Capture Element
    onMessage(CAPTURE_MESSAGES.CAPTURE_DIV, async () => {
      if (mountedElem) return;

      mountedElem = await createAndMountUI(ctx, {
        anchor,
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
