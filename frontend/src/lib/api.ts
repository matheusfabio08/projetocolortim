import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

// Injeta token em todas as requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('colortim_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redireciona para login se 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('colortim_token')
      localStorage.removeItem('colortim_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)
