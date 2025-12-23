type StyleObject = Partial<CSSStyleDeclaration>;

interface ApplyStyles {
  root?: string;
  anchor?: StyleObject;
  anchorParent?: StyleObject;
  shadowHost?: StyleObject;
  uiContainer?: StyleObject;
}
interface CreateAndMountUI {
  anchor: string;
  position?: 'inline' | 'overlay' | 'modal';
  children: ReactNode;
  id?: string;
  style?: ApplyStyles;
}
type ProfileData = {
  profiles: string[];
  lastInteracted: Record<string, number>;
};
type DeepPartial<T> =
  | Partial<T> // ✅ allow shallow Partial
  | (T extends Function | Date | RegExp ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T);

type Language = (typeof LANGUAGES)[number];
type Providers = (typeof PROVIDERS)[number];
type ResType = (typeof RES_TYPES)[number];
type ResTone = (typeof RES_TONES)[number];

type ExtensionMessage = { action: EXT_MESSAGES.DOWNLOAD; fileName: string; blob: Blob } | { action: EXT_MESSAGES.CAPTURE_VISIBLE } | { action: EXT_MESSAGES.COPY; blob: Blob };

declare module 'dom-to-image-more' {
  import domToImage = require('dom-to-image-more');
  export = domToImage;
}
