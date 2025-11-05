import { StrategyVote, MarketContext, SignalSide } from '../strategies/types.js';
import { detectRegime, RegimeWeight } from './regime.js';
import { trendBasic } from '../strategies/trend_basic.js';
import { breakoutVol } from '../strategies/breakout_vol.js';
import { bounce200EMA } from '../strategies/bounce_200ema.js';
import { vwapBands } from '../strategies/vwap_bands.js';
import { microstructure } from '../strategies/microstructure.js';
import { swingDaily } from '../strategies/swing_daily.js';
import { rsiStrategy } from '../strategies/rsi_strategy.js';
import { stochasticStrategy } from '../strategies/stochastic.js';
import { adxStrategy } from '../strategies/adx.js';
import { volumeProfileStrategy } from '../strategies/volume_profile.js';
import { williamsRStrategy } from '../strategies/williams_r.js';
import { ATR } from '../calc/indicators.js';
import { calculateTP_SL } from './risk.js';

export interface FinalSignal {
  symbol: string;
  mode: 'scalp' | 'intraday' | 'swing';
  action: SignalSide;
  entry: number;
  tp: number;
  sl: number;
  regime: string;
  confidence: number;
  reasons: string[];
  timestamp: number;
  algorithmVotes: Array<{
    name: string;
    vote: SignalSide;
    confidence: number;
    reason: string;
  }>;
  intensity: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
}

export interface StrategyConfig {
  enabled: boolean;
  weight: number;
}

export interface EnsembleConfig {
  trend_basic: StrategyConfig;
  breakout_vol: StrategyConfig;
  bounce_200ema: StrategyConfig;
  vwap_bands: StrategyConfig;
  microstructure: StrategyConfig;
  swing_daily: StrategyConfig;
  rsi: StrategyConfig;
  stochastic: StrategyConfig;
  adx: StrategyConfig;
  volume_profile: StrategyConfig;
  williams_r: StrategyConfig;
}

const defaultConfig: EnsembleConfig = {
  trend_basic: { enabled: true, weight: 1.0 },
  breakout_vol: { enabled: true, weight: 1.0 },
  bounce_200ema: { enabled: true, weight: 1.0 },
  vwap_bands: { enabled: true, weight: 1.0 },
  microstructure: { enabled: true, weight: 1.0 },
  swing_daily: { enabled: true, weight: 1.0 },
  rsi: { enabled: true, weight: 1.0 },
  stochastic: { enabled: true, weight: 1.0 },
  adx: { enabled: true, weight: 1.0 },
  volume_profile: { enabled: true, weight: 1.0 },
  williams_r: { enabled: true, weight: 1.0 },
};

