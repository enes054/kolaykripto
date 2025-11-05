// Backend URL - Production'da deploy edilen backend URL'i kullanılacak
// Development: http://localhost:3001
// Production: Backend'in deploy edildiği URL (örn: https://your-backend.vercel.app)

export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001' : 'https://your-backend-url.vercel.app');

