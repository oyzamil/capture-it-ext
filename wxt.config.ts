import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import removeConsole from 'vite-plugin-remove-console';
import { defineConfig } from 'wxt';

import toUtf8 from './scripts/vite-plugin-to-utf8';

import { BACKGROUND_PATTERNS } from './patterns';

export function encodeToDataURI(svg: string) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22').replace(/\n/g, '')}")`;
}

function buildPatternCSS() {
  return BACKGROUND_PATTERNS.map((pattern) => {
    const selector = `.pattern-${pattern.name}`;

    if (pattern.svg) {
      return `${selector} {
  background-image: ${encodeToDataURI(pattern.svg)};
  background-repeat: var(--pattern-repeat, repeat);
  background-position: var(--pattern-position, center);
  background-size: var(--pattern-size, auto);
}`;
    }

    if (pattern.css) {
      const cssProps = Object.entries(pattern.css)
        .map(([key, value]) => {
          const kebabKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
          return `${kebabKey}: ${value};`;
        })
        .join('\n  ');

      return `${selector} {
  ${cssProps}
}`;
    }

    return '';
  })
    .filter(Boolean)
    .join('\n\n');
}

// See https://wxt.dev/api/config.html

export default defineConfig({
  modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons', '@wxt-dev/i18n/module'],
  srcDir: 'src',
  autoIcons: {
    baseIconPath: 'assets/icon.svg',
  },
  hooks: {
    'build:manifestGenerated': (wxt, manifest) => {
      const cssOutput = buildPatternCSS();

      const outDir = path.join(wxt.config.root, 'src/assets');
      const outFile = path.join(outDir, 'patterns.css');

      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      fs.writeFileSync(outFile, cssOutput);
    },
  },
  vite: (configEnv: { mode: string }) => ({
    plugins: configEnv.mode === 'production' ? [removeConsole({ includes: ['log'] }), tailwindcss()] : [toUtf8(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      // Disable compression for easier debugging
      minify: configEnv.mode === 'production',
      sourcemap: false,
    },
  }),
  manifest: ({ browser, manifestVersion, mode, command }) => {
    const manifestBase: any = {
      name: '__MSG_appFullName__',
      description: '__MSG_appDescription__',
      default_locale: 'en',
      permissions: ['activeTab', 'tabs', 'storage', 'notifications', 'downloads', 'offscreen', 'debugger'],
      host_permissions: ['<all_urls>'],
      web_accessible_resources: [
        {
          resources: ['fonts/*'],
          matches: ['<all_urls>'],
        },
      ],
    };
    if (browser === 'firefox') {
      manifestBase.browser_specific_settings = {
        gecko: {
          id: import.meta.env.WXT_FIREFOX_EXTENSION_ID,
        },
      };
    }
    if (mode === 'development') {
      manifestBase.key =
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1gIStuzmtlJx9myPcEdZVB6fN6HZ4RDB2FNbhhhd1Q8kopHP3uZioJmGAbZch13CNg4nwDLzkT/Iv+SuQ92r6wEYf14rwv0pyLvegLlTWcKvpG+XfJXMl0AT32Gj2tuOoMceEpNRXZzcPf2QTftX4Lm3Kzv3kmeaIzHps1ajkT18iagllKExzmiQVZjCw/t8NYcY5cdjKQRhQqDTDqv5HnVanucEWmDPMb+AlyHOqAYxDurSt/IX1C5TW/khkCU8Fahcnw50ppVgIVKT7OLtSKDDNlqbC4BWIFWu55S5UR/CZNEbyjDtxzLkfVTi8sov7ZOUCTjEvRwjNmwXbo8PZwIDAQAB';
    }

    return manifestBase;
  },
});
