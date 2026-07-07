import { api } from '@/lib/api'

export const untanglingService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/untangling', { params }),

  create: (data: Record<string, unknown>) =>
    api.post('/untangling', data),

  update: (id: number | string, data: Record<string, unknown>) =>
    api.put(`/untangling/${id}`, data),

  remove: (id: number | string) =>
    api.delete(`/untangling/${id}`),
}
