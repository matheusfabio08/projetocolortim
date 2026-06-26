import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { prisma } from './lib/prisma';

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
import pcpRoutes from './routes/pcp';
import dashboardRoutes from './routes/dashboard';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições, tente novamente em alguns minutos' },
});
app.use(globalLimiter);

// Login rate limit (stricter)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas de login, tente novamente em 15 minutos' },
});

// Routes
app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/production-orders', productionOrdersRoutes);
app.use('/api/preparation', preparationRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/dryer', dryerRoutes);
app.use('/api/untangling', untanglingRoutes);
app.use('/api/rolling', rollingRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/laboratory', laboratoryRoutes);
app.use('/api', boxRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/fibras', fibrasRoutes);
app.use('/api/transportadoras', transportadorasRoutes);
app.use('/api/regioes', regioesRoutes);
app.use('/api/lista-saida', listaSaidaRoutes);
app.use('/api/pesagem', pesagemRoutes);
app.use('/api/fabric-quality', fabricQualityRoutes);
app.use('/api/pcp', pcpRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Colortim Backend running on port ${PORT}`);
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma');
  } catch (e) {
    console.error('❌ Database connection failed:', e);
  }
});

export default app;
