import { Signal } from '../store/useFeed';
import { formatPrice, formatCommand } from '../core/format';
import RegimeBadge from './RegimeBadge';

interface SignalBoardProps {
  signals: Signal[];
  symbols: string[];
}

export default function SignalBoard({ signals, symbols }: SignalBoardProps) {
  const getLatestSignal = (symbol: string) => {
    return signals.find((s) => s.symbol === symbol && s.action !== 'HOLD');
  };

  const getActionColor = (action: string) => {
    if (action === 'BUY') return 'border-green-500/50 bg-green-500/10';
    if (action === 'SELL') return 'border-red-500/50 bg-red-500/10';
    return 'border-gray-500/50 bg-gray-500/10';
  };

  const getActionTextColor = (action: string) => {
    if (action === 'BUY') return 'text-green-400';
    if (action === 'SELL') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {symbols.map((symbol) => {
        const signal = getLatestSignal(symbol);
        
        if (!signal) {
          return (
            <div
              key={symbol}
              className="p-4 rounded-lg border border-gray-700 bg-slate-800/50"
            >
              <div className="text-lg font-bold text-gray-400">{symbol}</div>
              <div className="text-sm text-gray-500 mt-2">Sinyal bekleniyor...</div>
            </div>
          );
        }

        return (
          <div
            key={symbol}
            className={`p-4 rounded-lg border ${getActionColor(signal.action)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-bold">{symbol}</div>
              <RegimeBadge regime={signal.regime} />
            </div>

            <div className={`text-sm font-mono mb-2 ${getActionTextColor(signal.action)}`}>
              {formatCommand(signal)}
            </div>

            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Güven:</span>
                <span className="text-white font-medium">
                  {Math.round(signal.confidence * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${signal.confidence * 100}%` }}
                />
              </div>
            </div>

            {signal.reasons.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-xs text-gray-400">
                  {signal.reasons.slice(0, 2).join(' | ')}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

