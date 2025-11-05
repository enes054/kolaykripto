# Deployment Rehberi

## Backend Deployment (Vercel - Önerilen)

### 1. Vercel'e Deploy

```bash
cd server
npm install -g vercel
vercel login
vercel
```

Vercel otomatik olarak:
- Node.js runtime'ı algılayacak
- `vercel.json` dosyasını kullanacak
- Backend'i deploy edecek

### 2. Environment Variables (Gerekirse)

Vercel dashboard'dan environment variables ekleyebilirsiniz (şu an gerek yok).

### 3. Backend URL'ini Alın

Deploy sonrası Vercel size bir URL verecek: `https://your-project.vercel.app`

## Frontend Deployment (GitHub Pages)

### 1. Frontend Config Güncelle

`frontend/.env.production` dosyası oluştur:

```env
VITE_API_URL=https://your-backend-url.vercel.app
```

### 2. Build ve Deploy

```bash
cd frontend
npm run build
```

### 3. GitHub Pages'e Push

```bash
# gh-pages branch'ine build çıktısını push et
npm install -g gh-pages
gh-pages -d dist
```

Veya GitHub Actions kullanarak otomatik deploy yapabilirsiniz.

## Alternatif: Railway/Render

### Railway ile Backend Deploy

1. Railway.app'e kaydol
2. "New Project" → "Deploy from GitHub repo"
3. `server` klasörünü seç
4. Otomatik deploy olacak

### Render ile Backend Deploy

1. Render.com'a kaydol
2. "New Web Service"
3. GitHub repo'yu bağla
4. Root directory: `server`
5. Build command: `npm install && npm run build`
6. Start command: `npm start`

## Önemli Notlar

⚠️ **Backend'i deploy etmeden frontend çalışmaz!**

- Backend lokal çalışıyorsa: `http://localhost:3001`
- Backend deploy edildiyse: Deploy URL'ini kullanın
- Frontend `.env.production` dosyasında backend URL'ini belirtin

## Hızlı Test

Backend deploy edildikten sonra:

```bash
# Backend URL'i test et
curl https://your-backend-url.vercel.app/health

# Sembolleri test et
curl https://your-backend-url.vercel.app/symbols
```

Başarılı olursa frontend'i deploy edebilirsiniz.

