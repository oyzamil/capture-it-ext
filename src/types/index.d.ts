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

type OpenPageOptions = {
  current?: boolean;
  active?: boolean;
  newWindow?: boolean;
};

type ResolutionType = (typeof RESOLUTIONS)[number]['value'];
type ResolutionConfigType = (typeof RESOLUTIONS)[number];
type AspectRatioKeyType = keyof typeof ASPECT_CONFIG;
type settingsType = typeof config.SETTINGS;
