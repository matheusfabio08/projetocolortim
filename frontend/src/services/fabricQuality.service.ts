import { api } from '@/lib/api'

export const fabricQualityService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/fabric-quality', { params }),

  create: (data: Record<string, unknown>) =>
    api.post('/fabric-quality', data),

  update: (id: number | string, data: Record<string, unknown>) =>
    api.put(`/fabric-quality/${id}`, data),

  remove: (id: number | string) =>
    api.delete(`/fabric-quality/${id}`),
}
