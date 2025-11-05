export const config = {
  port: 3001,
  binance: {
    wsBase: 'wss://stream.binance.com:9443/ws/',
    wsCombined: 'wss://stream.binance.com:9443/stream?streams=',
    restBase: 'https://api.binance.com/api/v3/',
  },
  // Semboller artık Binance API'den otomatik çekiliyor
  symbols: [], // Varsayılan boş, runtime'da doldurulacak
  risk: {
    defaultRiskPercent: 1.0,
    maxRiskPercent: 5.0,
    minConfidence: 0.3,
  },
  signals: {
    scalp: { interval: '1s', lookback: 300 },
    intraday: { interval: '1m', lookback: 100 },
    swing: { interval: '1h', lookback: 50 },
  },
  cors: {
    origin: true, // Tüm origin'lere izin (lokal geliştirme için)
    credentials: true,
  },
};

