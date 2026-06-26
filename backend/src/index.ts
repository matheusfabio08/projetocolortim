import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import authRouter from './routes/auth.js';
import productionOrdersRouter from './routes/productionOrders.js';
import preparationRouter from './routes/preparation.js';
import productionRouter from './routes/production.js';
import dryerRouter from './routes/dryer.js';
import untanglingRouter from './routes/untangling.js';
import rollingRouter from './routes/rolling.js';
import qualityRouter from './routes/quality.js';
import laboratoryRouter from './routes/laboratory.js';
import boxRouter from './routes/box.js';
import adminRouter from './routes/admin.js';
import employeesRouter from './routes/employees.js';
import fibrasRouter from './routes/fibras.js';
import transportadorasRouter from './routes/transportadoras.js';
import regioesRouter from './routes/regioes.js';
import listaSaidaRouter from './routes/listaSaida.js';
import pesagemRouter from './routes/pesagem.js';
import fabricQualityRouter from './routes/fabricQuality.js';
import dashboardRouter from './routes/dashboard.js';
import pcpRouter from './routes/pcp.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global rate limit
app.use(rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições, tente novamente mais tarde.' },
}));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
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
app.use('/api/box4', boxRouter('box4'));
app.use('/api/box5', boxRouter('box5'));
app.use('/api/box6', boxRouter('box6'));
app.use('/api/pcp', pcpRouter);
app.use('/api/admin', adminRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/fibras', fibrasRouter);
app.use('/api/transportadoras', transportadorasRouter);
app.use('/api/regioes', regioesRouter);
app.use('/api/lista-saida', listaSaidaRouter);
app.use('/api/pesagem', pesagemRouter);
app.use('/api/fabric-quality', fabricQualityRouter);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Erro interno do servidor'
    : err.message || 'Erro interno do servidor';
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`[SERVER] Colortim API rodando na porta ${PORT}`);
  console.log(`[SERVER] Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
