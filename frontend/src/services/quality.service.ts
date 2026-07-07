import { api } from '@/lib/api'

export const qualityService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/quality', { params }),

  create: (data: Record<string, unknown>) =>
    api.post('/quality', data),

  update: (id: number | string, data: Record<string, unknown>) =>
    api.put(`/quality/${id}`, data),

  remove: (id: number | string) =>
    api.delete(`/quality/${id}`),
}
