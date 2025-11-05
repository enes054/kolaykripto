import { Signal } from '../store/useFeed';
import { formatCommand } from '../core/format';

interface SignalTickerProps {
  signal: Signal;
}

export default function SignalTicker({ signal }: SignalTickerProps) {
  const getActionColor = () => {
    if (signal.action === 'BUY') return 'text-green-400';
    if (signal.action === 'SELL') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className={`p-2 font-mono text-sm ${getActionColor()}`}>
      {formatCommand(signal)}
    </div>
  );
}

