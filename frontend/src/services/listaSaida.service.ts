import { api } from '@/lib/api'

export const listaSaidaService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/lista-saida', { params }),

  create: (data: Record<string, unknown>) =>
    api.post('/lista-saida', data),

  update: (id: number | string, data: Record<string, unknown>) =>
    api.put(`/lista-saida/${id}`, data),

  remove: (id: number | string) =>
    api.delete(`/lista-saida/${id}`),
}
