import { Signal } from '../store/useFeed';
import { formatPrice, formatTimestamp, formatCommand } from '../core/format';

interface LogTableProps {
  signals: Signal[];
}

export default function LogTable({ signals }: LogTableProps) {
  const nonHoldSignals = signals.filter((s) => s.action !== 'HOLD');

  const getActionColor = (action: string) => {
    if (action === 'BUY') return 'text-green-400';
    if (action === 'SELL') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">İşlem Geçmişi</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-2">Zaman</th>
              <th className="text-left p-2">Sembol</th>
              <th className="text-left p-2">Mod</th>
              <th className="text-left p-2">İşlem</th>
              <th className="text-left p-2">Giriş</th>
              <th className="text-left p-2">TP</th>
              <th className="text-left p-2">SL</th>
              <th className="text-left p-2">Güven</th>
            </tr>
          </thead>
          <tbody>
            {nonHoldSignals.slice(0, 50).map((signal, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-800 hover:bg-slate-800/50"
              >
                <td className="p-2 text-gray-400">
                  {formatTimestamp(signal.timestamp)}
                </td>
                <td className="p-2 font-mono">{signal.symbol}</td>
                <td className="p-2">
                  <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs">
                    {signal.mode}
                  </span>
                </td>
                <td className={`p-2 font-bold ${getActionColor(signal.action)}`}>
                  {signal.action}
                </td>
                <td className="p-2 font-mono">{formatPrice(signal.entry)}</td>
                <td className="p-2 font-mono text-green-400">
                  {formatPrice(signal.tp)}
                </td>
                <td className="p-2 font-mono text-red-400">
                  {formatPrice(signal.sl)}
                </td>
                <td className="p-2">{Math.round(signal.confidence * 100)}%</td>
              </tr>
            ))}
            {nonHoldSignals.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  Henüz işlem yok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

