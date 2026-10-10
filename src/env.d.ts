/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

/** Provided by electron/preload.cjs when running as the desktop app; undefined in a browser. */
interface Window {
  desktop?: {
    readData(name: 'save' | 'profile'): Promise<string | null>;
    writeData(name: 'save' | 'profile', json: string): Promise<void>;
    deleteData(name: 'save' | 'profile'): Promise<void>;
    quit(): Promise<void>;
  };
}
