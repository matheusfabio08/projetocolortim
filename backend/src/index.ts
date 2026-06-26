import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { prisma } from './lib/prisma';

// Routes
import authRoutes from './routes/auth';
import productionOrdersRoutes from './routes/productionOrders';
import preparationRoutes from './routes/preparation';
import productionRoutes from './routes/production';
import dryerRoutes from './routes/dryer';
import untanglingRoutes from './routes/untangling';
import rollingRoutes from './routes/rolling';
import qualityRoutes from './routes/quality';
import laboratoryRoutes from './routes/laboratory';
import box4Routes from './routes/box4';
import box5Routes from './routes/box5';
import box6Routes from './routes/box6';
import adminRoutes from './routes/admin';
import employeesRoutes from './routes/employees';
import fibrasRoutes from './routes/fibras';
import transportadorasRoutes from './routes/transportadoras';
import regiaoRoutes from './routes/regioes';
import listaSaidaRoutes from './routes/listaSaida';
import pesagemRoutes from './routes/pesagem';
import fabricQualityRoutes from './routes/fabricQuality';
import pcpRoutes from './routes/pcp';
import dashboardRoutes from './routes/dashboard';

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições, tente novamente em breve' },
});
app.use('/api', globalLimiter);

// Login rate limit (stricter)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
  message: { error: 'Muitas tentativas de login, aguarde 15 minutos' },
});
app.use('/api/auth/login', loginLimiter);

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
app.use('/api/box4', box4Routes);
app.use('/api/box5', box5Routes);
app.use('/api/box6', box6Routes);
app.use('/api/admin', adminRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/fibras', fibrasRoutes);
app.use('/api/transportadoras', transportadorasRoutes);
app.use('/api/regioes', regiaoRoutes);
app.use('/api/lista-saida', listaSaidaRoutes);
app.use('/api/pesagem', pesagemRoutes);
app.use('/api/fabric-quality', fabricQualityRoutes);
app.use('/api/pcp', pcpRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message;
  res.status(status).json({ error: message });
});

const PORT = Number(process.env.PORT) || 3001;

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Banco de dados conectado');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Falha ao conectar ao banco:', error);
    process.exit(1);
  }
}

main();
