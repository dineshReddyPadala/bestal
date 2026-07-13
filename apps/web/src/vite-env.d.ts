/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AI_EXTRACTION_URL?: string;
  readonly VITE_AI_EVALUATION_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
