import { StrategyVote, MarketContext } from './types.js';

export function williamsRStrategy(ctx: MarketContext): StrategyVote {
  const { candles, currentPrice } = ctx;
  
  if (candles.length < 14) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'Yetersiz veri',
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'Williams %R',
    };
  }
  
  const period = 14;
  const recent = candles.slice(-period);
  const high = Math.max(...recent.map(c => c.high));
  const low = Math.min(...recent.map(c => c.low));
  
  if (high === low) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'Williams %R hesaplanamadı',
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'Williams %R',
    };
  }
  
  const wr = ((high - currentPrice) / (high - low)) * -100;
  
  if (wr < -80) {
    return {
      side: 'BUY',
      confidence: 0.7,
      reason: `Williams %R aşırı satım (${wr.toFixed(1)})`,
      tpMult: 2.5,
      slMult: 1.0,
      strategyName: 'Williams %R',
    };
  }
  
  if (wr > -20) {
    return {
      side: 'SELL',
      confidence: 0.7,
      reason: `Williams %R aşırı alım (${wr.toFixed(1)})`,
      tpMult: 2.5,
      slMult: 1.0,
      strategyName: 'Williams %R',
    };
  }
  
  return {
    side: 'HOLD',
    confidence: 0.3,
    reason: `Williams %R nötr (${wr.toFixed(1)})`,
    tpMult: 2.0,
    slMult: 1.0,
    strategyName: 'Williams %R',
  };
}

