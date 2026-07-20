/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  /** @deprecated Resume AI goes through Node AI_EXTRACTION_URL */
  readonly VITE_AI_EXTRACTION_URL?: string;
  /** @deprecated Evaluation AI goes through Node AI_EVALUATION_URL */
  readonly VITE_AI_EVALUATION_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
