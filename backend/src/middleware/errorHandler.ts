import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('[ERROR]', err.message, err.stack);

  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      return res.status(409).json({ error: 'Registro duplicado. Verifique os dados únicos.' });
    }
    if (prismaErr.code === 'P2025') {
      return res.status(404).json({ error: 'Registro não encontrado.' });
    }
  }

  const status = (err as any).status ?? 500;
  const message = status < 500 ? err.message : 'Erro interno do servidor';
  res.status(status).json({ error: message });
}
