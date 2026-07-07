import { api } from '@/lib/api'

export const productionOrdersService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/production-orders', { params }),

  getById: (id: number | string) =>
    api.get(`/production-orders/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post('/production-orders', data),

  update: (id: number | string, data: Record<string, unknown>) =>
    api.put(`/production-orders/${id}`, data),

  remove: (id: number | string) =>
    api.delete(`/production-orders/${id}`),

  updateStatus: (id: number | string, status: string) =>
    api.patch(`/production-orders/${id}/status`, { status }),
}
