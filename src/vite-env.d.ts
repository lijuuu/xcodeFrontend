// src/vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_ENVIRONMENT: string;
  readonly VITE_XENGINEPRODUCTIONURL: string;
  readonly VITE_XENGINELOCALURL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}