export const EXT_MESSAGES = {
  CAPTURE_DIV: 'CAPTURE_DIV',
  CAPTURE_VISIBLE: 'CAPTURE_VISIBLE',
  CAPTURE_CUSTOM: 'CUSTOM_CAPTURE',
  SHOW_EDITOR: 'SHOW_EDITOR',
  INTERNAL_PAGE: 'INTERNAL_PAGE',
  DOWNLOAD: 'DOWNLOAD',
  UNMOUNT: 'UNMOUNT',
} as const;

// Extract literal types of EXT_MESSAGES values
export type EXT_MESSAGES_TYPE = (typeof EXT_MESSAGES)[keyof typeof EXT_MESSAGES];

// Define discriminated union for messages
export type ExtensionMessage =
  | { action: typeof EXT_MESSAGES.CAPTURE_DIV }
  | { action: typeof EXT_MESSAGES.CAPTURE_VISIBLE }
  | { action: typeof EXT_MESSAGES.CAPTURE_CUSTOM }
  | { action: typeof EXT_MESSAGES.SHOW_EDITOR }
  | { action: typeof EXT_MESSAGES.INTERNAL_PAGE }
  | {
      action: typeof EXT_MESSAGES.DOWNLOAD;
      filename: string;
      dataUrl: string;
    }
  | { action: typeof EXT_MESSAGES.UNMOUNT };

export const sendMessage = async <T = any>(message: ExtensionMessage): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    browser.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response as T);
      }
    });
  });
};

export const sendMessageToMain = (action: string, payload?: any) => {
  const event = new CustomEvent('EXTENSION_MESSAGE', {
    detail: { action, payload },
    bubbles: true, // important: allow it to escape shadow DOM
    composed: true, // important: allow it to cross shadow boundary
  });

  document.dispatchEvent(event);
};
