type DeepPartial<T> = Partial<T> | (T extends Function | Date | RegExp ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T);

type IconType = {
  className?: string;
  stroke?: string;
  style?: React.CSSProperties;
};
interface Point {
  x: number;
  y: number;
}

interface Rect extends Point {
  width: number;
  height: number;
}

interface ElementSelection {
  rect: Rect;
  element: HTMLElement | null;
}

interface CanvasResult {
  blob: Blob;
  dataUrl: string;
}

type Resolution = 'normal' | '1k' | '2k' | '4k' | '8k';
type ExportFormats = 'png' | 'jpg' | 'svg' | 'webp';

type OpenPageOptions = {
  current?: boolean;
  active?: boolean;
  newWindow?: boolean;
};
