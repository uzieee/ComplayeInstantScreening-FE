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
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// ── Auth
export const authApi = {
  login:          (email: string, password: string) => api.post('/auth/login', { email, password }),
  register:       (data: object) => api.post('/auth/register', data),
  verify2FA:      (temp_token: string, code: string) => api.post('/auth/2fa/verify', { temp_token, code }),
  setup2FA:       () => api.post('/auth/2fa/setup'),
  confirm2FA:     (code: string, pending_secret: string) => api.post(`/auth/2fa/confirm?pending_secret=${pending_secret}`, { code }),
  disable2FA:     (code: string) => api.post('/auth/2fa/disable', { code }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  me:             () => api.get('/auth/me'),
}

// ── Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
}

// ── Screening
export const screeningApi = {
  screen: (data: {
    name: string
    country?: string
    entity_type?: string
    date_of_birth?: string
    sources?: string[]
  }) => api.post('/screening', data),

  batch: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/screening/batch', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },

  history:    (page = 1) => api.get(`/screening/history?page=${page}`),
  getSession: (id: string) => api.get(`/screening/${id}`),
  downloadReport: (id: string) => api.get(`/screening/${id}/report/download`, { responseType: 'blob' }),
}

// ── Audit
export const auditApi = {
  list: (page = 1, action?: string) => api.get('/audit', { params: { page, per_page: 50, action } }),
}

// ── Collector
export const collectorApi = {
  runSync: () => api.post('/collector/run/sync'),
  status:  () => api.get('/collector/status'),
}

// ── Users
export const usersApi = {
  me:     ()             => api.get('/users/me'),
  updateMe: (data: object) => api.patch('/users/me', data),
  list:   ()             => api.get('/users'),
  update: (id: string, data: object) => api.patch(`/users/${id}`, data),
}

export const extractError = (err: unknown): string => {
  const e = err as AxiosError<{ detail: string | { msg: string }[] }>
  const d = e?.response?.data?.detail
  if (!d) return 'An unexpected error occurred'
  if (typeof d === 'string') return d
  if (Array.isArray(d)) return d.map((x) => x.msg).join(', ')
  return 'An unexpected error occurred'
}
