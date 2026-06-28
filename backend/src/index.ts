import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth';
import { productionOrdersRouter } from './routes/productionOrders';
import { preparationRouter } from './routes/preparation';
import { productionRouter } from './routes/production';
import { dryerRouter } from './routes/dryer';
import { untanglingRouter } from './routes/untangling';
import { rollingRouter } from './routes/rolling';
import { qualityRouter } from './routes/quality';
import { laboratoryRouter } from './routes/laboratory';
import { box4Router } from './routes/box4';
import { box5Router } from './routes/box5';
import { box6Router } from './routes/box6';
import { adminRouter } from './routes/admin';
import { employeesRouter } from './routes/employees';
import { fibrasRouter } from './routes/fibras';
import { transportadorasRouter } from './routes/transportadoras';
import { regioesRouter } from './routes/regioes';
import { listaSaidaRouter } from './routes/listaSaida';
import { pesagemRouter } from './routes/pesagem';
import { fabricQualityRouter } from './routes/fabricQuality';
import { pcpRouter } from './routes/pcp';
import { dashboardRouter } from './routes/dashboard';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Allowed origins: support both Vite default (5173) and custom (3000)
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5173',
];

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado para origem: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Global rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' },
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/production-orders', productionOrdersRouter);
app.use('/api/preparation', preparationRouter);
app.use('/api/production', productionRouter);
app.use('/api/dryer', dryerRouter);
app.use('/api/untangling', untanglingRouter);
app.use('/api/rolling', rollingRouter);
app.use('/api/quality', qualityRouter);
app.use('/api/laboratory', laboratoryRouter);
app.use('/api/box4', box4Router);
app.use('/api/box5', box5Router);
app.use('/api/box6', box6Router);
app.use('/api/admin', adminRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/fibras', fibrasRouter);
app.use('/api/transportadoras', transportadorasRouter);
app.use('/api/regioes', regioesRouter);
app.use('/api/lista-saida', listaSaidaRouter);
app.use('/api/pesagem', pesagemRouter);
app.use('/api/fabric-quality', fabricQualityRouter);
app.use('/api/pcp', pcpRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Dados inválidos', details: err.errors });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token inválido' });
  }
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Colortim API rodando na porta ${PORT}`);
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
