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
    aspectRatio: 'aspect-auto',
    bgPattern: 'jigsaw',
    canvasColors: ['#ff40ff', '#fec700'],
    backgroundAngle: '45deg',
    gradientType: 'linear' as 'linear' | 'radial' | 'conic',
    padding: 'p-20',
    position: 'place-items-center',
    rounded: 'rounded-xl',
    roundedWrapper: 'rounded-xl',
    shadow: 'shadow-xl',
    noise: false,
    browserBar: 'hidden',
    quality: '4k' as '4k' | 'normal',
    fileFormat: 'png',
    scale: 'scale-100',
    capturePadding: 10,
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

export type SETTINGS_TYPE = typeof config.SETTINGS;

declare module 'wxt/utils/define-app-config' {
  export interface WxtAppConfig {
    APP: typeof config.APP;
    SETTINGS: typeof config.SETTINGS;
    ROUTES: typeof config.ROUTES;
    GUMROAD: typeof config.GUMROAD;
  }
}
