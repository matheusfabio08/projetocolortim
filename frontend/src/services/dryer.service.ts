import { api } from '@/lib/api'

export const dryerService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/dryer', { params }),

  create: (data: Record<string, unknown>) =>
    api.post('/dryer', data),

  update: (id: number | string, data: Record<string, unknown>) =>
    api.put(`/dryer/${id}`, data),

  remove: (id: number | string) =>
    api.delete(`/dryer/${id}`),
}
