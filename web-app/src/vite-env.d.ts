/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LIVE_STATUS_URL?: string;
  /** fatal, error, warn, info, debug, trace, or silent. Overrides the default. */
  readonly VITE_LOG_LEVEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
