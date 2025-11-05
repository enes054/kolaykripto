import { ATR } from '../calc/indicators.js';
import { OHLCV } from '../calc/indicators.js';

export interface RiskParams {
  entry: number;
  atr: number;
  tpMult: number;
  slMult: number;
  side: 'BUY' | 'SELL';
}

export interface RiskResult {
  entry: number;
  tp: number;
  sl: number;
  riskReward: number;
}

export function calculateTP_SL(params: RiskParams): RiskResult {
  const { entry, atr, tpMult, slMult, side } = params;
  
  let tp: number;
  let sl: number;
  
  if (side === 'BUY') {
    tp = entry + atr * tpMult;
    sl = entry - atr * slMult;
  } else {
    tp = entry - atr * tpMult;
    sl = entry + atr * slMult;
  }
  
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp - entry);
  const riskReward = risk > 0 ? reward / risk : 0;
  
  return { entry, tp, sl, riskReward };
}

export function calculatePositionSize(
  accountBalance: number,
  riskPercent: number,
  entry: number,
  sl: number
): number {
  const riskAmount = accountBalance * (riskPercent / 100);
  const riskPerUnit = Math.abs(entry - sl);
  
  if (riskPerUnit === 0) return 0;
  
  return riskAmount / riskPerUnit;
}

export interface TrailingStopParams {
  currentPrice: number;
  entry: number;
  highestPrice: number;
  lowestPrice: number;
  atr: number;
  side: 'BUY' | 'SELL';
  trailingATRMult: number;
}

export function calculateTrailingStop(params: TrailingStopParams): number {
  const { currentPrice, entry, highestPrice, lowestPrice, atr, side, trailingATRMult } = params;
  
  if (side === 'BUY') {
    const trail = highestPrice - atr * trailingATRMult;
    return Math.max(trail, entry * 0.98); // Minimum %2 stop
  } else {
    const trail = lowestPrice + atr * trailingATRMult;
    return Math.min(trail, entry * 1.02); // Maximum %2 stop
  }
}

