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

// Security headers
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

// Rate limiting global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições, tente novamente em 15 minutos' },
}));

// Rate limiting para login (mais estrito)
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas de login, tente novamente em 15 minutos' },
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/box4', boxRoutes.box4Router);
app.use('/api/box5', boxRoutes.box5Router);
app.use('/api/box6', boxRoutes.box6Router);
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
app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// 404
app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
});

const PORT = parseInt(process.env.PORT || '3001', 10);
app.listen(PORT, () => {
  console.log(`🚀 Colortim API rodando em http://localhost:${PORT}`);
});
