import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import dotenv from 'dotenv';
import { login, refresh, register } from './routes/authRoutes';
import eventosRouter from './routes/eventosRoutes';
import usersRouter from './routes/usersRoutes';
import { initDb, seedAdminUser } from './db';

dotenv.config();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

const app: Express = express();
const port = process.env.PORT || 3001;

// ============================================
// Middleware
// ============================================

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3002',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// Health Check
// ============================================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================

app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'GearOne API v1.0.0',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      eventos: '/api/eventos',
      insumos: '/api/insumos',
      ocorrencias: '/api/ocorrencias',
      contratos: '/api/contratos',
      alvaras: '/api/alvaras',
      fornecedores: '/api/fornecedores',
      presenca: '/api/presenca',
      notificacoes: '/api/notificacoes',
    },
  });
});

// Auth routes
app.post('/api/auth/login', login);
app.post('/api/auth/refresh', refresh);
app.post('/api/auth/register', register);

// Eventos routes
app.use('/api/eventos', eventosRouter);
app.use('/api/usuarios', usersRouter);

// ============================================
// Error handling
// ============================================

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// Start Server
// ============================================

const startServer = async () => {
  try {
    await initDb();
    await seedAdminUser();
    app.listen(port, () => {
      logger.info(`Backend running on http://localhost:${port}`);
    });
  } catch (error) {
    logger.error('Failed to initialize database', error);
    process.exit(1);
  }
};

startServer();

export default app;
