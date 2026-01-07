import { defineAppConfig } from 'wxt/utils/define-app-config';

export const config = {
  APP: {
    color: '#187b4d',
    font: 'Poppins',
  },
  SETTINGS: {
    theme: 'light' as 'light' | 'dark' | 'system',
    email: null as string | null,
    isLicensed: false,
    licenseModalVisible: false,
    licenseInfo: {
      licenseKey: null,
      subscriptionId: null,
      status: 'inactive',
    },
    base64Image: null as string | null,
    aspectRatio: 'aspect-auto' as AspectRatioKeyType,
    bgPattern: 'jigsaw',
    patternBlendMode: 'mix-blend-soft-light',
    canvasColors: ['#ff40ff', '#fec700'],
    backgroundAngle: '45deg',
    bgOpacity: 1,
    gradientType: 'linear' as 'linear' | 'radial' | 'conic',
    padding: 'p-20',
    position: 'place-items-center',
    imageOrigin: 'origin-center',
    rounded: 'rounded-md',
    roundedWrapper: 'rounded-md',
    shadow: 'shadow-md',
    noise: false,
    windowBar: 'none',
    windowTheme: 'light' as 'light' | 'dark',
    resolution: 'normal' as ResolutionType,
    exportFileFormat: 'png',
    scale: 1,
    captureMargin: 10,
    borderMask: {
      visible: false,
      windowRestricted: false,
      masked: true,
      color: ['#edebeb'],
      borderType: 'dashed',
    },
  },
  ROUTES: {
    HOME: '/',
    LOGIN: '/login',
  },
  GUMROAD: {
    GUMROAD_PRODUCT_ID: '',
    GUMROAD_URL: '',
  },
};

export default defineAppConfig(config);
export type settingsType = typeof config.SETTINGS;

declare module 'wxt/utils/define-app-config' {
  export interface WxtAppConfig {
    APP: typeof config.APP;
    SETTINGS: typeof config.SETTINGS;
    ROUTES: typeof config.ROUTES;
    GUMROAD: typeof config.GUMROAD;
  }
}
