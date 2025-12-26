import { createAndMountUI } from '@/providers/ThemeProvider';
import CaptureCustom from './components/CaptureCustom';
import CaptureElem from './components/CaptureElem';

const example = ['*://*.example.com/*'];
const production_match = ['<all_urls>'];

export default defineContentScript({
  matches: example,
  cssInjectionMode: 'ui',
  allFrames: true,

  async main(ctx) {
    let mountedElem: any = null;
    // mountedElem = await createAndMountUI(ctx, {
    //   anchor: 'body',
    //   children: (
    //     <>
    //       <CaptureElem />
    //     </>
    //   ),
    // });

    onMessage(EXT_MESSAGES.CAPTURE_DIV, async () => {
      if (mountedElem) return;

      mountedElem = await createAndMountUI(ctx, {
        anchor: 'body',
        position: 'overlay',
        children: (
          <>
            <CaptureElem />
          </>
        ),
      });
    });

    onMessage(EXT_MESSAGES.CAPTURE_CUSTOM, async () => {
      if (mountedElem) return;

      mountedElem = await createAndMountUI(ctx, {
        anchor: 'body',
        position: 'overlay',
        children: (
          <>
            <CaptureCustom />
          </>
        ),
      });
    });

    document.addEventListener('EXTENSION_MESSAGE', async (e: Event) => {
      const event = e as CustomEvent<{ action: string; payload?: any }>;

      const { action, payload } = event.detail;

      if (action === EXT_MESSAGES.UNMOUNT && mountedElem) {
        mountedElem.remove();
        mountedElem = null;
      }
    });
  },
});
