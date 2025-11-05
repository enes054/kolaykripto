import { VWAP, ATR } from '../calc/indicators.js';
import { StrategyVote, MarketContext } from './types.js';

export function vwapBands(ctx: MarketContext): StrategyVote {
  const { candles, currentPrice } = ctx;
  
  if (candles.length < 50) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'Yetersiz veri',
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'vwap_bands',
    };
  }
  
  const vwap = VWAP(candles);
  const atr = ATR(candles, 14);
  
  if (vwap.length < 1 || atr.length < 1) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'VWAP/ATR hesaplanamadı',
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'vwap_bands',
    };
  }
  
  const vwapVal = vwap[vwap.length - 1];
  const atrVal = atr[atr.length - 1];
  
  const upper1 = vwapVal + 1 * atrVal;
  const upper2 = vwapVal + 2 * atrVal;
  const lower1 = vwapVal - 1 * atrVal;
  const lower2 = vwapVal - 2 * atrVal;
  
  const prevCandle = candles[candles.length - 2];
  const prevPrice = prevCandle ? prevCandle.close : currentPrice;
  
  if (currentPrice < lower2 && prevPrice >= lower2) {
    return {
      side: 'BUY',
      confidence: 0.6,
      reason: 'VWAP -2ATR banttan dönüş',
      tpMult: 2.5,
      slMult: 1.0,
      strategyName: 'vwap_bands',
    };
  }
  
  if (currentPrice < lower1 && prevPrice >= lower1 && currentPrice > lower2) {
    return {
      side: 'BUY',
      confidence: 0.5,
      reason: 'VWAP -1ATR banttan dönüş',
      tpMult: 2.0,
      slMult: 0.8,
      strategyName: 'vwap_bands',
    };
  }
  
  if (currentPrice > upper2 && prevPrice <= upper2) {
    return {
      side: 'SELL',
      confidence: 0.6,
      reason: 'VWAP +2ATR banttan dönüş',
      tpMult: 2.5,
      slMult: 1.0,
      strategyName: 'vwap_bands',
    };
  }
  
  if (currentPrice > upper1 && prevPrice <= upper1 && currentPrice < upper2) {
    return {
      side: 'SELL',
      confidence: 0.5,
      reason: 'VWAP +1ATR banttan dönüş',
      tpMult: 2.0,
      slMult: 0.8,
      strategyName: 'vwap_bands',
    };
  }
  
  return {
    side: 'HOLD',
    confidence: 0.2,
    reason: 'VWAP bantları arasında',
    tpMult: 2.0,
    slMult: 1.0,
    strategyName: 'vwap_bands',
  };
}

