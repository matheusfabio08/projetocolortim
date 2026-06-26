import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import productionOrderRoutes from './routes/productionOrders';
import preparationRoutes from './routes/preparation';
import productionRoutes from './routes/production';
import dryerRoutes from './routes/dryer';
import untanglingRoutes from './routes/untangling';
import rollingRoutes from './routes/rolling';
import qualityRoutes from './routes/quality';
import laboratoryRoutes from './routes/laboratory';
import boxRoutes from './routes/box';
import pesagemRoutes from './routes/pesagem';
import fabricQualityRoutes from './routes/fabricQuality';
import employeeRoutes from './routes/employees';
import adminRoutes from './routes/admin';
import transportadoraRoutes from './routes/transportadoras';
import fibrasRoutes from './routes/fibras';
import regioesRoutes from './routes/regioes';
import listaSaidaRoutes from './routes/listaSaida';
import pcpRoutes from './routes/pcp';
import opStatusRoutes from './routes/opStatus';

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Token'],
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas requisições, tente novamente mais tarde' },
  })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/production-orders', productionOrderRoutes);
app.use('/api/preparation', preparationRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/dryer', dryerRoutes);
app.use('/api/untangling', untanglingRoutes);
app.use('/api/rolling', rollingRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/laboratory', laboratoryRoutes);
app.use('/api', boxRoutes);
app.use('/api/pesagem', pesagemRoutes);
app.use('/api/fabric-quality', fabricQualityRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transportadoras', transportadoraRoutes);
app.use('/api/fibras', fibrasRoutes);
app.use('/api/regioes', regioesRoutes);
app.use('/api/lista-saida', listaSaidaRoutes);
app.use('/api/pcp', pcpRoutes);
app.use('/api', opStatusRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Colortim API rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
