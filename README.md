# 🚀 Özel Kripto Sinyal Konsolu

> **🔥 EN DETAYLI REHBER (Sıfırdan Başlayanlar İçin):** `COK_DETAYLI_REHBER.md` dosyasını açın!  
> **Hızlı Başlangıç için:** `HIZLI_BASLA.md` dosyasına bakın!  
> **Detaylı Rehber için:** `DEPLOY_ADIM_ADIM.md` dosyasına bakın!

Binance canlı verilerinden teknik analiz tabanlı sinyal üreten konsol uygulaması. Saniyelik (scalp), 1-5 dakika (intraday) ve 4 saat-1 gün (swing) periyotlarında otomatik sinyal üretir.

## Özellikler

- 🚀 **Canlı Veri**: Binance WebSocket üzerinden gerçek zamanlı veri akışı
- 📊 **7 Strateji Modülü**: Trend, breakout, bounce, VWAP, Ichimoku, mikro yapı ve swing stratejileri
- 🎯 **Ansamble Motoru**: Çoklu stratejinin oy toplama sistemi ile güvenilir sinyaller
- 📈 **Rejim Tespiti**: Trend yönü ve gücüne göre sinyal ağırlıklandırma
- 💰 **Risk Yönetimi**: ATR tabanlı TP/SL hesaplama ve position sizing
- 🎨 **Modern UI**: React + TypeScript + Tailwind ile responsive arayüz
- 📡 **SSE Feed**: Server-Sent Events ile canlı sinyal akışı

## Mimari

### Backend (Node.js + Fastify + TypeScript)
- WebSocket yönetimi ve veri tamponu
- İndikatör hesaplama (EMA, RSI, ATR, BB, VWAP, MACD, Supertrend, Ichimoku)
- Mikro yapı analizi (OBI, Taker Buy/Sell Ratio, CVD)
- Strateji motoru ve ansamble sistemi
- SSE endpoint'i

### Frontend (Vite + React + TypeScript)
- Zustand ile state yönetimi
- Recharts ile görselleştirme (opsiyonel)
- Tailwind CSS ile modern UI
- Real-time sinyal gösterimi

## Kurulum

### Lokal Geliştirme

**Backend:**
```bash
cd server
npm install
npm run dev
```

Backend `http://localhost:3001` adresinde çalışacaktır.

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:5173` adresinde çalışacaktır.

### Production Deployment

⚠️ **Önemli:** Frontend'i yayınlamadan önce backend'i deploy etmeniz gerekir!

**1. Backend'i Deploy Edin (Vercel/Railway/Render)**

```bash
cd server
vercel  # Vercel için
```

Backend URL'ini alın: `https://your-backend.vercel.app`

**2. Frontend Config**

`frontend/.env.production` dosyası oluşturun:

```env
VITE_API_URL=https://your-backend-url.vercel.app
```

**3. Frontend Build**

```bash
cd frontend
npm run build
```

**4. GitHub Pages'e Deploy**

Detaylı deployment rehberi için `README_DEPLOY.md` dosyasına bakın.

## Kullanım

1. Backend'i başlatın (lokal)
2. Frontend'i başlatın veya GitHub Pages'de host edin
3. Ayarlar panelinden sembol ve mod seçin
4. Canlı sinyalleri izleyin

### Sinyal Formatı

Sinyaller şu formatta üretilir:

```
AL: BTCUSDT @ 67,420 | TP 68,130 | SL 66,750 | Rejim: Trend↑
SAT: ETHUSDT @ 3,420 | TP 3,355 | SL 3,468 | Rejim: Zayıf↑
```

## Stratejiler

### 1. Trend Basic
EMA (20/50/200) + MACD + Supertrend kombinasyonu ile trend takibi

### 2. Breakout Vol
Bollinger Bands sıkışması + hacim kırılımı ile breakout tespiti

### 3. Bounce 200EMA
200 EMA yakınında iğne ve dönüş sinyalleri

### 4. VWAP Bands
VWAP ± ATR bantlarından dönüş sinyalleri

### 5. Ichimoku Regime
Ichimoku bulutu ile rejim tespiti (yalnız başına sinyal vermez, ağırlıklandırır)

### 6. Microstructure
Order Book Imbalance + Taker Ratio + CVD ile kısa vadeli scalp sinyalleri

### 7. Swing Daily
50/200 MA golden/death cross + RSI bölgeleri ile swing sinyalleri

## API Endpoints

### GET /sse
Server-Sent Events ile canlı sinyal akışı

**Query Parameters:**
- `symbols`: Virgülle ayrılmış sembol listesi (örn: `BTCUSDT,ETHUSDT`)
- `modes`: Virgülle ayrılmış mod listesi (örn: `scalp,intraday,swing`)

**Örnek:**
```
GET /sse?symbols=BTCUSDT,ETHUSDT&modes=intraday,swing
```

### GET /health
Sağlık kontrolü

### POST /backtest
Backtest çalıştırma (geliştirme aşamasında)

### GET /symbols
Desteklenen sembol listesi

## Güvenlik Notu

⚠️ **Bu uygulama sadece eğitim ve test amaçlıdır. Yatırım tavsiyesi değildir.**

- Backend lokal çalışır ve dış dünyaya açık değildir
- Gerçek emir göndermez, sadece sinyal üretir
- Üretilen sinyaller yatırım kararı için kullanılmamalıdır

## Geliştirme

### Backend Yapısı

```
server/
├── src/
│   ├── feed/          # Binance WebSocket entegrasyonu
│   ├── calc/          # İndikatör ve mikro yapı hesaplamaları
│   ├── strategies/    # Strateji modülleri
│   ├── engine/        # Ansamble motoru, rejim, risk
│   ├── sse.ts         # SSE endpoint
│   ├── api.ts         # API routes
│   └── index.ts       # Ana dosya
```

### Frontend Yapısı

```
frontend/
├── src/
│   ├── components/    # UI bileşenleri
│   ├── pages/         # Sayfalar
│   ├── store/         # Zustand store'ları
│   ├── core/          # Yardımcı fonksiyonlar
│   └── App.tsx        # Ana uygulama
```

## Lisans

MIT

## İletişim

Sorularınız için issue açabilirsiniz.

