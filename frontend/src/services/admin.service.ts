import { api } from '@/lib/api'

export const adminService = {
  getUsers: () =>
    api.get('/admin/users'),

  createUser: (data: Record<string, unknown>) =>
    api.post('/admin/users', data),

  updateUser: (id: number | string, data: Record<string, unknown>) =>
    api.put(`/admin/users/${id}`, data),

  removeUser: (id: number | string) =>
    api.delete(`/admin/users/${id}`),
}
