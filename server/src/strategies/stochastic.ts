import { StrategyVote, MarketContext } from './types.js';

export function stochasticStrategy(ctx: MarketContext): StrategyVote {
  const { candles } = ctx;
  
  if (candles.length < 14) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'Yetersiz veri',
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'Stochastic',
    };
  }
  
  const period = 14;
  const recent = candles.slice(-period);
  const high = Math.max(...recent.map(c => c.high));
  const low = Math.min(...recent.map(c => c.low));
  const close = candles[candles.length - 1].close;
  
  if (high === low) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'Stochastic hesaplanamadı',
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'Stochastic',
    };
  }
  
  const k = ((close - low) / (high - low)) * 100;
  
  if (k < 20) {
    return {
      side: 'BUY',
      confidence: 0.65,
      reason: `Stochastic aşırı satım (${k.toFixed(1)})`,
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'Stochastic',
    };
  }
  
  if (k > 80) {
    return {
      side: 'SELL',
      confidence: 0.65,
      reason: `Stochastic aşırı alım (${k.toFixed(1)})`,
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'Stochastic',
    };
  }
  
  return {
    side: 'HOLD',
    confidence: 0.3,
    reason: `Stochastic nötr (${k.toFixed(1)})`,
    tpMult: 2.0,
    slMult: 1.0,
    strategyName: 'Stochastic',
  };
}

