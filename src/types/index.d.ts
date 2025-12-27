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

type DeepPartial<T> =
  | Partial<T> // ✅ allow shallow Partial
  | (T extends Function | Date | RegExp ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T);

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasResult {
  blob: Blob;
  dataUrl: string;
}
type Resolution = 'normal' | '2k' | '4k' | '8k';

type OpenPageOptions = {
  /** Replace the current active tab */
  current?: boolean;

  /** Focus the tab after opening */
  active?: boolean;

  /** Open in a new window (optional future use) */
  newWindow?: boolean;
};
