import { FastifyInstance } from 'fastify';
import { setupSSE } from './sse.js';
import { z } from 'zod';

const backtestSchema = z.object({
  symbol: z.string(),
  interval: z.string(),
  lookbackDays: z.number().min(1).max(365),
  strategies: z.array(z.string()).optional(),
});

export async function registerRoutes(fastify: FastifyInstance) {
  await setupSSE(fastify);
  
  fastify.get('/', async () => {
    return {
      message: 'Özel Kripto Sinyal Konsolu - Backend API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        sse: '/sse?symbols=BTCUSDT&modes=intraday',
        symbols: '/symbols',
        backtest: 'POST /backtest',
      },
    };
  });
  
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: Date.now() };
  });
  
  fastify.post('/backtest', async (request, reply) => {
    try {
      const body = backtestSchema.parse(request.body);
      
      // Basit backtest simülasyonu
      // Gerçek implementasyon için historik veri çekilmesi gerekir
      return {
        pnl: 0,
        winrate: 0,
        maxDD: 0,
        sharpe: 0,
        message: 'Backtest özelliği geliştirme aşamasında',
      };
    } catch (error) {
      reply.code(400).send({ error: 'Invalid request body' });
    }
  });
  
  // Tüm sembolleri Binance'den otomatik çek
  fastify.get('/symbols', async () => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
      const data = await response.json() as { symbols: Array<{ symbol: string; status: string; quoteAsset: string }> };
      
      // Sadece USDT çiftlerini ve aktif olanları filtrele
      const symbols = data.symbols
        .filter((s) => 
          s.symbol.endsWith('USDT') && 
          s.status === 'TRADING' &&
          s.quoteAsset === 'USDT'
        )
        .map((s) => s.symbol)
        .sort();
      
      return { symbols };
    } catch (error) {
      console.error('Symbols fetch error:', error);
      return { symbols: [], error: 'Sembol listesi alınamadı' };
    }
  });
  
  // Ticker endpoint - tüm semboller için anlık fiyatlar
  fastify.get('/ticker', async () => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      const data = await response.json() as Array<{
        symbol: string;
        lastPrice: string;
        priceChangePercent: string;
        quoteVolume: string;
        highPrice: string;
        lowPrice: string;
      }>;
      
      // USDT çiftlerini filtrele ve formatla
      const tickers = data
        .filter((t) => 
          t.symbol.endsWith('USDT') && 
          parseFloat(t.lastPrice) > 0 &&
          parseFloat(t.quoteVolume) > 1000 // Minimum hacim filtresi
        )
        .map((t) => ({
          symbol: t.symbol,
          price: parseFloat(t.lastPrice),
          change24h: parseFloat(t.priceChangePercent),
          volume: parseFloat(t.quoteVolume),
          high24h: parseFloat(t.highPrice),
          low24h: parseFloat(t.lowPrice),
          timestamp: Date.now(),
        }))
        .sort((a, b) => b.volume - a.volume); // Hacme göre sırala
      
      return { tickers };
    } catch (error) {
      console.error('Ticker fetch error:', error);
      return { tickers: [], error: 'Ticker verisi alınamadı' };
    }
  });
}

