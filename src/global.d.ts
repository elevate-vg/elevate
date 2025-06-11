// Global type declarations for React Native / Expo environment

declare global {
  var __DEV__: boolean;
}

interface ImportMeta {
  readonly env: {
    readonly DEV?: boolean;
    readonly PROD?: boolean;
    readonly MODE?: string;
  };
}

export {};