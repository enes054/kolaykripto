export type SignalSide = 'BUY' | 'SELL' | 'HOLD';

export interface StrategyVote {
  side: SignalSide;
  confidence: number; // 0-1
  reason: string;
  tpMult: number; // TP multiplier (ATR based)
  slMult: number; // SL multiplier (ATR based)
  strategyName: string;
}

export interface MarketContext {
  candles: Array<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    timestamp: number;
  }>;
  currentPrice: number;
  obi?: number;
  takerRatio?: number;
  cvd?: number;
}

