import pkg from '@/../package.json';

export type PackageJson = typeof pkg;
export function readPackageJson(): PackageJson {
  return pkg; // ✔ Browser-safe
}
export function getPackageProp<K extends keyof PackageJson>(prop: K): PackageJson[K] {
  return pkg[prop];
}
export function isDatePassed(dateString: string): boolean {
  // Split the date string
  const [day, month, year] = dateString.split('-').map(Number);

  // Create a date object from the input (month is 0-indexed in JS)
  const inputDate = new Date(year, month - 1, day);

  // Set time to end of day for the input date
  inputDate.setHours(23, 59, 59, 999);

  // Get current date and time
  const currentDate = new Date();

  // Compare the dates
  return inputDate < currentDate;
}
export function hexToRgba(hex: string, opacity?: number, inHex?: boolean): string {
  // Remove '#' if present
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);

  if (opacity !== undefined) {
    if (inHex) {
      // Convert opacity (0-1) to 0-255 hex
      const alpha = Math.round(opacity * 255)
        .toString(16)
        .padStart(2, '0');
      return `#${cleanHex}${alpha}`;
    } else {
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }

  // No opacity, just return original hex
  return hex;
}
export function hexToShade(hex: string, factor = 0.7, inHex = false): string {
  const cleanHex = hex.replace('#', '');

  // Parse RGB
  let r = parseInt(cleanHex.slice(0, 2), 16) / 255;
  let g = parseInt(cleanHex.slice(2, 4), 16) / 255;
  let b = parseInt(cleanHex.slice(4, 6), 16) / 255;

  // Convert RGB to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  // Reduce lightness
  l = l * factor;

  // Convert HSL back to RGB
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0,
    g1 = 0,
    b1 = 0;

  if (h >= 0 && h < 60) [r1, g1, b1] = [c, x, 0];
  else if (h >= 60 && h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h >= 120 && h < 180) [r1, g1, b1] = [0, c, x];
  else if (h >= 180 && h < 240) [r1, g1, b1] = [0, x, c];
  else if (h >= 240 && h < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  const R = Math.round((r1 + m) * 255);
  const G = Math.round((g1 + m) * 255);
  const B = Math.round((b1 + m) * 255);

  if (inHex) {
    return '#' + [R, G, B].map((v) => v.toString(16).padStart(2, '0')).join('');
  } else {
    return `rgb(${R}, ${G}, ${B})`;
  }
}
export const validFilename = (name: string, extension = 'png') => {
  // 1. Trim whitespace
  let filename = name.trim();

  // 2. Replace invalid characters: \ / : * ? " < > |
  filename = filename.replace(/[\\/:*?"<>|]/g, '_');

  // 3. Replace multiple underscores with single underscore
  filename = filename.replace(/_+/g, '_');

  // 4. Append extension if not already present
  if (!filename.toLowerCase().endsWith(`.${extension.toLowerCase()}`)) {
    filename += `.${extension}`;
  }

  return `${i18n.t('appName')}_${Date.now()}_${filename}`;
};
export const getResolution = (resolution: Resolution) => {
  let scale = 1;

  switch (resolution) {
    case '2k':
      scale = 2;
      break;
    case '4k':
      scale = 4;
      break;
    case '8k':
      scale = 8;
      break;
    default:
      scale = 1;
  }

  return scale;
};

export function getScaleFactor(targetResolution: Resolution, cropWidth: number, cropHeight: number): number {
  let targetWidth: number;
  let targetHeight: number;

  switch (targetResolution) {
    case '1k':
      targetWidth = 1024;
      targetHeight = 768;
      break;
    case '2k':
      targetWidth = 2048;
      targetHeight = 1536;
      break;
    case '4k':
      targetWidth = 3840;
      targetHeight = 2160;
      break;
    case '8k':
      targetWidth = 7680;
      targetHeight = 4320;
      break;
    // case '10k':
    //   targetWidth = 10240;
    //   targetHeight = 5760;
    //   break;
    case 'normal':
    default:
      return 1;
  }

  // Calculate scale factor but cap at 2x to avoid huge memory usage
  const scale = Math.min(targetWidth / cropWidth, targetHeight / cropHeight, 2);

  return scale;
}

export async function getCurrentTab(): Promise<Browser.tabs.Tab | null> {
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tabs[0] ?? null;
}
