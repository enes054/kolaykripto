# 🚀 Deployment - Adım Adım Rehber

## Seçenek 1: Vercel ile Backend (En Kolay - Önerilen)

### Adım 1: Vercel Hesabı Oluştur
1. https://vercel.com adresine git
2. "Sign Up" butonuna tıkla
3. GitHub hesabınla giriş yap (önerilen)

### Adım 2: Backend'i Deploy Et

**Yöntem A: Vercel CLI ile (Terminal)**

```bash
# Vercel CLI'yi yükle
npm install -g vercel

# Server klasörüne git
cd server

# Vercel'e giriş yap
vercel login

# Deploy et
vercel

# Sorulara cevap ver:
# - Set up and deploy? Y
# - Which scope? (GitHub kullanıcı adını seç)
# - Link to existing project? N
# - Project name? (kripto-sinyal-backend veya istediğin isim)
# - Directory? ./
# - Override settings? N
```

Deploy tamamlandıktan sonra bir URL alacaksın: `https://your-project.vercel.app`

**Yöntem B: Vercel Web Sitesi ile (Daha Kolay)**

1. https://vercel.com/dashboard adresine git
2. "Add New..." → "Project" butonuna tıkla
3. GitHub repo'nu seç (veya "Import Git Repository")
4. **Root Directory** ayarını `server` olarak değiştir
5. **Framework Preset:** "Other" seç
6. **Build Command:** `npm run build` bırak
7. **Output Directory:** `dist` yaz
8. **Install Command:** `npm install` bırak
9. "Deploy" butonuna tıkla

### Adım 3: Backend URL'ini Kopyala

Deploy tamamlandıktan sonra:
- Vercel dashboard'da projenin üstüne tıkla
- "Domains" bölümünden URL'i kopyala
- Örnek: `https://kripto-sinyal-backend.vercel.app`

### Adım 4: Backend URL'ini Test Et

Tarayıcıda şu adresi aç:
```
https://your-backend-url.vercel.app/health
```

Eğer `{"status":"ok","timestamp":...}` görürsen, backend çalışıyor! ✅

---

## Seçenek 2: Railway ile Backend (Alternatif)

1. https://railway.app adresine git
2. "Start a New Project" → "Deploy from GitHub repo"
3. GitHub repo'nu seç
4. **Root Directory:** `server` olarak ayarla
5. Deploy otomatik başlayacak
6. URL'i al: `https://your-project.up.railway.app`

---

## Adım 5: Frontend'i Hazırla

### 5.1: Environment Dosyası Oluştur

`frontend` klasöründe `.env.production` dosyası oluştur:

```bash
cd frontend
```

Dosya içeriği (`.env.production`):
```env
VITE_API_URL=https://your-backend-url.vercel.app
```

**ÖNEMLİ:** `your-backend-url.vercel.app` yerine kendi backend URL'ini yaz!

### 5.2: Frontend'i Build Et

```bash
cd frontend
npm run build
```

Build başarılı olursa `frontend/dist` klasörü oluşacak.

---

## Adım 6: Frontend'i GitHub Pages'e Deploy Et

### Yöntem A: GitHub Actions ile (Otomatik - Önerilen)

1. GitHub repo'nda `.github/workflows` klasörü oluştur
2. `deploy.yml` dosyası oluştur:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm install
      
      - name: Build
        run: |
          cd frontend
          echo "VITE_API_URL=https://your-backend-url.vercel.app" > .env.production
          npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/dist
```

3. GitHub repo Settings → Secrets → Actions
4. `VITE_API_URL` adında bir secret ekle
5. Değer olarak backend URL'ini yaz: `https://your-backend-url.vercel.app`
6. Main branch'e push yap, otomatik deploy başlayacak

### Yöntem B: Manuel (gh-pages)

```bash
cd frontend

# gh-pages paketini yükle
npm install -g gh-pages

# Build et
npm run build

# Deploy et
gh-pages -d dist
```

### Yöntem C: GitHub Pages Ayarları

1. GitHub repo → Settings → Pages
2. Source: "Deploy from a branch" seç
3. Branch: `gh-pages` / `root` seç
4. Save

---

## Adım 7: Frontend URL'ini Ayarla

GitHub Pages deploy olduktan sonra:
- URL: `https://your-username.github.io/repo-name`

Frontend bu URL'den çalışacak ve backend'e bağlanacak.

---

## ✅ Test Et

1. Frontend URL'ini aç
2. "CANLI" yazısını görüyor musun? ✅
3. Kripto listesi yükleniyor mu? ✅
4. Fiyatlar geliyor mu? ✅

Eğer "Bağlı Değil" görüyorsan:
- Backend URL'ini kontrol et
- Browser console'da hata var mı bak (F12)
- Backend `/health` endpoint'i çalışıyor mu test et

---

## 🆘 Sorun Giderme

### Backend çalışmıyor
- Vercel dashboard'da "Deployments" sekmesine bak
- Logs'da hata var mı kontrol et
- `/health` endpoint'ini test et

### Frontend backend'e bağlanamıyor
- `.env.production` dosyasında URL doğru mu?
- CORS hatası varsa: Backend'de CORS ayarları kontrol et
- Browser console'da hata mesajı var mı?

### CORS Hatası
Backend'de zaten CORS açık, ama yine de kontrol et:
```typescript
// server/src/config.ts
cors: {
  origin: true, // Tüm origin'lere izin ver
  credentials: true,
}
```

---

## 📝 Özet

1. ✅ Vercel'e kaydol
2. ✅ Backend'i deploy et (server klasörü)
3. ✅ Backend URL'ini al
4. ✅ Frontend'de `.env.production` oluştur
5. ✅ Frontend'i build et
6. ✅ GitHub Pages'e deploy et
7. ✅ Test et!

**Toplam süre: ~10-15 dakika**

