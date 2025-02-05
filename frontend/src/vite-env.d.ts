/// <reference types="svelte" />
/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_URL_PREFIX: string
    readonly VITE_API_PREFIX: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}