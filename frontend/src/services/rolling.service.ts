import { api } from '@/lib/api'

export const rollingService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/rolling', { params }),

  create: (data: Record<string, unknown>) =>
    api.post('/rolling', data),

  update: (id: number | string, data: Record<string, unknown>) =>
    api.put(`/rolling/${id}`, data),

  remove: (id: number | string) =>
    api.delete(`/rolling/${id}`),
}
