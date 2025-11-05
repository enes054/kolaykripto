import { useState, useMemo } from 'react';
import { Signal } from '../store/useFeed';
import { formatPrice } from '../core/format';

interface CryptoTableProps {
  signals: Signal[];
  prices: Map<string, { price: number; change24h: number; volume: number; high24h?: number; low24h?: number }>;
  symbols: string[];
}

export default function CryptoTable({ signals, prices, symbols }: CryptoTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'volume' | 'change' | 'price' | 'symbol'>('volume');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'buy' | 'sell' | 'hold'>('all');

  const getLatestSignal = (symbol: string): Signal | undefined => {
    return signals
      .filter((s) => s.symbol === symbol && s.action !== 'HOLD')
      .sort((a, b) => b.timestamp - a.timestamp)[0];
  };

  const filteredAndSortedSymbols = useMemo(() => {
    let filtered = symbols.filter((symbol) => {
      // Arama filtresi
      if (searchTerm && !symbol.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Sinyal filtresi
      if (filterBy !== 'all') {
        const signal = getLatestSignal(symbol);
        if (filterBy === 'buy' && signal?.action !== 'BUY') return false;
        if (filterBy === 'sell' && signal?.action !== 'SELL') return false;
        if (filterBy === 'hold' && signal?.action !== undefined) return false;
      }

      return true;
    });

    // Sıralama
    filtered.sort((a, b) => {
      const priceA = prices.get(a);
      const priceB = prices.get(b);

      let comparison = 0;

      switch (sortBy) {
        case 'volume':
          comparison = (priceB?.volume || 0) - (priceA?.volume || 0);
          break;
        case 'change':
          comparison = (priceB?.change24h || 0) - (priceA?.change24h || 0);
          break;
        case 'price':
          comparison = (priceB?.price || 0) - (priceA?.price || 0);
          break;
        case 'symbol':
          comparison = a.localeCompare(b);
          break;
      }

      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return filtered;
  }, [symbols, searchTerm, sortBy, sortOrder, filterBy, signals, prices]);

  const getActionBadge = (signal: Signal | undefined) => {
    if (!signal) {
      return (
        <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 font-bold text-sm border border-gray-500/50">
          ⚪ BEKLE
        </span>
      );
    }
    
    const intensity = signal.intensity || 'HOLD';
    
    if (intensity === 'STRONG_BUY') {
      return (
        <span className="px-3 py-1 rounded-full bg-green-600 text-white font-bold text-sm border-2 border-green-400 shadow-lg shadow-green-500/50">
          🔥 ŞİDDETLE AL
        </span>
      );
    }
    if (intensity === 'BUY') {
      return (
        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-bold text-sm border border-green-500/50">
          🔵 AL
        </span>
      );
    }
    if (intensity === 'STRONG_SELL') {
      return (
        <span className="px-3 py-1 rounded-full bg-red-600 text-white font-bold text-sm border-2 border-red-400 shadow-lg shadow-red-500/50">
          🔥 ŞİDDETLE SAT
        </span>
      );
    }
    if (intensity === 'SELL') {
      return (
        <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-bold text-sm border border-red-500/50">
          🔴 SAT
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 font-bold text-sm border border-gray-500/50">
        ⚪ BEKLE
      </span>
    );
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div>
      {/* Filtre ve Arama Çubuğu */}
      <div className="p-4 bg-slate-800 border-b border-gray-700 sticky top-0 z-20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Kripto ara (örn: BTC, ETH, SOL)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterBy('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterBy === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setFilterBy('buy')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterBy === 'buy' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              🔵 AL
            </button>
            <button
              onClick={() => setFilterBy('sell')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterBy === 'sell' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              🔴 SAT
            </button>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-400">
          {filteredAndSortedSymbols.length} / {symbols.length} kripto gösteriliyor
        </div>
      </div>

      {/* Tablo */}
      <div className="overflow-x-auto max-h-[calc(100vh-300px)]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-800 z-10">
            <tr className="border-b border-gray-700">
              <th 
                className="text-left p-3 sticky left-0 bg-slate-800 z-10 cursor-pointer hover:bg-slate-700"
                onClick={() => handleSort('symbol')}
              >
                Sembol {sortBy === 'symbol' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="text-right p-3 cursor-pointer hover:bg-slate-700"
                onClick={() => handleSort('price')}
              >
                Fiyat {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="text-right p-3 cursor-pointer hover:bg-slate-700"
                onClick={() => handleSort('change')}
              >
                24s Değişim {sortBy === 'change' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="text-right p-3 cursor-pointer hover:bg-slate-700"
                onClick={() => handleSort('volume')}
              >
                Hacim {sortBy === 'volume' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-center p-3">EMİR</th>
              <th className="text-right p-3">Giriş</th>
              <th className="text-right p-3">Kar Al (TP)</th>
              <th className="text-right p-3">Zarar Dur (SL)</th>
              <th className="text-center p-3">Güven</th>
              <th className="text-left p-3">Açıklama</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedSymbols.map((symbol) => {
              const priceData = prices.get(symbol);
              const signal = getLatestSignal(symbol);
              const displayPrice = priceData?.price || 0;
              const change24h = priceData?.change24h || 0;
              const volume = priceData?.volume || 0;

              return (
                <tr
                  key={symbol}
                  className={`border-b border-gray-800 hover:bg-slate-800/50 ${
                    signal?.action === 'BUY' ? 'bg-green-500/5' : signal?.action === 'SELL' ? 'bg-red-500/5' : ''
                  }`}
                >
                  <td className="p-3 font-bold sticky left-0 bg-slate-900 z-10">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base">{symbol.replace('USDT', '')}</span>
                      <span className="text-xs text-gray-500">USDT</span>
                    </div>
                  </td>
                  
                  <td className="p-3 text-right font-mono font-bold">
                    {displayPrice > 0 ? formatPrice(displayPrice) : '-'}
                  </td>
                  
                  <td className={`p-3 text-right font-mono font-bold ${getChangeColor(change24h)}`}>
                    {change24h !== 0 ? `${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%` : '-'}
                  </td>
                  
                  <td className="p-3 text-right font-mono text-gray-400">
                    {volume > 0 ? `$${(volume / 1000000).toFixed(1)}M` : '-'}
                  </td>
                  
                  <td className="p-3 text-center">
                    {getActionBadge(signal)}
                  </td>
                  
                  <td className="p-3 text-right font-mono">
                    {signal ? formatPrice(signal.entry) : '-'}
                  </td>
                  
                  <td className="p-3 text-right font-mono text-green-400">
                    {signal ? formatPrice(signal.tp) : '-'}
                  </td>
                  
                  <td className="p-3 text-right font-mono text-red-400">
                    {signal ? formatPrice(signal.sl) : '-'}
                  </td>
                  
                  <td className="p-3 text-center">
                    {signal ? (
                      <div className="flex flex-col items-center">
                        <span className="font-bold">{Math.round(signal.confidence * 100)}%</span>
                        <div className="w-16 bg-gray-700 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${signal.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  
                  <td className="p-3 text-left text-xs text-gray-400 max-w-xs">
                    {signal ? (
                      <div>
                        <div className="font-medium text-white mb-1">
                          {signal.intensity === 'STRONG_BUY' 
                            ? `🔥 ŞİDDETLE AL: ${symbol.replace('USDT', '')} @ ${formatPrice(signal.entry)}` 
                            : signal.intensity === 'BUY'
                            ? `🟢 AL: ${symbol.replace('USDT', '')} @ ${formatPrice(signal.entry)}`
                            : signal.intensity === 'STRONG_SELL'
                            ? `🔥 ŞİDDETLE SAT: ${symbol.replace('USDT', '')} @ ${formatPrice(signal.entry)}`
                            : signal.intensity === 'SELL'
                            ? `🔴 SAT: ${symbol.replace('USDT', '')} @ ${formatPrice(signal.entry)}`
                            : '⚪ BEKLE'}
                        </div>
                        {signal.action !== 'HOLD' && (
                          <div className="text-gray-500">
                            TP: {formatPrice(signal.tp)} | SL: {formatPrice(signal.sl)}
                          </div>
                        )}
                        {signal.algorithmVotes && signal.algorithmVotes.length > 0 && (
                          <div className="text-gray-600 mt-1 text-xs">
                            Algoritmalar: {signal.algorithmVotes.filter(v => v.vote === signal.action).length}/{signal.algorithmVotes.length} {signal.action === 'BUY' ? 'AL' : signal.action === 'SELL' ? 'SAT' : 'BEKLE'} öneriyor
                          </div>
                        )}
                      </div>
                    ) : (
                      'Sinyal bekleniyor...'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
