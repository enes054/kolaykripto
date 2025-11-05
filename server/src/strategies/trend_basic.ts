import { EMA, MACD, Supertrend } from '../calc/indicators.js';
import { StrategyVote, MarketContext } from './types.js';

export function trendBasic(ctx: MarketContext): StrategyVote {
  const { candles, currentPrice } = ctx;
  
  if (candles.length < 200) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'Yetersiz veri',
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'trend_basic',
    };
  }
  
  const closes = candles.map(c => c.close);
  const ema20 = EMA(closes, 20);
  const ema50 = EMA(closes, 50);
  const ema200 = EMA(closes, 200);
  
  if (ema20.length < 1 || ema50.length < 1 || ema200.length < 1) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'EMA hesaplanamadı',
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'trend_basic',
    };
  }
  
  const macd = MACD(closes, 12, 26, 9);
  const supertrend = Supertrend(candles, 10, 3.0);
  
  const idx = candles.length - 1;
  const ema20Idx = ema20.length - 1;
  const ema50Idx = ema50.length - 1;
  const ema200Idx = ema200.length - 1;
  
  const ema20Val = ema20[ema20Idx];
  const ema50Val = ema50[ema50Idx];
  const ema200Val = ema200[ema200Idx];
  
  const trendUp = ema20Val > ema50Val && ema50Val > ema200Val;
  const trendDown = ema20Val < ema50Val && ema50Val < ema200Val;
  
  let macdBullish = false;
  if (macd.histogram.length > 0) {
    const histIdx = macd.histogram.length - 1;
    const prevHistIdx = Math.max(0, histIdx - 1);
    macdBullish = macd.histogram[histIdx] > macd.histogram[prevHistIdx] && macd.histogram[histIdx] > 0;
  }
  
  let supertrendLong = false;
  if (supertrend.direction.length > 0) {
    supertrendLong = supertrend.direction[supertrend.direction.length - 1] === 1;
  }
  
  if (trendUp && macdBullish && supertrendLong && currentPrice > ema20Val) {
    return {
      side: 'BUY',
      confidence: 0.75,
      reason: `EMA20>50>200 + MACD↑ + Supertrend long`,
      tpMult: 2.5,
      slMult: 1.2,
      strategyName: 'trend_basic',
    };
  }
  
  if (trendDown && !macdBullish && !supertrendLong && currentPrice < ema20Val) {
    return {
      side: 'SELL',
      confidence: 0.75,
      reason: `EMA20<50<200 + MACD↓ + Supertrend short`,
      tpMult: 2.5,
      slMult: 1.2,
      strategyName: 'trend_basic',
    };
  }
  
  return {
    side: 'HOLD',
    confidence: 0.3,
    reason: 'Trend belirsiz',
    tpMult: 2.0,
    slMult: 1.0,
    strategyName: 'trend_basic',
  };
}

