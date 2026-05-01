declare module '*.png';
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GPT_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
