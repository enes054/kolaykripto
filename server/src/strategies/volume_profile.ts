import { StrategyVote, MarketContext } from './types.js';

export function volumeProfileStrategy(ctx: MarketContext): StrategyVote {
  const { candles, currentPrice } = ctx;
  
  if (candles.length < 20) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'Yetersiz veri',
      tpMult: 2.0,
      slMult: 1.0,
      strategyName: 'Volume Profile',
    };
  }
  
  const recent = candles.slice(-20);
  const avgVolume = recent.reduce((sum, c) => sum + c.volume, 0) / recent.length;
  const currentVolume = candles[candles.length - 1].volume;
  
  const volumeRatio = currentVolume / avgVolume;
  
  // Yüksek hacim + fiyat artışı = AL
  const priceChange = currentPrice - recent[0].close;
  const priceChangePercent = (priceChange / recent[0].close) * 100;
  
  if (volumeRatio > 1.5 && priceChangePercent > 1) {
    return {
      side: 'BUY',
      confidence: Math.min(0.6 + (volumeRatio - 1.5) * 0.2, 0.8),
      reason: `Yüksek hacim + fiyat artışı (${volumeRatio.toFixed(1)}x)`,
      tpMult: 2.5,
      slMult: 1.0,
      strategyName: 'Volume Profile',
    };
  }
  
  if (volumeRatio > 1.5 && priceChangePercent < -1) {
    return {
      side: 'SELL',
      confidence: Math.min(0.6 + (volumeRatio - 1.5) * 0.2, 0.8),
      reason: `Yüksek hacim + fiyat düşüşü (${volumeRatio.toFixed(1)}x)`,
      tpMult: 2.5,
      slMult: 1.0,
      strategyName: 'Volume Profile',
    };
  }
  
  return {
    side: 'HOLD',
    confidence: 0.3,
    reason: `Hacim normal (${volumeRatio.toFixed(1)}x)`,
    tpMult: 2.0,
    slMult: 1.0,
    strategyName: 'Volume Profile',
  };
}

