import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'

export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: {
    email: string
    password: string
    full_name: string
    company_name: string
    country: string
  }) => api.post('/auth/register', data),

  verify2FA: (temp_token: string, code: string) =>
    api.post('/auth/2fa/verify', { temp_token, code }),

  setup2FA: () => api.post('/auth/2fa/setup'),

  confirm2FA: (code: string) => api.post('/auth/2fa/confirm', { code }),

  disable2FA: (code: string) => api.post('/auth/2fa/disable', { code }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),

  me: () => api.get('/auth/me'),
}

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
}

// Users (admin)
export const usersApi = {
  list: (params?: { page?: number; per_page?: number; tenant_id?: string }) =>
    api.get('/users', { params }),
  get: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: Partial<{ full_name: string; role: string; is_active: boolean }>) =>
    api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
}

export const extractError = (err: unknown): string => {
  const axiosErr = err as AxiosError<{ detail: string | { msg: string }[] }>
  const detail = axiosErr?.response?.data?.detail
  if (!detail) return 'An unexpected error occurred'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(', ')
  return 'An unexpected error occurred'
}
