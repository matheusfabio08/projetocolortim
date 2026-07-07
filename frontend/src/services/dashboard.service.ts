import { api } from '@/lib/api'

export const dashboardService = {
  getSummary: () =>
    api.get('/dashboard'),
}
