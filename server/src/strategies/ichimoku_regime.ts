import { Ichimoku, EMA } from '../calc/indicators.js';
import { StrategyVote, MarketContext } from './types.js';

export type RegimeType = 'TREND_UP' | 'TREND_DOWN' | 'RANGING';

export interface RegimeInfo {
  regime: RegimeType;
  strength: number; // 0-1
  reason: string;
}

export function ichimokuRegime(ctx: MarketContext): RegimeInfo {
  const { candles, currentPrice } = ctx;
  
  if (candles.length < 52) {
    return {
      regime: 'RANGING',
      strength: 0,
      reason: 'Yetersiz veri',
    };
  }
  
  const ichimoku = Ichimoku(candles, 9, 26, 52);
  const closes = candles.map(c => c.close);
  const ema50 = EMA(closes, 50);
  
  if (ichimoku.cloudTop.length < 1 || ema50.length < 1) {
    return {
      regime: 'RANGING',
      strength: 0,
      reason: 'İndikatör hesaplanamadı',
    };
  }
  
  const cloudTop = ichimoku.cloudTop[ichimoku.cloudTop.length - 1];
  const cloudBottom = ichimoku.cloudBottom[ichimoku.cloudBottom.length - 1];
  const ema50Val = ema50[ema50.length - 1];
  
  const aboveCloud = currentPrice > cloudTop;
  const belowCloud = currentPrice < cloudBottom;
  const inCloud = currentPrice >= cloudBottom && currentPrice <= cloudTop;
  const aboveEMA50 = currentPrice > ema50Val;
  
  const cloudThickness = (cloudTop - cloudBottom) / cloudBottom;
  const priceDistance = aboveCloud 
    ? (currentPrice - cloudTop) / cloudTop 
    : belowCloud 
    ? (cloudBottom - currentPrice) / cloudBottom 
    : 0;
  
  let regime: RegimeType = 'RANGING';
  let strength = 0;
  let reason = '';
  
  if (aboveCloud && aboveEMA50) {
    regime = 'TREND_UP';
    strength = Math.min(0.5 + priceDistance * 10, 0.9);
    reason = `Fiyat bulutun üstünde + EMA50 üstünde`;
  } else if (belowCloud && !aboveEMA50) {
    regime = 'TREND_DOWN';
    strength = Math.min(0.5 + priceDistance * 10, 0.9);
    reason = `Fiyat bulutun altında + EMA50 altında`;
  } else if (inCloud) {
    regime = 'RANGING';
    strength = 0.3;
    reason = `Fiyat bulut içinde`;
  } else {
    regime = 'RANGING';
    strength = 0.4;
    reason = `Karışık sinyal`;
  }
  
  return { regime, strength, reason };
}

// Bu strateji tek başına sinyal vermez, sadece rejim bilgisi verir
export function ichimokuRegimeStrategy(ctx: MarketContext): StrategyVote {
  const regimeInfo = ichimokuRegime(ctx);
  
  return {
    side: 'HOLD',
    confidence: regimeInfo.strength,
    reason: regimeInfo.reason,
    tpMult: 2.0,
    slMult: 1.0,
    strategyName: 'ichimoku_regime',
  };
}

