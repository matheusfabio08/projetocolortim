import { api } from '@/lib/api'

export const pesagemService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/pesagem', { params }),

  create: (data: Record<string, unknown>) =>
    api.post('/pesagem', data),

  update: (id: number | string, data: Record<string, unknown>) =>
    api.put(`/pesagem/${id}`, data),

  remove: (id: number | string) =>
    api.delete(`/pesagem/${id}`),
}
