import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import productionOrdersRoutes from './routes/productionOrders';
import preparationRoutes from './routes/preparation';
import productionRoutes from './routes/production';
import dryerRoutes from './routes/dryer';
import untanglingRoutes from './routes/untangling';
import rollingRoutes from './routes/rolling';
import qualityRoutes from './routes/quality';
import laboratoryRoutes from './routes/laboratory';
import boxRoutes from './routes/box';
import adminRoutes from './routes/admin';
import employeesRoutes from './routes/employees';
import fibrasRoutes from './routes/fibras';
import transportadorasRoutes from './routes/transportadoras';
import regioesRoutes from './routes/regioes';
import listaSaidaRoutes from './routes/listaSaida';
import pesagemRoutes from './routes/pesagem';
import fabricQualityRoutes from './routes/fabricQuality';
import opStatusRoutes from './routes/opStatus';
import dashboardRoutes from './routes/dashboard';

const app = express();
const PORT = process.env.PORT || 3001;

// Security
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// CORS
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limit
app.use(rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em breve.' },
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/production-orders', productionOrdersRoutes);
app.use('/api/preparation', preparationRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/dryer', dryerRoutes);
app.use('/api/untangling', untanglingRoutes);
app.use('/api/rolling', rollingRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/laboratory', laboratoryRoutes);
app.use('/api/box4', boxRoutes('box4'));
app.use('/api/box5', boxRoutes('box5'));
app.use('/api/box6', boxRoutes('box6'));
app.use('/api/admin', adminRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/fibras', fibrasRoutes);
app.use('/api/transportadoras', transportadorasRoutes);
app.use('/api/regioes', regioesRoutes);
app.use('/api/lista-saida', listaSaidaRoutes);
app.use('/api/pesagem', pesagemRoutes);
app.use('/api/fabric-quality', fabricQualityRoutes);
app.use('/api/op-status', opStatusRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Colortim API rodando em http://localhost:${PORT}`);
  console.log(`📦 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
