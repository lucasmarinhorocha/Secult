import pino from 'pino';
import { config } from './config';

// Simple logger without transports (works everywhere)
const logger = pino({
  level: config.logLevel,
});

export default logger;
