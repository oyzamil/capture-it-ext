export const EXPORT_FILE_FORMATS = ['png', 'jpg', 'svg', 'webp'];
export const RESOLUTIONS = [
  {
    label: 'Normal',
    value: 'normal',
    scaleFactor: 1,
    width: 1024,
    height: 1024,
  },
  {
    label: '1K',
    value: '1k',
    scaleFactor: 1,
    width: 1024,
    height: 1024,
  },
  {
    label: '2K',
    value: '2k',
    scaleFactor: 2,
    width: 2048,
    height: 2048,
  },
  {
    label: '4K',
    value: '4k',
    scaleFactor: 4,
    width: 4096,
    height: 4096,
  },
  {
    label: '8K',
    value: '8k',
    scaleFactor: 8,
    width: 8192,
    height: 8192,
  },
];
export const GRADIENT_PRESETS = [
  {
    label: 'Default Gradients',
    defaultOpen: true,
    colors: [
      [
        { color: '#f9a8d4', percent: 0 },
        { color: '#fed7aa', percent: 50 },
        { color: '#fca5a5', percent: 100 },
      ],
      [
        { color: '#86efac', percent: 0 },
        { color: '#fef08a', percent: 50 },
        { color: '#bbf7d0', percent: 100 },
      ],
      [
        { color: '#bbf7d0', percent: 0 },
        { color: '#bfdbfe', percent: 50 },
        { color: '#93c5fd', percent: 100 },
      ],
      [
        { color: '#c7d2fe', percent: 0 },
        { color: '#60a5fa', percent: 50 },
        { color: '#8b5cf6', percent: 100 },
      ],
      [
        { color: '#fca5a5', percent: 0 },
        { color: '#fdba74', percent: 50 },
        { color: '#fde68a', percent: 100 },
      ],
      [
        { color: '#f9a8d4', percent: 0 },
        { color: '#f472b6', percent: 50 },
        { color: '#f87171', percent: 100 },
      ],
      [
        { color: '#94a3b8', percent: 0 },
        { color: '#6b7280', percent: 50 },
        { color: '#374151', percent: 100 },
      ],
      [
        { color: '#fdba74', percent: 0 },
        { color: '#fb923c', percent: 50 },
        { color: '#f87171', percent: 100 },
      ],
      [
        { color: '#5eead4', percent: 0 },
        { color: '#22d3ee', percent: 100 },
      ],
      [
        { color: '#f87171', percent: 0 },
        { color: '#9333ea', percent: 100 },
      ],
      [
        { color: '#af6dff', percent: 0 },
        { color: '#ffebaa', percent: 100 },
      ],
      [
        { color: hexToShade(useAppConfig().APP.color, 10, true), percent: 0 },
        { color: useAppConfig().APP.color, percent: 100 },
      ],
    ],
  },
  {
    label: 'Default Colors',
    defaultOpen: true,
    colors: ['#ffffff', '#afafaf', useAppConfig().APP.color, '#F44336', '#1E88E5', '#FDD835', '#7a00cc'],
  },
];
export const ASPECT_CONFIG = {
  'aspect-auto': {
    label: 'Auto',
    className: 'w-full h-auto',
  },
  'aspect-square': {
    label: '1:1 — Square',
    className: 'w-[640px] h-[640px]',
  },
  'aspect-video': {
    label: '16:9 — Video',
    className: 'w-[1138px] h-[640px]',
  },
  'aspect-[9/16]': {
    label: '9:16 — Mobile / Story',
    className: 'w-[360px] h-[640px]',
  },
  'aspect-[1280/800]': {
    label: 'Extension Thumbnail',
    className: 'w-[1024px] h-[640px]',
  },
  'aspect-[440/280]': {
    label: 'Chrome Promo Tile',
    className: 'w-[1006px] h-[640px]',
  },
  'aspect-[4/5]': {
    label: '4:5 — Instagram Portrait',
    className: 'w-[512px] h-[640px]',
  },
  'aspect-[4/3]': {
    label: '4:3 — Classic',
    className: 'w-[853px] h-[640px]',
  },
  'aspect-[3/2]': {
    label: '3:2 — Photography',
    className: 'w-[960px] h-[640px]',
  },
  'aspect-21/9': {
    label: '21:9 — Ultrawide',
    className: 'max-w-[1493px] max-h-[640px] w-full h-full',
  },
};
export const ROUNDED_SIZES = [
  { value: 'rounded-none', label: 'None' },
  { value: 'rounded-lg', label: 'Small' },
  { value: 'rounded-xl', label: 'Medium' },
  { value: 'rounded-3xl', label: 'Large' },
];
export const SHADOWS = [
  { value: 'shadow-none', label: 'None' },
  { value: 'shadow-lg', label: 'Small' },
  { value: 'shadow-xl', label: 'Medium' },
  { value: 'shadow-2xl', label: 'Large' },
];
export const BACKGROUND_GRADIENT_ANGLES = [
  { direction: 'To top left', angle: 315 },
  { direction: 'To top', angle: 0 },
  { direction: 'To top right', angle: 45 },

  { direction: 'To left', angle: 270 },
  { direction: 'Center', angle: 0, disabled: true },
  { direction: 'To right', angle: 90 },

  { direction: 'To bottom left', angle: 225 },
  { direction: 'To bottom', angle: 180 },
  { direction: 'To bottom right', angle: 135 },
];
export const BACKGROUND_GRADIENT_TYPES = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' },
  { value: 'conic', label: 'Conic' },
];
export const BACKGROUND_BLEND_MODES = [
  { value: 'mix-blend-normal', label: 'Normal' },
  { value: 'mix-blend-multiply', label: 'Multiply' },
  { value: 'mix-blend-screen', label: 'Screen' },
  { value: 'mix-blend-overlay', label: 'Overlay' },
  { value: 'mix-blend-darken', label: 'Darken' },
  { value: 'mix-blend-lighten', label: 'Lighten' },
  { value: 'mix-blend-color-dodge', label: 'Color Dodge' },
  { value: 'mix-blend-color-burn', label: 'Color Burn' },
  { value: 'mix-blend-hard-light', label: 'Hard Light' },
  { value: 'mix-blend-soft-light', label: 'Soft Light' },
  { value: 'mix-blend-difference', label: 'Difference' },
  { value: 'mix-blend-exclusion', label: 'Exclusion' },
  { value: 'mix-blend-hue', label: 'Hue' },
  { value: 'mix-blend-saturation', label: 'Saturation' },
  { value: 'mix-blend-color', label: 'Color' },
  { value: 'mix-blend-luminosity', label: 'Luminosity' },
];
export const WINDOW_THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];
export const PADDING_SIZES = [
  { value: 'p-0', label: 'None' },
  { value: 'p-10', label: 'Small' },
  { value: 'p-20', label: 'Medium' },
  { value: 'p-32', label: 'Large' },
];
export const POSITIONS_CONFIG = [
  // Top
  { label: 'Top left', align: 'place-items-start justify-items-start', origin: 'origin-top-left' },
  { label: 'Top center', align: 'place-items-start justify-items-center', origin: 'origin-top' },
  { label: 'Top right', align: 'place-items-start justify-items-end', origin: 'origin-top-right' },

  // Center
  { label: 'Center left', align: 'place-items-center justify-items-start', origin: 'origin-left' },
  { label: 'Center', align: 'place-items-center', origin: 'origin-center' },
  { label: 'Center right', align: 'place-items-center justify-items-end', origin: 'origin-right' },

  // Bottom
  { label: 'Bottom left', align: 'place-items-end justify-items-start', origin: 'origin-bottom-left' },
  { label: 'Bottom center', align: 'place-items-end justify-items-center', origin: 'origin-bottom' },
  { label: 'Bottom right', align: 'place-items-end justify-items-end', origin: 'origin-bottom-right' },
];
