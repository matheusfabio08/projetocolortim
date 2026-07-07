import { api } from '@/lib/api'

export const preparationService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/preparation', { params }),

  create: (data: Record<string, unknown>) =>
    api.post('/preparation', data),

  update: (id: number | string, data: Record<string, unknown>) =>
    api.put(`/preparation/${id}`, data),

  remove: (id: number | string) =>
    api.delete(`/preparation/${id}`),
}
