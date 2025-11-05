export function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatCommand(signal: {
  action: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  entry: number;
  tp: number;
  sl: number;
  regime: string;
}): string {
  if (signal.action === 'HOLD') {
    return 'HOLD';
  }
  
  const action = signal.action === 'BUY' ? 'AL' : 'SAT';
  return `${action}: ${signal.symbol} @ ${formatPrice(signal.entry)} | TP ${formatPrice(signal.tp)} | SL ${formatPrice(signal.sl)} | Rejim: ${signal.regime}`;
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('tr-TR');
}

