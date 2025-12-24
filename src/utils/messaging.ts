import { defineExtensionMessaging } from '@webext-core/messaging';

export const EXT_MESSAGES = {
  CAPTURE_DIV: 'CAPTURE_DIV',
  CAPTURE_VISIBLE: 'CAPTURE_VISIBLE',
  CAPTURE_CUSTOM: 'CUSTOM_CAPTURE',
  SHOW_EDITOR: 'SHOW_EDITOR',
  INTERNAL_PAGE: 'INTERNAL_PAGE',
  DOWNLOAD: 'DOWNLOAD',
  UNMOUNT: 'UNMOUNT',
  NOTIFY: 'NOTIFY',
} as const;

// Extract literal types of EXT_MESSAGES values
export type EXT_MESSAGES_TYPE = (typeof EXT_MESSAGES)[keyof typeof EXT_MESSAGES];

export const sendMessageToMain = (action: string, payload?: any) => {
  const event = new CustomEvent('EXTENSION_MESSAGE', {
    detail: { action, payload },
    bubbles: true, // important: allow it to escape shadow DOM
    composed: true, // important: allow it to cross shadow boundary
  });

  document.dispatchEvent(event);
};

interface ProtocolMap {
  [EXT_MESSAGES.CAPTURE_DIV](): void;
  [EXT_MESSAGES.CAPTURE_VISIBLE](): { screenshotUrl: string };
  [EXT_MESSAGES.CAPTURE_CUSTOM](): void;
  [EXT_MESSAGES.SHOW_EDITOR](): void;
  [EXT_MESSAGES.SHOW_EDITOR](): void;
  [EXT_MESSAGES.INTERNAL_PAGE](): void;
  [EXT_MESSAGES.DOWNLOAD](payload: { dataUrl: string; filename: string }): Promise<{ downloadId: number | undefined }>;
  [EXT_MESSAGES.UNMOUNT](): void;
  [EXT_MESSAGES.NOTIFY](payload: { title: string; message: string }): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
