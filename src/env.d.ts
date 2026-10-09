/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

/** Provided by electron/preload.cjs when running as the desktop app; undefined in a browser. */
interface Window {
  desktop?: {
    loadSave(): Promise<string | null>;
    writeSave(json: string): Promise<void>;
    deleteSave(): Promise<void>;
    quit(): Promise<void>;
  };
}
