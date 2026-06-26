import { Router } from 'express';

export function createPlaceholderRouter(name: string) {
  const router = Router();
  router.get('/', (_req, res) => {
    res.json({
      module: name,
      status: 'pending-migration',
      message: 'Endpoint placeholder. Migração da regra de negócio do worker Cloudflare será aplicada aqui.'
    });
  });
  return router;
}
