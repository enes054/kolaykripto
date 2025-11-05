export interface OHLCV {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export function EMA(data: number[], period: number): number[] {
  if (data.length < period) return [];
  
  const multiplier = 2 / (period + 1);
  const ema: number[] = [];
  
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  ema[period - 1] = sum / period;
  
  for (let i = period; i < data.length; i++) {
    ema[i] = (data[i] - ema[i - 1]) * multiplier + ema[i - 1];
  }
  
  return ema;
}

export function WEMA(data: number[], period: number): number[] {
  if (data.length < period) return [];
  
  const wema: number[] = [];
  let sum = 0;
  let weightSum = 0;
  
  for (let i = 0; i < period; i++) {
    const weight = period - i;
    sum += data[i] * weight;
    weightSum += weight;
  }
  wema[period - 1] = sum / weightSum;
  
  const multiplier = 2 / (period + 1);
  for (let i = period; i < data.length; i++) {
    wema[i] = (data[i] - wema[i - 1]) * multiplier + wema[i - 1];
  }
  
  return wema;
}

export function RSI(data: number[], period: number = 14): number[] {
  if (data.length < period + 1) return [];
  
  const rsi: number[] = [];
  const changes: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1]);
  }
  
  let avgGain = 0;
  let avgLoss = 0;
  
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) avgGain += changes[i];
    else avgLoss += Math.abs(changes[i]);
  }
  
  avgGain /= period;
  avgLoss /= period;
  
  if (avgLoss === 0) {
    rsi[period] = 100;
  } else {
    const rs = avgGain / avgLoss;
    rsi[period] = 100 - (100 / (1 + rs));
  }
  
  for (let i = period + 1; i < data.length; i++) {
    const change = changes[i - 1];
    avgGain = (avgGain * (period - 1) + (change > 0 ? change : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (change < 0 ? Math.abs(change) : 0)) / period;
    
    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = 100 - (100 / (1 + rs));
    }
  }
  
  return rsi;
}

export function ATR(candles: OHLCV[], period: number = 14): number[] {
  if (candles.length < period + 1) return [];
  
  const tr: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const hl = candles[i].high - candles[i].low;
    const hc = Math.abs(candles[i].high - candles[i - 1].close);
    const lc = Math.abs(candles[i].low - candles[i - 1].close);
    tr.push(Math.max(hl, hc, lc));
  }
  
  const atr: number[] = [];
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += tr[i];
  }
  atr[period - 1] = sum / period;
  
  for (let i = period; i < tr.length; i++) {
    atr[i] = (atr[i - 1] * (period - 1) + tr[i]) / period;
  }
  
  return atr;
}

export function BollingerBands(
  data: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number[]; middle: number[]; lower: number[]; width: number[] } {
  if (data.length < period) {
    return { upper: [], middle: [], lower: [], width: [] };
  }
  
  const sma: number[] = [];
  const upper: number[] = [];
  const lower: number[] = [];
  const width: number[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    const avg = sum / period;
    sma.push(avg);
    
    let variance = 0;
    for (let j = 0; j < period; j++) {
      variance += Math.pow(data[i - j] - avg, 2);
    }
    const std = Math.sqrt(variance / period);
    
    upper.push(avg + stdDev * std);
    lower.push(avg - stdDev * std);
    width.push((upper[upper.length - 1] - lower[lower.length - 1]) / avg);
  }
  
  return { upper, middle: sma, lower, width };
}

export function VWAP(candles: OHLCV[]): number[] {
  const vwap: number[] = [];
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;
  
  for (const candle of candles) {
    const typicalPrice = (candle.high + candle.low + candle.close) / 3;
    cumulativeTPV += typicalPrice * candle.volume;
    cumulativeVolume += candle.volume;
    
    if (cumulativeVolume > 0) {
      vwap.push(cumulativeTPV / cumulativeVolume);
    } else {
      vwap.push(typicalPrice);
    }
  }
  
  return vwap;
}

export function MACD(
  data: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEMA = EMA(data, fastPeriod);
  const slowEMA = EMA(data, slowPeriod);
  
  if (fastEMA.length < slowPeriod || slowEMA.length < slowPeriod) {
    return { macd: [], signal: [], histogram: [] };
  }
  
  const macd: number[] = [];
  const startIdx = slowPeriod - 1;
  
  for (let i = startIdx; i < fastEMA.length && i < slowEMA.length; i++) {
    macd.push(fastEMA[i] - slowEMA[i]);
  }
  
  const signal = EMA(macd, signalPeriod);
  const histogram: number[] = [];
  
  const signalStartIdx = signalPeriod - 1;
  for (let i = signalStartIdx; i < macd.length; i++) {
    histogram.push(macd[i] - signal[i - signalStartIdx]);
  }
  
  return { macd, signal, histogram };
}

