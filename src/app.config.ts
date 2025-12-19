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
    padding: 'p-20',
    position: 'place-items-center',
    rounded: 'rounded-xl',
    roundedWrapper: 'rounded-xl',
    shadow: 'shadow-xl',
    noise: false,
    browserBar: 'hidden',
    resolution: '4k',
    scale: 1,
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

export type AppSettings = typeof config.SETTINGS;

declare module 'wxt/utils/define-app-config' {
  export interface WxtAppConfig {
    APP: typeof config.APP;
    SETTINGS: typeof config.SETTINGS;
    ROUTES: typeof config.ROUTES;
    GUMROAD: typeof config.GUMROAD;
  }
}
