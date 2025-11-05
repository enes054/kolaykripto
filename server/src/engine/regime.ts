import { ichimokuRegime, RegimeType } from '../strategies/ichimoku_regime.js';
import { MarketContext } from '../strategies/types.js';

export interface RegimeWeight {
  regime: RegimeType;
  strength: number;
  weight: number; // 0-1, rejime göre ağırlıklandırma
}

export function detectRegime(ctx: MarketContext): RegimeWeight {
  const regimeInfo = ichimokuRegime(ctx);
  
  let weight = 1.0;
  
  if (regimeInfo.regime === 'TREND_UP') {
    weight = 0.8 + regimeInfo.strength * 0.2; // Trend yukarıda daha agresif
  } else if (regimeInfo.regime === 'TREND_DOWN') {
    weight = 0.8 + regimeInfo.strength * 0.2; // Trend aşağıda daha agresif
  } else {
    weight = 0.5 + regimeInfo.strength * 0.3; // Ranging'de daha dikkatli
  }
  
  return {
    regime: regimeInfo.regime,
    strength: regimeInfo.strength,
    weight: Math.min(1.0, weight),
  };
}

export function getRegimeLabel(regime: RegimeType): string {
  switch (regime) {
    case 'TREND_UP':
      return 'Trend↑';
    case 'TREND_DOWN':
      return 'Trend↓';
    case 'RANGING':
      return 'Yatay';
    default:
      return 'Belirsiz';
  }
}

