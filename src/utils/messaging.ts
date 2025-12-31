import { defineExtensionMessaging } from '@webext-core/messaging';

// -----------------------------
// Helper to generate messages
// -----------------------------
const makeMessages = <T extends string>(keys: readonly T[]) => Object.fromEntries(keys.map((k) => [k, k])) as { [K in T]: K };

// -----------------------------
// Capture messages
// -----------------------------
export const CAPTURE_MESSAGES = makeMessages(['CAPTURE_DIV', 'CAPTURE_CUSTOM', 'CAPTURE_TAB', 'CAPTURE_SCREEN'] as const);

// General messages
export const GENERAL_MESSAGES = makeMessages(['SHOW_EDITOR', 'INTERNAL_PAGE', 'DOWNLOAD', 'UNMOUNT', 'NOTIFY', 'OPEN_TAB', 'CREATE_OFFSCREEN', 'CLOSE_OFFSCREEN'] as const);

// -----------------------------
// Combined messages
// -----------------------------
export const EXT_MESSAGES = { ...CAPTURE_MESSAGES, ...GENERAL_MESSAGES } as const;

// -----------------------------
// Types
// -----------------------------
export type CAPTURE_TYPE = (typeof CAPTURE_MESSAGES)[keyof typeof CAPTURE_MESSAGES];
export type EXT_MESSAGES_TYPE = (typeof EXT_MESSAGES)[keyof typeof EXT_MESSAGES];

// -----------------------------
// Send message helper
// -----------------------------
export const sendMessageToMain = (action: EXT_MESSAGES_TYPE, payload?: any) => {
  const event = new CustomEvent('EXTENSION_MESSAGE', {
    detail: { action, payload },
    bubbles: true, // allow escape from shadow DOM
    composed: true, // allow crossing shadow boundary
  });

  document.dispatchEvent(event);
};

// -----------------------------
// Protocol map
// -----------------------------
// IMPORTANT: keys must be **string literals** for TS inference to work
interface ProtocolMap {
  'CAPTURE_DIV'(): void;
  'CAPTURE_CUSTOM'(): void;
  'CAPTURE_TAB'(): { dataUrl: string };
  'CAPTURE_SCREEN'(): void;
  'SHOW_EDITOR'(): void;
  'INTERNAL_PAGE'(): void;
  'DOWNLOAD'(payload: { dataUrl: string; filename: string }): Promise<{ downloadId?: number }>;
  'UNMOUNT'(): void;
  'CREATE_OFFSCREEN'(): void;
  'CLOSE_OFFSCREEN'(payload: { dataUrl?: string }): void;
  'NOTIFY'(payload: { title: string; message: string }): void;
  'OPEN_TAB'(payload: { url: string; options?: OpenPageOptions }): { success: boolean; message: string };
}

// -----------------------------
// Define messaging
// -----------------------------
export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
