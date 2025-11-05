import { StrategyVote, MarketContext } from './types.js';

export function microstructure(ctx: MarketContext): StrategyVote {
  const { currentPrice, obi, takerRatio, cvd } = ctx;
  
  if (obi === undefined || takerRatio === undefined || cvd === undefined) {
    return {
      side: 'HOLD',
      confidence: 0,
      reason: 'Mikro yapı verisi yok',
      tpMult: 1.5,
      slMult: 0.5,
      strategyName: 'microstructure',
    };
  }
  
  const obiStrong = obi > 0.3;
  const obiWeak = obi < -0.3;
  const takerBuying = takerRatio > 1.2;
  const takerSelling = takerRatio < 0.8;
  const cvdRising = cvd > 0;
  const cvdFalling = cvd < 0;
  
  const bullishMicro = obiStrong && takerBuying && cvdRising;
  const bearishMicro = obiWeak && takerSelling && cvdFalling;
  
  if (bullishMicro) {
    return {
      side: 'BUY',
      confidence: 0.7,
      reason: `OBI↑ + Taker buy>sell + CVD↑ (scalp long)`,
      tpMult: 1.5,
      slMult: 0.5,
      strategyName: 'microstructure',
    };
  }
  
  if (bearishMicro) {
    return {
      side: 'SELL',
      confidence: 0.7,
      reason: `OBI↓ + Taker sell>buy + CVD↓ (scalp short)`,
      tpMult: 1.5,
      slMult: 0.5,
      strategyName: 'microstructure',
    };
  }
  
  const partialBullish = obiStrong && takerBuying;
  const partialBearish = obiWeak && takerSelling;
  
  if (partialBullish) {
    return {
      side: 'BUY',
      confidence: 0.5,
      reason: `OBI↑ + Taker buy>sell`,
      tpMult: 1.5,
      slMult: 0.5,
      strategyName: 'microstructure',
    };
  }
  
  if (partialBearish) {
    return {
      side: 'SELL',
      confidence: 0.5,
      reason: `OBI↓ + Taker sell>buy`,
      tpMult: 1.5,
      slMult: 0.5,
      strategyName: 'microstructure',
    };
  }
  
  return {
    side: 'HOLD',
    confidence: 0.2,
    reason: 'Mikro yapı nötr',
    tpMult: 1.5,
    slMult: 0.5,
    strategyName: 'microstructure',
  };
}

