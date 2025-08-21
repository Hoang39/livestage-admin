/// <reference types="vite/client" />

interface ImportMetaEnv {
    // Define the environment variables here
    VITE_APP_NAME: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
