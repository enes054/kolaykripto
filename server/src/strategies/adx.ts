import { ATR } from '../calc/indicators.js';
import { StrategyVote, MarketContext } from './types.js';

function calculateADX(candles: MarketContext['candles'], period: number = 14): number {
  if (candles.length < period * 2) return 0;
  
  const atr = ATR(candles, period);
  if (atr.length < period) return 0;
  
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  
  for (let i = 1; i < candles.length; i++) {
    const upMove = candles[i].high - candles[i - 1].high;
    const downMove = candles[i - 1].low - candles[i].low;
    
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
  }
  
  let plusDI = 0;
  let minusDI = 0;
  
  for (let i = period - 1; i < period + period - 1 && i < plusDM.length; i++) {
    plusDI += plusDM[i] / atr[Math.min(i - period + 1, atr.length - 1)];
    minusDI += minusDM[i] / atr[Math.min(i - period + 1, atr.length - 1)];
  }
  
  plusDI = (plusDI / period) * 100;
  minusDI = (minusDI / period) * 100;
  
  const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
  
  return dx;
}

export function adxStrategy(ctx: MarketContext): StrategyVote {
  const { candles, currentPrice } = ctx;
  
  if (candles.length < 28) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'Yetersiz veri',
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'ADX',
    };
  }
  
  const adx = calculateADX(candles, 14);
  
  if (adx < 25) {
    return {
      side: 'HOLD',
      confidence: 0.2,
      reason: `ADX zayıf trend (${adx.toFixed(1)})`,
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'ADX',
    };
  }
  
  // Trend yönü belirleme
  const recent = candles.slice(-14);
  const trendUp = currentPrice > recent[0].close;
  
  if (trendUp && adx > 25) {
    return {
      side: 'BUY',
      confidence: Math.min(0.6 + (adx - 25) / 50, 0.85),
      reason: `ADX güçlü yükseliş trendi (${adx.toFixed(1)})`,
      tpMult: 3.0,
      slMult: 1.5,
      strategyName: 'ADX',
    };
  }
  
  if (!trendUp && adx > 25) {
    return {
      side: 'SELL',
      confidence: Math.min(0.6 + (adx - 25) / 50, 0.85),
      reason: `ADX güçlü düşüş trendi (${adx.toFixed(1)})`,
      tpMult: 3.0,
      slMult: 1.5,
      strategyName: 'ADX',
    };
  }
  
  return {
    side: 'HOLD',
    confidence: 0.3,
    reason: `ADX belirsiz`,
    tpMult: 2.0,
    slMult: 1.0,
    strategyName: 'ADX',
  };
}

