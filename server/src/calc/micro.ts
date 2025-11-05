import { BookTickerData, TradeData, DepthData } from '../feed/binance.js';

export interface OrderBookImbalance {
  symbol: string;
  imbalance: number; // -1 to 1
  bidVolume: number;
  askVolume: number;
  timestamp: number;
}

export interface TakerBuySellRatio {
  symbol: string;
  ratio: number; // >1 means more buying, <1 means more selling
  buyVolume: number;
  sellVolume: number;
  timestamp: number;
}

export interface CVD {
  symbol: string;
  cumulativeDelta: number;
  buyVolume: number;
  sellVolume: number;
  timestamp: number;
}

export function calculateOBI(depth: DepthData, levels: number = 10): OrderBookImbalance {
  let bidVolume = 0;
  let askVolume = 0;
  
  const bidLevels = depth.bids.slice(0, levels);
  const askLevels = depth.asks.slice(0, levels);
  
  for (const [price, quantity] of bidLevels) {
    bidVolume += quantity;
  }
  
  for (const [price, quantity] of askLevels) {
    askVolume += quantity;
  }
  
  const totalVolume = bidVolume + askVolume;
  const imbalance = totalVolume > 0 ? (bidVolume - askVolume) / totalVolume : 0;
  
  return {
    symbol: depth.symbol,
    imbalance,
    bidVolume,
    askVolume,
    timestamp: depth.timestamp,
  };
}

export class TakerRatioCalculator {
  private trades: Map<string, { buyVolume: number; sellVolume: number; lastUpdate: number }> = new Map();
  private windowMs: number;

  constructor(windowMs: number = 60000) {
    this.windowMs = windowMs;
  }

  processTrade(trade: TradeData): TakerBuySellRatio {
    const key = trade.symbol;
    const now = Date.now();
    
    if (!this.trades.has(key)) {
      this.trades.set(key, { buyVolume: 0, sellVolume: 0, lastUpdate: now });
    }
    
    const data = this.trades.get(key)!;
    
    if (now - data.lastUpdate > this.windowMs) {
      data.buyVolume = 0;
      data.sellVolume = 0;
    }
    
    const volume = trade.quantity * trade.price;
    
    if (!trade.isBuyerMaker) {
      data.buyVolume += volume;
    } else {
      data.sellVolume += volume;
    }
    
    data.lastUpdate = now;
    
    const ratio = data.sellVolume > 0 ? data.buyVolume / data.sellVolume : (data.buyVolume > 0 ? 10 : 1);
    
    return {
      symbol: trade.symbol,
      ratio,
      buyVolume: data.buyVolume,
      sellVolume: data.sellVolume,
      timestamp: now,
    };
  }

  getRatio(symbol: string): TakerBuySellRatio | null {
    const data = this.trades.get(symbol);
    if (!data) return null;
    
    const ratio = data.sellVolume > 0 ? data.buyVolume / data.sellVolume : (data.buyVolume > 0 ? 10 : 1);
    
    return {
      symbol,
      ratio,
      buyVolume: data.buyVolume,
      sellVolume: data.sellVolume,
      timestamp: data.lastUpdate,
    };
  }
}

export class CVDCalculator {
  private deltas: Map<string, { delta: number; buyVolume: number; sellVolume: number; lastUpdate: number }> = new Map();
  private windowMs: number;

  constructor(windowMs: number = 300000) {
    this.windowMs = windowMs;
  }

  processTrade(trade: TradeData): CVD {
    const key = trade.symbol;
    const now = Date.now();
    
    if (!this.deltas.has(key)) {
      this.deltas.set(key, { delta: 0, buyVolume: 0, sellVolume: 0, lastUpdate: now });
    }
    
    const data = this.deltas.get(key)!;
    
    if (now - data.lastUpdate > this.windowMs) {
      data.delta = 0;
      data.buyVolume = 0;
      data.sellVolume = 0;
    }
    
    const volume = trade.quantity * trade.price;
    
    if (!trade.isBuyerMaker) {
      data.buyVolume += volume;
      data.delta += volume;
    } else {
      data.sellVolume += volume;
      data.delta -= volume;
    }
    
    data.lastUpdate = now;
    
    return {
      symbol: trade.symbol,
      cumulativeDelta: data.delta,
      buyVolume: data.buyVolume,
      sellVolume: data.sellVolume,
      timestamp: now,
    };
  }

  getCVD(symbol: string): CVD | null {
    const data = this.deltas.get(symbol);
    if (!data) return null;
    
    return {
      symbol,
      cumulativeDelta: data.delta,
      buyVolume: data.buyVolume,
      sellVolume: data.sellVolume,
      timestamp: data.lastUpdate,
    };
  }
}