export function Supertrend(
  candles: OHLCV[],
  period: number = 10,
  multiplier: number = 3.0
): { trend: number[]; direction: number[] } {
  const atr = ATR(candles, period);
  const hl2: number[] = candles.map(c => (c.high + c.low) / 2);
  
  if (atr.length === 0 || hl2.length < period + 1) {
    return { trend: [], direction: [] };
  }
  
  const upperBand: number[] = [];
  const lowerBand: number[] = [];
  const trend: number[] = [];
  const direction: number[] = [];
  
  const atrOffset = candles.length - atr.length;
  
  for (let i = 0; i < atr.length; i++) {
    const idx = i + atrOffset;
    upperBand.push(hl2[idx] + multiplier * atr[i]);
    lowerBand.push(hl2[idx] - multiplier * atr[i]);
  }
  
  let finalUpperBand = upperBand[0];
  let finalLowerBand = lowerBand[0];
  let prevTrend = 0;
  
  for (let i = 0; i < atr.length; i++) {
    const idx = i + atrOffset;
    const close = candles[idx].close;
    
    if (close <= finalUpperBand) {
      finalUpperBand = Math.min(finalUpperBand, upperBand[i]);
    } else {
      finalUpperBand = upperBand[i];
    }
    
    if (close >= finalLowerBand) {
      finalLowerBand = Math.max(finalLowerBand, lowerBand[i]);
    } else {
      finalLowerBand = lowerBand[i];
    }
    
    let currentTrend = prevTrend;
    if (close <= finalLowerBand) {
      currentTrend = -1;
    } else if (close >= finalUpperBand) {
      currentTrend = 1;
    }
    
    trend.push(currentTrend === 1 ? finalLowerBand : finalUpperBand);
    direction.push(currentTrend);
    prevTrend = currentTrend;
  }
  
  return { trend, direction };
}

export interface IchimokuResult {
  tenkan: number[];
  kijun: number[];
  senkouA: number[];
  senkouB: number[];
  chikou: number[];
  cloudTop: number[];
  cloudBottom: number[];
}

export function Ichimoku(
  candles: OHLCV[],
  tenkanPeriod: number = 9,
  kijunPeriod: number = 26,
  senkouBPeriod: number = 52
): IchimokuResult {
  if (candles.length < senkouBPeriod) {
    return {
      tenkan: [],
      kijun: [],
      senkouA: [],
      senkouB: [],
      chikou: [],
      cloudTop: [],
      cloudBottom: [],
    };
  }
  
  const tenkan: number[] = [];
  const kijun: number[] = [];
  const senkouA: number[] = [];
  const senkouB: number[] = [];
  const chikou: number[] = [];
  
  for (let i = tenkanPeriod - 1; i < candles.length; i++) {
    const high = Math.max(...candles.slice(i - tenkanPeriod + 1, i + 1).map(c => c.high));
    const low = Math.min(...candles.slice(i - tenkanPeriod + 1, i + 1).map(c => c.low));
    tenkan.push((high + low) / 2);
  }
  
  for (let i = kijunPeriod - 1; i < candles.length; i++) {
    const high = Math.max(...candles.slice(i - kijunPeriod + 1, i + 1).map(c => c.high));
    const low = Math.min(...candles.slice(i - kijunPeriod + 1, i + 1).map(c => c.low));
    kijun.push((high + low) / 2);
  }
  
  for (let i = senkouBPeriod - 1; i < candles.length; i++) {
    const high = Math.max(...candles.slice(i - senkouBPeriod + 1, i + 1).map(c => c.high));
    const low = Math.min(...candles.slice(i - senkouBPeriod + 1, i + 1).map(c => c.low));
    senkouB.push((high + low) / 2);
  }
  
  const tenkanOffset = candles.length - tenkan.length;
  const kijunOffset = candles.length - kijun.length;
  const senkouBOffset = candles.length - senkouB.length;
  
  for (let i = 0; i < Math.min(tenkan.length, kijun.length); i++) {
    senkouA.push((tenkan[i] + kijun[i]) / 2);
  }
  
  for (let i = 0; i < candles.length; i++) {
    const chikouIdx = i - kijunPeriod;
    if (chikouIdx >= 0) {
      chikou.push(candles[chikouIdx].close);
    } else {
      chikou.push(NaN);
    }
  }
  
  const cloudTop: number[] = [];
  const cloudBottom: number[] = [];
  
  for (let i = 0; i < Math.min(senkouA.length, senkouB.length); i++) {
    cloudTop.push(Math.max(senkouA[i], senkouB[i]));
    cloudBottom.push(Math.min(senkouA[i], senkouB[i]));
  }
  
  return { tenkan, kijun, senkouA, senkouB, chikou, cloudTop, cloudBottom };
}

