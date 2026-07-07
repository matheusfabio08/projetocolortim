import { api } from '@/lib/api'

export const opStatusService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/op-status', { params }),

  update: (id: number | string, data: Record<string, unknown>) =>
    api.put(`/op-status/${id}`, data),
}
