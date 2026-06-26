import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.js';
import { dashboardRouter } from './routes/dashboard.js';
import { productionOrdersRouter } from './routes/productionOrders.js';
import { preparationRouter } from './routes/preparation.js';
import { productionRouter } from './routes/production.js';
import { boxRouter } from './routes/box.js';
import { pcpRouter } from './routes/pcp.js';
import { pesagemRouter } from './routes/pesagem.js';
import { employeesRouter } from './routes/employees.js';
import { fabricQualityRouter } from './routes/fabricQuality.js';
import { laboratoryRouter } from './routes/laboratory.js';
import { qualityRouter } from './routes/quality.js';
import { dryerRouter } from './routes/dryer.js';
import { untanglingRouter } from './routes/untangling.js';
import { rollingRouter } from './routes/rolling.js';
import { transportadorasRouter } from './routes/transportadoras.js';
import { regioesRouter } from './routes/regioes.js';
import { adminRouter } from './routes/admin.js';
import { fibrasRouter } from './routes/fibras.js';
import { listaSaidaRouter } from './routes/listaSaida.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use(morgan('dev'));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'projetocolortim-backend' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/production-orders', productionOrdersRouter);
  app.use('/api/preparation', preparationRouter);
  app.use('/api/production', productionRouter);
  app.use('/api/box', boxRouter);
  app.use('/api/pcp', pcpRouter);
  app.use('/api/pesagem', pesagemRouter);
  app.use('/api/employees', employeesRouter);
  app.use('/api/fabric-quality', fabricQualityRouter);
  app.use('/api/laboratory', laboratoryRouter);
  app.use('/api/quality', qualityRouter);
  app.use('/api/dryer', dryerRouter);
  app.use('/api/untangling', untanglingRouter);
  app.use('/api/rolling', rollingRouter);
  app.use('/api/transportadoras', transportadorasRouter);
  app.use('/api/regioes', regioesRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/fibras', fibrasRouter);
  app.use('/api/lista-saida', listaSaidaRouter);

  app.use(errorHandler);

  return app;
}
