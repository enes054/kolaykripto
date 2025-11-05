import { useEffect, useState } from 'react';
import { useFeedStore } from '../store/useFeed';
import { useSettingsStore } from '../store/useSettings';
import { usePriceStore } from '../store/usePrices';
import CryptoTable from '../components/CryptoTable';
import { API_BASE_URL } from '../config';

export default function Home() {
  const { signals, isConnected, connect } = useFeedStore();
  const { setSymbols } = useSettingsStore();
  const { prices, updatePrice } = usePriceStore();
  const [allSymbols, setAllSymbols] = useState<string[]>([]);

  useEffect(() => {
    // Tüm sembolleri Binance'den otomatik yükle
    const loadSymbols = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/symbols`);
        const data = await res.json();
        
        if (data.symbols && data.symbols.length > 0) {
          setAllSymbols(data.symbols);
          // En yüksek hacimli 100 tanesini sinyal için seç (WebSocket limiti)
          const topSymbols = data.symbols.slice(0, 100);
          setSymbols(topSymbols);
          connect(topSymbols, ['intraday']); // Sadece intraday modu kullan
        }
      } catch (error) {
        console.error('Sembol yükleme hatası:', error);
      }
    };
    
    loadSymbols();
    
    // Her 5 dakikada bir sembolleri yenile (yeni coinler eklenebilir)
    const interval = setInterval(loadSymbols, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fiyatları periyodik olarak güncelle
    const interval = setInterval(() => {
      fetch(`${API_BASE_URL}/ticker`)
        .then((res) => res.json())
        .then((data) => {
          if (data.tickers) {
            data.tickers.forEach((ticker: any) => {
              updatePrice(ticker.symbol, {
                price: ticker.price,
                change24h: ticker.change24h,
                volume: ticker.volume,
                timestamp: ticker.timestamp,
              });
            });
          }
        })
        .catch((err) => console.error('Fiyat güncelleme hatası:', err));
    }, 5000); // Her 5 saniyede bir güncelle

    return () => clearInterval(interval);
  }, []);

  const buySignals = signals.filter((s) => s.action === 'BUY').length;
  const sellSignals = signals.filter((s) => s.action === 'SELL').length;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white">🚀 Kripto Al-Sat Konsolu</h1>
          <p className="text-sm text-gray-400 mt-1">Binance'den otomatik - Anlık fiyatlar ve algoritma sinyalleri</p>
        </div>

        <div className="mb-4 flex items-center gap-4 flex-wrap">
          <div className={`px-3 py-1 rounded-lg font-medium ${isConnected ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
            {isConnected ? '● CANLI' : '○ Bağlı Değil'}
          </div>
          <div className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/50">
            🔵 AL: {buySignals}
          </div>
          <div className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/50">
            🔴 SAT: {sellSignals}
          </div>
          <div className="px-3 py-1 rounded-lg bg-gray-500/20 text-gray-400 border border-gray-500/50">
            📊 Toplam: {allSymbols.length} Kripto (Binance'den otomatik)
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-gray-700 overflow-hidden">
          <CryptoTable signals={signals} prices={prices} symbols={allSymbols} />
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          ⚠️ Bu uygulama yatırım tavsiyesi değildir. Sadece eğitim ve test amaçlıdır.
        </div>
      </div>
    </div>
  );
}

