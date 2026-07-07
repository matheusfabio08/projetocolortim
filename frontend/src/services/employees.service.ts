import { api } from '@/lib/api'

export const employeesService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/employees', { params }),

  getById: (id: number | string) =>
    api.get(`/employees/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post('/employees', data),

  update: (id: number | string, data: Record<string, unknown>) =>
    api.put(`/employees/${id}`, data),

  remove: (id: number | string) =>
    api.delete(`/employees/${id}`),
}
