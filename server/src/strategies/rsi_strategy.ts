import { RSI } from '../calc/indicators.js';
import { StrategyVote, MarketContext } from './types.js';

export function rsiStrategy(ctx: MarketContext): StrategyVote {
  const { candles, currentPrice } = ctx;
  
  if (candles.length < 30) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'Yetersiz veri',
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'RSI',
    };
  }
  
  const closes = candles.map(c => c.close);
  const rsi = RSI(closes, 14);
  
  if (rsi.length < 1) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'RSI hesaplanamadı',
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'RSI',
    };
  }
  
  const rsiVal = rsi[rsi.length - 1];
  
  if (rsiVal < 30) {
    return {
      side: 'BUY',
      confidence: 0.7,
      reason: `RSI aşırı satım (${rsiVal.toFixed(1)})`,
      tpMult: 2.5,
      slMult: 1.0,
      strategyName: 'RSI',
    };
  }
  
  if (rsiVal > 70) {
    return {
      side: 'SELL',
      confidence: 0.7,
      reason: `RSI aşırı alım (${rsiVal.toFixed(1)})`,
      tpMult: 2.5,
      slMult: 1.0,
      strategyName: 'RSI',
    };
  }
  
  return {
    side: 'HOLD',
    confidence: 0.3,
    reason: `RSI nötr (${rsiVal.toFixed(1)})`,
    tpMult: 2.0,
    slMult: 1.0,
    strategyName: 'RSI',
  };
}

