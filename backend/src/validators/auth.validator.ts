import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, 'Username muito curto').max(50),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').max(100),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6, 'Nova senha deve ter ao menos 6 caracteres').max(100),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
