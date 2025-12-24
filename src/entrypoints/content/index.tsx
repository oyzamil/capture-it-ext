import { settingsHook } from '@/hooks/useSettings';
import { createAndMountUI } from '@/providers/ThemeProvider';
import ScreenshotSelector from './components/Screenshot';

const example = ['*://*.example.com/*'];
const production_match = ['<all_urls>'];

export default defineContentScript({
  matches: example,
  // 2. Set cssInjectionMode
  cssInjectionMode: 'ui',

  async main(ctx) {
    const { settings } = settingsHook.getState();
    let mountedElem: any = null;

    onMessage(EXT_MESSAGES.CAPTURE_CUSTOM, async () => {
      if (mountedElem) return;

      mountedElem = await createAndMountUI(ctx, {
        anchor: 'body',
        children: (
          <>
            <ScreenshotSelector />
          </>
        ),
      });
    });

    document.addEventListener('EXTENSION_MESSAGE', async (e: Event) => {
      const event = e as CustomEvent<{ action: string; payload?: any }>;
      console.log('Message from shadow DOM:', event.detail);

      const { action, payload } = event.detail;

      if (action === EXT_MESSAGES.UNMOUNT && mountedElem) {
        mountedElem.remove();
        mountedElem = null;
      }
    });

    // settingsHook.subscribe(({ settings }) => {
    //   if (settings.licenseModalVisible) {
    //     selector.start();
    //   } else {
    //     selector.handleCancel();
    //   }
    //   console.log('settings changed', settings);
    // });

    // selector.setButtonsShowCallback(async (element, rect) => {
    //   console.log({ element, rect });
    // const actionButtons = await createAndMountUI(ctx, {
    //   anchor: 'body',
    //   children: (
    //     <ActionButtons
    //       position={rect}
    //       showEraser={true}
    //       onCopy={() => {
    //         selector.handleCopy();
    //       }}
    //       onDownload={() => {
    //         selector.handleDownload();
    //       }}
    //       onEraser={() => {
    //         selector.toggleEraser();
    //       }}
    //       onCancel={() => {
    //         selector.handleCancel();
    //         actionButtons?.remove();
    //       }}
    //     />
    //   ),
    // });
    // });
  },
});
