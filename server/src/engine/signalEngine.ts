import { BinanceFeed, KlineData, TradeData, BookTickerData, DepthData } from '../feed/binance.js';
import { calculateOBI, TakerRatioCalculator, CVDCalculator } from '../calc/micro.js';
import { runEnsemble, EnsembleConfig } from './ensemble.js';
import { FinalSignal } from './ensemble.js';
import { MarketContext } from '../strategies/types.js';
import { EventEmitter } from 'events';

export class SignalEngine extends EventEmitter {
  private feed: BinanceFeed;
  private symbols: string[];
  private modes: ('scalp' | 'intraday' | 'swing')[];
  private config: EnsembleConfig;
  
  private candles: Map<string, Map<string, KlineData[]>> = new Map(); // symbol -> interval -> candles
  private currentPrices: Map<string, number> = new Map();
  private obi: Map<string, number> = new Map();
  private takerRatio: Map<string, number> = new Map();
  private cvd: Map<string, number> = new Map();
  
  private takerCalculator: TakerRatioCalculator;
  private cvdCalculator: CVDCalculator;
  
  private signalInterval: NodeJS.Timeout | null = null;

  constructor(
    symbols: string[],
    modes: ('scalp' | 'intraday' | 'swing')[],
    config: EnsembleConfig
  ) {
    super();
    this.symbols = symbols;
    this.modes = modes;
    this.config = config;
    
    this.feed = new BinanceFeed(symbols);
    this.takerCalculator = new TakerRatioCalculator(60000);
    this.cvdCalculator = new CVDCalculator(300000);
    
    this.setupFeedListeners();
  }

  private setupFeedListeners() {
    this.feed.on('kline', (kline: KlineData) => {
      this.handleKline(kline);
    });
    
    this.feed.on('trade', (trade: TradeData) => {
      this.handleTrade(trade);
    });
    
    this.feed.on('bookTicker', (ticker: BookTickerData) => {
      this.currentPrices.set(ticker.symbol, (ticker.bidPrice + ticker.askPrice) / 2);
    });
    
    this.feed.on('depth', (depth: DepthData) => {
      this.handleDepth(depth);
    });
    
    this.feed.on('connected', () => {
      console.log('SignalEngine: Feed connected');
      this.startSignalGeneration();
    });
  }

  private handleKline(kline: KlineData) {
    const symbol = kline.symbol;
    const interval = kline.interval;
    
    if (!this.candles.has(symbol)) {
      this.candles.set(symbol, new Map());
    }
    
    const symbolCandles = this.candles.get(symbol)!;
    
    if (!symbolCandles.has(interval)) {
      symbolCandles.set(interval, []);
    }
    
    const candles = symbolCandles.get(interval)!;
    
    if (kline.isClosed) {
      candles.push(kline);
      // Son 500 mumu tut
      if (candles.length > 500) {
        candles.shift();
      }
    } else {
      // Açık mumu güncelle
      if (candles.length > 0 && candles[candles.length - 1].timestamp === kline.timestamp) {
        candles[candles.length - 1] = kline;
      } else {
        candles.push(kline);
      }
    }
  }

  private handleTrade(trade: TradeData) {
    this.currentPrices.set(trade.symbol, trade.price);
    
    const takerRatio = this.takerCalculator.processTrade(trade);
    this.takerRatio.set(trade.symbol, takerRatio.ratio);
    
    const cvd = this.cvdCalculator.processTrade(trade);
    this.cvd.set(trade.symbol, cvd.cumulativeDelta);
  }

  private handleDepth(depth: DepthData) {
    const obi = calculateOBI(depth, 10);
    this.obi.set(depth.symbol, obi.imbalance);
  }

  private startSignalGeneration() {
    if (this.signalInterval) {
      clearInterval(this.signalInterval);
    }
    
    // Her saniye sinyal üret
    this.signalInterval = setInterval(() => {
      this.generateSignals();
    }, 1000);
  }

  private generateSignals() {
    for (const symbol of this.symbols) {
      const currentPrice = this.currentPrices.get(symbol);
      if (!currentPrice) continue;
      
      for (const mode of this.modes) {
        const interval = mode === 'scalp' ? '1s' : mode === 'intraday' ? '1m' : '1h';
        const candles = this.candles.get(symbol)?.get(interval) || [];
        
        if (candles.length < 50) continue; // Yeterli veri yok
        
        const ctx: MarketContext = {
          candles: candles.map(c => ({
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            volume: c.volume,
            timestamp: c.timestamp,
          })),
          currentPrice,
          obi: this.obi.get(symbol),
          takerRatio: this.takerRatio.get(symbol),
          cvd: this.cvd.get(symbol),
        };
        
        const signal = runEnsemble(ctx, mode, this.config);
        signal.symbol = symbol;
        
        if (signal.action !== 'HOLD' && signal.confidence > 0.3) {
          this.emit('signal', signal);
        }
      }
    }
  }

  start() {
    this.feed.connect();
  }

  stop() {
    if (this.signalInterval) {
      clearInterval(this.signalInterval);
      this.signalInterval = null;
    }
    this.feed.disconnect();
  }

  updateConfig(config: EnsembleConfig) {
    this.config = config;
  }

  updateSymbols(symbols: string[]) {
    // WebSocket limiti var, maksimum 200 sembol
    const limitedSymbols = symbols.slice(0, 200);
    this.symbols = limitedSymbols;
    this.feed.disconnect();
    this.feed = new BinanceFeed(limitedSymbols);
    this.setupFeedListeners();
    this.feed.connect();
  }
}

