import { FastifyInstance, FastifyRequest } from 'fastify';
import { SignalEngine, FinalSignal } from './engine/signalEngine.js';
import { EnsembleConfig } from './engine/ensemble.js';

const engines = new Map<string, SignalEngine>();

export async function setupSSE(fastify: FastifyInstance) {
  fastify.get('/sse', async (request: FastifyRequest<{
    Querystring: {
      symbols?: string;
      modes?: string;
    }
  }>, reply) => {
    const symbols = request.query.symbols?.split(',').filter(Boolean) || ['BTCUSDT'];
    const modes = (request.query.modes?.split(',').filter(Boolean) as ('scalp' | 'intraday' | 'swing')[]) || ['intraday'];
    
    const key = `${symbols.join(',')}:${modes.join(',')}`;
    
    let engine = engines.get(key);
    
    if (!engine) {
      const defaultConfig: EnsembleConfig = {
        trend_basic: { enabled: true, weight: 1.0 },
        breakout_vol: { enabled: true, weight: 1.0 },
        bounce_200ema: { enabled: true, weight: 1.0 },
        vwap_bands: { enabled: true, weight: 1.0 },
        microstructure: { enabled: true, weight: 1.0 },
        swing_daily: { enabled: true, weight: 1.0 },
      };
      
      engine = new SignalEngine(symbols, modes, defaultConfig);
      engines.set(key, engine);
      engine.start();
    }
    
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');
    reply.raw.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
    
    const signalHandler = (signal: FinalSignal) => {
      reply.raw.write(`data: ${JSON.stringify(signal)}\n\n`);
    };
    
    engine.on('signal', signalHandler);
    
    reply.raw.write(': connected\n\n');
    
    request.raw.on('close', () => {
      engine?.removeListener('signal', signalHandler);
      // 5 dakika sonra engine'i kapat
      setTimeout(() => {
        if (engines.has(key)) {
          const eng = engines.get(key);
          if (eng) {
            eng.removeAllListeners();
            eng.stop();
            engines.delete(key);
          }
        }
      }, 300000);
    });
  });
}

