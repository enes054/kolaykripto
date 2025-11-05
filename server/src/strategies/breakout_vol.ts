import { BollingerBands, ATR } from '../calc/indicators.js';
import { StrategyVote, MarketContext } from './types.js';

export function breakoutVol(ctx: MarketContext): StrategyVote {
  const { candles, currentPrice } = ctx;
  
  if (candles.length < 50) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'Yetersiz veri',
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'breakout_vol',
    };
  }
  
  const closes = candles.map(c => c.close);
  const volumes = candles.map(c => c.volume);
  
  const bb = BollingerBands(closes, 20, 2);
  const atr = ATR(candles, 14);
  
  if (bb.width.length < 2 || atr.length < 2 || volumes.length < 10) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'İndikatör hesaplanamadı',
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'breakout_vol',
    };
  }
  
  const bbIdx = bb.width.length - 1;
  const atrIdx = atr.length - 1;
  const volIdx = volumes.length - 1;
  
  const currentBBWidth = bb.width[bbIdx];
  const prevBBWidth = bb.width[Math.max(0, bbIdx - 1)];
  const avgBBWidth = bb.width.slice(Math.max(0, bbIdx - 10), bbIdx + 1).reduce((a, b) => a + b, 0) / Math.min(11, bb.width.length);
  
  const currentATR = atr[atrIdx];
  const prevATR = atr[Math.max(0, atrIdx - 1)];
  const avgATR = atr.slice(Math.max(0, atrIdx - 10), atrIdx + 1).reduce((a, b) => a + b, 0) / Math.min(11, atr.length);
  
  const currentVol = volumes[volIdx];
  const avgVol = volumes.slice(Math.max(0, volIdx - 20), volIdx + 1).reduce((a, b) => a + b, 0) / Math.min(21, volumes.length);
  
  const compression = currentBBWidth < avgBBWidth * 0.8 && currentATR < avgATR * 0.8;
  const volumeSpike = currentVol > avgVol * 1.5;
  
  const upperBand = bb.upper[bbIdx];
  const lowerBand = bb.lower[bbIdx];
  
  if (compression && volumeSpike && currentPrice > upperBand) {
    return {
      side: 'BUY',
      confidence: 0.7,
      reason: `BB sıkışma + hacim kırılım yukarı`,
      tpMult: 3.0,
      slMult: 1.0,
      strategyName: 'breakout_vol',
    };
  }
  
  if (compression && volumeSpike && currentPrice < lowerBand) {
    return {
      side: 'SELL',
      confidence: 0.7,
      reason: `BB sıkışma + hacim kırılım aşağı`,
      tpMult: 3.0,
      slMult: 1.0,
      strategyName: 'breakout_vol',
    };
  }
  
  return {
    side: 'HOLD',
    confidence: 0.2,
    reason: 'Kırılım yok',
    tpMult: 2.0,
    slMult: 1.0,
    strategyName: 'breakout_vol',
  };
}

