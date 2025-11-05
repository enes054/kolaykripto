import { EMA, RSI } from '../calc/indicators.js';
import { StrategyVote, MarketContext } from './types.js';

export function swingDaily(ctx: MarketContext): StrategyVote {
  const { candles, currentPrice } = ctx;
  
  // Bu strateji günlük verilerle çalışır, ama 1 saatlik verilerle de yaklaşık sonuç verebilir
  if (candles.length < 200) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'Yetersiz veri',
      tpMult: 3.0,
      slMult: 1.5,
      strategyName: 'swing_daily',
    };
  }
  
  const closes = candles.map(c => c.close);
  const ema50 = EMA(closes, 50);
  const ema200 = EMA(closes, 200);
  const rsi = RSI(closes, 14);
  
  if (ema50.length < 1 || ema200.length < 1 || rsi.length < 1) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'İndikatör hesaplanamadı',
      tpMult: 3.0,
      slMult: 1.5,
      strategyName: 'swing_daily',
    };
  }
  
  const ema50Idx = ema50.length - 1;
  const ema200Idx = ema200.length - 1;
  const rsiIdx = rsi.length - 1;
  
  const ema50Val = ema50[ema50Idx];
  const ema200Val = ema200[ema200Idx];
  const rsiVal = rsi[rsiIdx];
  
  const prevEma50 = ema50.length > 1 ? ema50[ema50Idx - 1] : ema50Val;
  const prevEma200 = ema200.length > 1 ? ema200[ema200Idx - 1] : ema200Val;
  
  const goldenCross = ema50Val > ema200Val && prevEma50 <= prevEma200;
  const deathCross = ema50Val < ema200Val && prevEma50 >= prevEma200;
  const uptrend = ema50Val > ema200Val && currentPrice > ema50Val;
  const downtrend = ema50Val < ema200Val && currentPrice < ema50Val;
  
  const rsiOversold = rsiVal < 30;
  const rsiOverbought = rsiVal > 70;
  const rsiNeutral = rsiVal >= 40 && rsiVal <= 60;
  
  if (goldenCross && rsiVal < 70) {
    return {
      side: 'BUY',
      confidence: 0.8,
      reason: `Golden Cross (50/200MA) + RSI ${rsiVal.toFixed(1)}`,
      tpMult: 4.0,
      slMult: 2.0,
      strategyName: 'swing_daily',
    };
  }
  
  if (uptrend && rsiOversold) {
    return {
      side: 'BUY',
      confidence: 0.7,
      reason: `Yükseliş trendi + RSI aşırı satım`,
      tpMult: 3.5,
      slMult: 1.8,
      strategyName: 'swing_daily',
    };
  }
  
  if (deathCross && rsiVal > 30) {
    return {
      side: 'SELL',
      confidence: 0.8,
      reason: `Death Cross (50/200MA) + RSI ${rsiVal.toFixed(1)}`,
      tpMult: 4.0,
      slMult: 2.0,
      strategyName: 'swing_daily',
    };
  }
  
  if (downtrend && rsiOverbought) {
    return {
      side: 'SELL',
      confidence: 0.7,
      reason: `Düşüş trendi + RSI aşırı alım`,
      tpMult: 3.5,
      slMult: 1.8,
      strategyName: 'swing_daily',
    };
  }
  
  if (uptrend && rsiNeutral) {
    return {
      side: 'BUY',
      confidence: 0.5,
      reason: `Yükseliş trendi devam ediyor`,
      tpMult: 3.0,
      slMult: 1.5,
      strategyName: 'swing_daily',
    };
  }
  
  return {
    side: 'HOLD',
    confidence: 0.3,
    reason: 'Swing trendi belirsiz',
    tpMult: 3.0,
    slMult: 1.5,
    strategyName: 'swing_daily',
  };
}

