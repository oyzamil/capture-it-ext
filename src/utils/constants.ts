export const LANGUAGES = ['English'] as const;
export const CaptureMessage = {
  CAPTURE_DIV: 'CAPTURE_DIV',
  CUSTOM_CAPTURE: 'CUSTOM_CAPTURE',
} as const;

export type CaptureMessage = (typeof CaptureMessage)[keyof typeof CaptureMessage];
