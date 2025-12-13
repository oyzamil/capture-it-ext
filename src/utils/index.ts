import pkg from '@/../package.json';
import { StoreApi } from 'zustand';
import { StateStorage } from 'zustand/middleware';

// Custom browser.storage.local wrapper
export const browserStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return new Promise((resolve) => {
      browser.storage.local.get([name], (result) => {
        resolve(result[name] ? JSON.stringify(result[name]) : null);
      });
    });
  },
  setItem: async (name: string, value: string): Promise<void> => {
    return new Promise((resolve) => {
      browser.storage.local.set({ [name]: JSON.parse(value) }, () => resolve());
    });
  },
  removeItem: async (name: string): Promise<void> => {
    return new Promise((resolve) => {
      browser.storage.local.remove([name], () => resolve());
    });
  },
};

// Utility: sync a Zustand store with browser.storage.local
export function syncStoreWithBrowserStorage<T extends object>(store: StoreApi<T>, storageKey: string) {
  // Listen for external changes in browser.storage.local
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes[storageKey]) {
      const newValue = changes[storageKey].newValue;
      if (newValue?.state) {
        store.setState(newValue.state);
      }
    }
  });
}

export type PackageJson = typeof pkg;

export function readPackageJson(): PackageJson {
  return pkg; // ✔ Browser-safe
}

export function getPackageProp<K extends keyof PackageJson>(prop: K): PackageJson[K] {
  return pkg[prop];
}
