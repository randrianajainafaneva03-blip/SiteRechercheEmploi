/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_TELEGRAM_BOT_TOKEN: string
    readonly VITE_TELEGRAM_CHAT_ID: string
    readonly VITE_APPWRITE_ENDPOINT: string
    readonly VITE_APPWRITE_PROJECT_ID: string
    readonly VITE_APPWRITE_DATABASE_ID: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }