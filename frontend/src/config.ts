// Backend URL - Production'da deploy edilen backend URL'i kullanılacak
// Development: http://localhost:3001
// Production: Backend'in deploy edildiği URL (örn: https://your-backend.vercel.app)

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
  }
}

export const API_BASE_URL = 
  (import.meta.env as ImportMetaEnv).VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001' : 'https://kolaykripto.vercel.app');

