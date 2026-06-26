import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { authRouter } from "./routes/auth";
import { productionOrdersRouter } from "./routes/productionOrders";
import { preparationRouter } from "./routes/preparation";
import { productionRouter } from "./routes/production";
import { dryerRouter } from "./routes/dryer";
import { untanglingRouter } from "./routes/untangling";
import { rollingRouter } from "./routes/rolling";
import { qualityRouter } from "./routes/quality";
import { laboratoryRouter } from "./routes/laboratory";
import { boxRouter } from "./routes/box";
import { pcpRouter } from "./routes/pcp";
import { adminRouter } from "./routes/admin";
import { employeesRouter } from "./routes/employees";
import { fibrasRouter } from "./routes/fibras";
import { transportadorasRouter } from "./routes/transportadoras";
import { regioesRouter } from "./routes/regioes";
import { listaSaidaRouter } from "./routes/listaSaida";
import { pesagemRouter } from "./routes/pesagem";
import { fabricQualityRouter } from "./routes/fabricQuality";
import { dashboardRouter } from "./routes/dashboard";

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Body parser
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições. Tente novamente em alguns minutos." },
});
app.use("/api", globalLimiter);

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas de login. Aguarde 15 minutos." },
});
app.use("/api/auth/login", authLimiter);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/production-orders", productionOrdersRouter);
app.use("/api/preparation", preparationRouter);
app.use("/api/production", productionRouter);
app.use("/api/dryer", dryerRouter);
app.use("/api/untangling", untanglingRouter);
app.use("/api/rolling", rollingRouter);
app.use("/api/quality", qualityRouter);
app.use("/api/laboratory", laboratoryRouter);
app.use("/api/box4", boxRouter("box4"));
app.use("/api/box5", boxRouter("box5"));
app.use("/api/box6", boxRouter("box6"));
app.use("/api/pcp", pcpRouter);
app.use("/api/admin", adminRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/fibras", fibrasRouter);
app.use("/api/transportadoras", transportadorasRouter);
app.use("/api/regioes", regioesRouter);
app.use("/api/lista-saida", listaSaidaRouter);
app.use("/api/pesagem", pesagemRouter);
app.use("/api/fabric-quality", fabricQualityRouter);

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Erro interno do servidor" });
});

app.listen(PORT, () => {
  console.log(`Colortim API running on port ${PORT}`);
});

export default app;
