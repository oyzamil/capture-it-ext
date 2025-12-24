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
