import { z } from 'zod';

export const createOPSchema = z.object({
  op: z.string().min(1, 'Número da OP é obrigatório').max(50),
  produto: z.string().min(1, 'Produto é obrigatório').max(200),
  cliente: z.string().min(1, 'Cliente é obrigatório').max(200),
  quantidade: z.number().positive('Quantidade deve ser positiva'),
  fibra: z.string().optional(),
  cor: z.string().optional(),
  pesoTotal: z.number().positive().optional(),
  dataEntrega: z.string().datetime().optional().or(z.string().optional()),
  observacoes: z.string().max(1000).optional(),
});

export const updateOPSchema = createOPSchema.partial().extend({
  status: z.enum(['ABERTA', 'EM_PRODUCAO', 'FINALIZADA', 'CANCELADA']).optional(),
});

export type CreateOPInput = z.infer<typeof createOPSchema>;
export type UpdateOPInput = z.infer<typeof updateOPSchema>;