export function runEnsemble(
  ctx: MarketContext,
  mode: 'scalp' | 'intraday' | 'swing',
  config: EnsembleConfig = defaultConfig
): FinalSignal {
  const votes: StrategyVote[] = [];
  const algorithmVotes: Array<{ name: string; vote: SignalSide; confidence: number; reason: string }> = [];
  
  // Tüm 10 algoritmayı çalıştır
  if (config.trend_basic.enabled && (mode === 'intraday' || mode === 'swing')) {
    const vote = trendBasic(ctx);
    votes.push(vote);
    algorithmVotes.push({ name: vote.strategyName, vote: vote.side, confidence: vote.confidence, reason: vote.reason });
  }
  
  if (config.breakout_vol.enabled && (mode === 'intraday' || mode === 'swing')) {
    const vote = breakoutVol(ctx);
    votes.push(vote);
    algorithmVotes.push({ name: vote.strategyName, vote: vote.side, confidence: vote.confidence, reason: vote.reason });
  }
  
  if (config.bounce_200ema.enabled && (mode === 'intraday' || mode === 'swing')) {
    const vote = bounce200EMA(ctx);
    votes.push(vote);
    algorithmVotes.push({ name: vote.strategyName, vote: vote.side, confidence: vote.confidence, reason: vote.reason });
  }
  
  if (config.vwap_bands.enabled && (mode === 'intraday' || mode === 'swing')) {
    const vote = vwapBands(ctx);
    votes.push(vote);
    algorithmVotes.push({ name: vote.strategyName, vote: vote.side, confidence: vote.confidence, reason: vote.reason });
  }
  
  if (config.microstructure.enabled && (mode === 'scalp' || mode === 'intraday')) {
    const vote = microstructure(ctx);
    votes.push(vote);
    algorithmVotes.push({ name: vote.strategyName, vote: vote.side, confidence: vote.confidence, reason: vote.reason });
  }
  
  if (config.swing_daily.enabled && mode === 'swing') {
    const vote = swingDaily(ctx);
    votes.push(vote);
    algorithmVotes.push({ name: vote.strategyName, vote: vote.side, confidence: vote.confidence, reason: vote.reason });
  }
  
  // Yeni algoritmalar
  if (config.rsi.enabled) {
    const vote = rsiStrategy(ctx);
    votes.push(vote);
    algorithmVotes.push({ name: vote.strategyName, vote: vote.side, confidence: vote.confidence, reason: vote.reason });
  }
  
  if (config.stochastic.enabled) {
    const vote = stochasticStrategy(ctx);
    votes.push(vote);
    algorithmVotes.push({ name: vote.strategyName, vote: vote.side, confidence: vote.confidence, reason: vote.reason });
  }
  
  if (config.adx.enabled && (mode === 'intraday' || mode === 'swing')) {
    const vote = adxStrategy(ctx);
    votes.push(vote);
    algorithmVotes.push({ name: vote.strategyName, vote: vote.side, confidence: vote.confidence, reason: vote.reason });
  }
  
  if (config.volume_profile.enabled) {
    const vote = volumeProfileStrategy(ctx);
    votes.push(vote);
    algorithmVotes.push({ name: vote.strategyName, vote: vote.side, confidence: vote.confidence, reason: vote.reason });
  }
  
  if (config.williams_r.enabled) {
    const vote = williamsRStrategy(ctx);
    votes.push(vote);
    algorithmVotes.push({ name: vote.strategyName, vote: vote.side, confidence: vote.confidence, reason: vote.reason });
  }
  
  // Rejim tespiti
  const regimeWeight = detectRegime(ctx);
  
  // Oy toplama
  let buyScore = 0;
  let sellScore = 0;
  let totalWeight = 0;
  const reasons: string[] = [];
  
  for (const vote of votes) {
    if (vote.side === 'HOLD') continue;
    
    const strategyConfig = config[vote.strategyName as keyof EnsembleConfig] || { enabled: true, weight: 1.0 };
    const voteWeight = vote.confidence * strategyConfig.weight * regimeWeight.weight;
    
    if (vote.side === 'BUY') {
      buyScore += voteWeight;
    } else if (vote.side === 'SELL') {
      sellScore += voteWeight;
    }
    
    totalWeight += voteWeight;
    
    if (vote.confidence > 0.5) {
      reasons.push(`${vote.strategyName}: ${vote.reason}`);
    }
  }
  
  // Nihai karar
  let action: SignalSide = 'HOLD';
  let confidence = 0;
  let avgTPMult = 2.0;
  let avgSLMult = 1.0;
  let intensity: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL' = 'HOLD';
  
  // Algoritma oylarını say
  const buyVotes = algorithmVotes.filter(v => v.vote === 'BUY').length;
  const sellVotes = algorithmVotes.filter(v => v.vote === 'SELL').length;
  const totalVotes = algorithmVotes.length;
  
  if (totalWeight > 0) {
    const buyRatio = buyScore / totalWeight;
    const sellRatio = sellScore / totalWeight;
    
    // Şiddet hesaplama: Algoritma oylarına göre
    const buyPercent = totalVotes > 0 ? (buyVotes / totalVotes) * 100 : 0;
    const sellPercent = totalVotes > 0 ? (sellVotes / totalVotes) * 100 : 0;
    
    if (buyPercent >= 80 || (buyRatio > 0.75 && buyPercent >= 70)) {
      action = 'BUY';
      confidence = buyRatio;
      intensity = 'STRONG_BUY';
    } else if (buyPercent >= 60 || buyRatio > 0.6) {
      action = 'BUY';
      confidence = buyRatio;
      intensity = 'BUY';
    } else if (sellPercent >= 80 || (sellRatio > 0.75 && sellPercent >= 70)) {
      action = 'SELL';
      confidence = sellRatio;
      intensity = 'STRONG_SELL';
    } else if (sellPercent >= 60 || sellRatio > 0.6) {
      action = 'SELL';
      confidence = sellRatio;
      intensity = 'SELL';
    } else {
      action = 'HOLD';
      confidence = Math.max(buyRatio, sellRatio);
      intensity = 'HOLD';
    }
    
    // TP/SL çarpanlarını hesapla
    const relevantVotes = votes.filter(v => v.side === action);
    if (relevantVotes.length > 0) {
      avgTPMult = relevantVotes.reduce((sum, v) => sum + v.tpMult, 0) / relevantVotes.length;
      avgSLMult = relevantVotes.reduce((sum, v) => sum + v.slMult, 0) / relevantVotes.length;
    }
  }
  
  // TP/SL hesapla
  const atr = ATR(ctx.candles, 14);
  const atrVal = atr.length > 0 ? atr[atr.length - 1] : ctx.currentPrice * 0.01;
  
  const riskResult = calculateTP_SL({
    entry: ctx.currentPrice,
    atr: atrVal,
    tpMult: avgTPMult,
    slMult: avgSLMult,
    side: action === 'BUY' ? 'BUY' : 'SELL',
  });
  
  return {
    symbol: 'UNKNOWN', // Symbol çağıran tarafından set edilecek
    mode,
    action,
    entry: riskResult.entry,
    tp: riskResult.tp,
    sl: riskResult.sl,
    regime: `${regimeWeight.regime === 'TREND_UP' ? 'Trend↑' : regimeWeight.regime === 'TREND_DOWN' ? 'Trend↓' : 'Yatay'}`,
    confidence: Math.round(confidence * 100) / 100,
    reasons,
    timestamp: Date.now(),
    algorithmVotes,
    intensity,
  };
}

