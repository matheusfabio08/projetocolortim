import { api } from '@/lib/api'

export const laboratoryService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/laboratory', { params }),

  create: (data: Record<string, unknown>) =>
    api.post('/laboratory', data),

  update: (id: number | string, data: Record<string, unknown>) =>
    api.put(`/laboratory/${id}`, data),

  remove: (id: number | string) =>
    api.delete(`/laboratory/${id}`),
}
