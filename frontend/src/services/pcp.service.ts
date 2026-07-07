import { api } from '@/lib/api'

export const pcpService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/pcp', { params }),

  create: (data: Record<string, unknown>) =>
    api.post('/pcp', data),

  update: (id: number | string, data: Record<string, unknown>) =>
    api.put(`/pcp/${id}`, data),

  remove: (id: number | string) =>
    api.delete(`/pcp/${id}`),
}
