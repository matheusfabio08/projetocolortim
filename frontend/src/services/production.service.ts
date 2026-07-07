import { api } from '@/lib/api'

export const productionService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/production', { params }),

  create: (data: Record<string, unknown>) =>
    api.post('/production', data),

  update: (id: number | string, data: Record<string, unknown>) =>
    api.put(`/production/${id}`, data),

  remove: (id: number | string) =>
    api.delete(`/production/${id}`),
}
