import { z } from 'zod';

const ROLES = [
  'ADMIN', 'GERENCIAMENTO', 'PCP', 'ALMOXARIFADO', 'PREPARACAO',
  'PRODUCAO', 'SECADORA', 'DESTRINCHAGEM', 'ENROLAGEM',
  'QUALIDADE', 'LABORATORIO', 'PESAGEM', 'LISTA_SAIDA', 'FABRIC_QUALITY',
] as const;

export const createUserSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Username inválido'),
  password: z.string().min(6).max(100),
  name: z.string().min(2).max(100),
  role: z.enum(ROLES),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(ROLES).optional(),
  active: z.boolean().optional(),
  password: z.string().min(6).max(100).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
