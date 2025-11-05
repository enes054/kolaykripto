import WebSocket from 'ws';
import { EventEmitter } from 'events';

export interface KlineData {
  symbol: string;
  interval: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
  isClosed: boolean;
}

export interface TradeData {
  symbol: string;
  price: number;
  quantity: number;
  isBuyerMaker: boolean;
  timestamp: number;
}

export interface BookTickerData {
  symbol: string;
  bidPrice: number;
  bidQty: number;
  askPrice: number;
  askQty: number;
  timestamp: number;
}

export interface DepthData {
  symbol: string;
  bids: Array<[number, number]>;
  asks: Array<[number, number]>;
  timestamp: number;
}

export class BinanceFeed extends EventEmitter {
  private ws: WebSocket | null = null;
  private wsUrl: string;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private lastPong = Date.now();
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(symbols: string[]) {
    super();
    const streams = symbols.flatMap(s => [
      `${s.toLowerCase()}@aggTrade`,
      `${s.toLowerCase()}@kline_1s`,
      `${s.toLowerCase()}@kline_1m`,
      `${s.toLowerCase()}@bookTicker`,
      `${s.toLowerCase()}@depth@100ms`,
    ]);
    this.wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`;
  }

  connect() {
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(this.wsUrl);

    this.ws.on('open', () => {
      console.log('📡 Binance WebSocket connected');
      this.isConnected = true;
      this.reconnectDelay = 1000;
      this.emit('connected');
      this.startPing();
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(message);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });

    this.ws.on('close', () => {
      console.log('WebSocket closed, reconnecting...');
      this.isConnected = false;
      this.stopPing();
      this.scheduleReconnect();
    });
  }

  private handleMessage(message: any) {
    if (message.stream && message.data) {
      const { stream, data } = message;
      
      if (stream.includes('@aggTrade')) {
        const trade: TradeData = {
          symbol: data.s,
          price: parseFloat(data.p),
          quantity: parseFloat(data.q),
          isBuyerMaker: data.m,
          timestamp: data.T,
        };
        this.emit('trade', trade);
      } else if (stream.includes('@kline_1s') || stream.includes('@kline_1m')) {
        const k = data.k;
        const kline: KlineData = {
          symbol: k.s,
          interval: k.i,
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v),
          timestamp: k.t,
          isClosed: k.x,
        };
        this.emit('kline', kline);
      } else if (stream.includes('@bookTicker')) {
        const ticker: BookTickerData = {
          symbol: data.s,
          bidPrice: parseFloat(data.b),
          bidQty: parseFloat(data.bQ),
          askPrice: parseFloat(data.a),
          askQty: parseFloat(data.aQ),
          timestamp: Date.now(),
        };
        this.emit('bookTicker', ticker);
      } else if (stream.includes('@depth')) {
        const depth: DepthData = {
          symbol: data.s,
          bids: data.b.map(([p, q]: [string, string]) => [parseFloat(p), parseFloat(q)]),
          asks: data.a.map(([p, q]: [string, string]) => [parseFloat(p), parseFloat(q)]),
          timestamp: Date.now(),
        };
        this.emit('depth', depth);
      }
    }
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.isConnected) {
        this.ws.ping();
        if (Date.now() - this.lastPong > 60000) {
          console.warn('No pong received, reconnecting...');
          this.ws.close();
        }
      }
    }, 30000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      console.log(`Reconnecting in ${this.reconnectDelay}ms...`);
      this.connect();
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
    }, this.reconnectDelay);
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

