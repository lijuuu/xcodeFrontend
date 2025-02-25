// src/vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_ENVIRONMENT: string;
  readonly VITE_XCODEMICROSERVICEPRODUCTIONURL: string;
  readonly VITE_XCODEMICROSERVICELOCALURL: string;
  readonly VITE_XENGINEPRODUCTIONENGINEURL: string;
  readonly VITE_XENGINELOCALENGINEURL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}