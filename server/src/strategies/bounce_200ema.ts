import { EMA } from '../calc/indicators.js';
import { StrategyVote, MarketContext } from './types.js';

export function bounce200EMA(ctx: MarketContext): StrategyVote {
  const { candles, currentPrice, obi } = ctx;
  
  if (candles.length < 200) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'Yetersiz veri',
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'bounce_200ema',
    };
  }
  
  const closes = candles.map(c => c.close);
  const ema200 = EMA(closes, 200);
  
  if (ema200.length < 1) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'EMA200 hesaplanamadı',
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'bounce_200ema',
    };
  }
  
  const ema200Val = ema200[ema200.length - 1];
  const distance = Math.abs(currentPrice - ema200Val) / ema200Val;
  const percentDistance = distance * 100;
  
  const recentCandle = candles[candles.length - 1];
  const hasWick = recentCandle.low < ema200Val && recentCandle.close > ema200Val;
  const hasWickDown = recentCandle.high > ema200Val && recentCandle.close < ema200Val;
  
  if (percentDistance < 0.5 && hasWick && currentPrice > ema200Val) {
    const obiPositive = obi !== undefined && obi > 0.2;
    
    return {
      side: 'BUY',
      confidence: obiPositive ? 0.65 : 0.5,
      reason: `200EMA yakınında iğne + dönüş${obiPositive ? ' + OBI pozitif' : ''}`,
      tpMult: 2.0,
      slMult: 0.8,
      strategyName: 'bounce_200ema',
    };
  }
  
  if (percentDistance < 0.5 && hasWickDown && currentPrice < ema200Val) {
    const obiNegative = obi !== undefined && obi < -0.2;
    
    return {
      side: 'SELL',
      confidence: obiNegative ? 0.65 : 0.5,
      reason: `200EMA yakınında iğne + dönüş${obiNegative ? ' + OBI negatif' : ''}`,
      tpMult: 2.0,
      slMult: 0.8,
      strategyName: 'bounce_200ema',
    };
  }
  
  return {
    side: 'HOLD',
    confidence: 0.2,
    reason: '200EMA yakınında değil',
    tpMult: 2.0,
    slMult: 1.0,
    strategyName: 'bounce_200ema',
  };
}

