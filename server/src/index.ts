import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { registerRoutes } from './api.js';

const fastify = Fastify({
  logger: true,
});

async function start() {
  try {
    await fastify.register(cors, config.cors);
    await registerRoutes(fastify);
    
    const port = process.env.PORT || config.port;
    await fastify.listen({ port: Number(port), host: '0.0.0.0' });
    console.log(`🚀 Server listening on http://localhost:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();

