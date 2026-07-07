import { api } from '@/lib/api'

export const almoxarifadoService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/box', { params }),

  create: (data: Record<string, unknown>) =>
    api.post('/box', data),

  update: (id: number | string, data: Record<string, unknown>) =>
    api.put(`/box/${id}`, data),

  remove: (id: number | string) =>
    api.delete(`/box/${id}`),
}
