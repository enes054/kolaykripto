# ⚡ Hızlı Başlangıç - 5 Dakikada Deploy

## 🎯 En Hızlı Yol (Vercel CLI)

### 1. Backend Deploy (2 dakika)

```bash
# Terminal'i aç
cd server

# Vercel CLI yükle (ilk kez)
npm install -g vercel

# Deploy et
vercel

# Sorulara cevap ver:
# - Set up and deploy? → Y tuşuna bas
# - Link to existing? → N tuşuna bas
# - Project name? → Enter (varsayılan kalsın)
# - Directory? → Enter (./ kalsın)
```

✅ **Backend URL'ini kopyala:** `https://xxx.vercel.app`

### 2. Frontend Hazırla (1 dakika)

```bash
cd frontend

# .env.production dosyası oluştur
echo "VITE_API_URL=https://xxx.vercel.app" > .env.production

# NOT: xxx.vercel.app yerine yukarıdaki backend URL'ini yaz!
```

### 3. Frontend Build (1 dakika)

```bash
npm run build
```

### 4. GitHub Pages'e Push (1 dakika)

```bash
# gh-pages yükle (ilk kez)
npm install -g gh-pages

# Deploy et
gh-pages -d dist
```

### 5. GitHub Ayarları (30 saniye)

1. GitHub repo → Settings → Pages
2. Source: `gh-pages` branch seç
3. Save

✅ **Bitti!** `https://your-username.github.io/repo-name` adresinden erişebilirsin.

---

## 🆘 Hata mı aldın?

### "vercel: command not found"
```bash
npm install -g vercel
```

### "gh-pages: command not found"
```bash
npm install -g gh-pages
```

### Backend URL hatası
- `.env.production` dosyasında URL doğru mu kontrol et
- Backend URL'ini tarayıcıda aç: `https://xxx.vercel.app/health`
- Eğer `{"status":"ok"}` görürsen çalışıyor demektir

---

## 📱 Test Et

1. GitHub Pages URL'ini aç
2. "CANLI" yazısı görünüyor mu?
3. Kripto listesi yükleniyor mu?

Hepsi çalışıyorsa ✅ **BAŞARILI!**

