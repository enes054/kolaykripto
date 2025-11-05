# 🎯 Başlangıç Rehberi - Türkçe

## 🚀 Hızlı Deploy (5 Dakika)

### 1️⃣ Backend'i Deploy Et

**Vercel Web Sitesi Üzerinden (En Kolay):**

1. https://vercel.com adresine git
2. "Sign Up" butonuna tıkla (GitHub ile giriş yap)
3. "Add New..." → "Project" butonuna tıkla
4. GitHub repo'nu seç (veya "Import Git Repository")
5. ⚠️ **ÖNEMLİ:** "Root Directory" kısmına `server` yaz
6. "Deploy" butonuna tıkla
7. ⏳ 1-2 dakika bekle
8. ✅ Deploy tamamlandığında URL'i kopyala: `https://xxx.vercel.app`

**Backend URL'ini Test Et:**
Tarayıcıda şu adresi aç: `https://xxx.vercel.app/health`

Eğer `{"status":"ok","timestamp":...}` görürsen, backend çalışıyor! ✅

---

### 2️⃣ Frontend'i Hazırla

**2.1: Environment Dosyası Oluştur**

`frontend` klasöründe `.env.production` dosyası oluştur:

```bash
cd frontend
```

Dosya içeriği:
```
VITE_API_URL=https://xxx.vercel.app
```

**⚠️ ÖNEMLİ:** `xxx.vercel.app` yerine yukarıda aldığın backend URL'ini yaz!

**2.2: Build Et**

```bash
npm run build
```

**2.3: GitHub Pages'e Deploy Et**

**Yöntem A: gh-pages ile (Kolay)**

```bash
# gh-pages yükle (ilk kez)
npm install -g gh-pages

# Deploy et
gh-pages -d dist
```

**Yöntem B: GitHub Web Sitesi**

1. GitHub repo → Settings → Pages
2. Source: "Deploy from a branch" seç
3. Branch: `gh-pages` seç (veya `main` branch'inden `dist` klasörü)
4. Save

---

### 3️⃣ Test Et

1. GitHub Pages URL'ini aç: `https://your-username.github.io/repo-name`
2. "CANLI" yazısı görünüyor mu? ✅
3. Kripto listesi yükleniyor mu? ✅
4. Fiyatlar geliyor mu? ✅

---

## 🆘 Sorun mu var?

### Backend çalışmıyor
- Vercel dashboard'da "Deployments" sekmesine bak
- Logs'da hata var mı kontrol et
- `/health` endpoint'ini test et

### Frontend "Bağlı Değil" diyor
- `.env.production` dosyasında URL doğru mu?
- Backend URL'ini tarayıcıda aç: `https://xxx.vercel.app/health`
- Browser console'da hata var mı bak (F12 tuşu)

### CORS Hatası
- Backend'de CORS ayarları zaten açık
- Eğer hala sorun varsa, Vercel dashboard'da environment variables kontrol et

---

## 📝 Özet Checklist

- [ ] Vercel hesabı oluştur
- [ ] Backend'i deploy et (server klasörü)
- [ ] Backend URL'ini kopyala
- [ ] Frontend'de `.env.production` oluştur
- [ ] Backend URL'ini `.env.production`'a yaz
- [ ] Frontend'i build et (`npm run build`)
- [ ] GitHub Pages'e deploy et (`gh-pages -d dist`)
- [ ] GitHub Pages ayarlarını yap
- [ ] Test et!

**Toplam süre: ~10 dakika**

---

## 🎉 Başarılı!

Eğer her şey çalışıyorsa:
- ✅ Binance'den otomatik kripto listesi geliyor
- ✅ Anlık fiyatlar güncelleniyor
- ✅ 10 algoritma sinyal üretiyor
- ✅ "ŞİDDETLE AL/SAT" önerileri görünüyor

**Harika! Projen hazır! 🚀**

