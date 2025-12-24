import 'webext-bridge';

declare module 'webext-bridge' {
  export interface ProtocolMap {
    [EXT_MESSAGES.DOWNLOAD]: { dataUrl: string; filename: string };
  }
}
