import { Signal } from '../store/useFeed';

interface HeatmapProps {
  signals: Signal[];
  symbols: string[];
}

export default function Heatmap({ signals, symbols }: HeatmapProps) {
  const modes: ('scalp' | 'intraday' | 'swing')[] = ['scalp', 'intraday', 'swing'];
  
  const getSignal = (symbol: string, mode: 'scalp' | 'intraday' | 'swing') => {
    return signals.find(
      (s) => s.symbol === symbol && s.mode === mode && s.action !== 'HOLD'
    );
  };

  const getCellColor = (signal: Signal | undefined) => {
    if (!signal) return 'bg-gray-800';
    if (signal.action === 'BUY') {
      return 'bg-green-500';
    }
    if (signal.action === 'SELL') {
      return 'bg-red-500';
    }
    return 'bg-gray-800';
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Durum Izgarası</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left p-2 sticky left-0 bg-slate-900 z-10">Sembol</th>
              {modes.map((mode) => (
                <th key={mode} className="p-2 text-center">
                  {mode}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {symbols.map((symbol) => (
              <tr key={symbol} className="border-b border-gray-800">
                <td className="p-2 font-mono sticky left-0 bg-slate-900 z-10">
                  {symbol}
                </td>
                {modes.map((mode) => {
                  const signal = getSignal(symbol, mode);
                  return (
                    <td
                      key={mode}
                      className={`p-2 text-center ${getCellColor(signal)}`}
                      style={{ opacity: signal ? Math.max(0.5, signal.confidence) : 0.3 }}
                      title={
                        signal
                          ? `${signal.action} - ${Math.round(signal.confidence * 100)}%`
                          : 'Sinyal yok'
                      }
                    >
                      {signal ? signal.action[0] : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

