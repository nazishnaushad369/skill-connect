import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — clear session and redirect to login
// NOTE: Token rotation is disabled on the backend (ROTATE_REFRESH_TOKENS=False)
// so we no longer attempt a refresh loop which caused second-login failures.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear and redirect if it's not the login/register endpoint itself
      const url = error.config?.url || ''
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  me: () => api.get('/auth/me/'),
  updateMe: (data) => api.patch('/auth/me/', data),
  refresh: (refresh) => api.post('/auth/refresh/', { refresh }),
  subscribe: (data) => api.post('/auth/subscribe/', data),
  subscriptionStatus: () => api.get('/auth/subscription/'),
  ping: () => api.post('/auth/ping/'),
}

// Users
export const usersAPI = {
  list: (params) => api.get('/users/', { params }),
  detail: (id) => api.get(`/users/${id}/`),
  delete: (id) => api.delete(`/users/${id}/`),
  stats: () => api.get('/users/admin/stats/'),
}

// Skills
export const skillsAPI = {
  list: (params) => api.get('/skills/', { params }),
  mine: () => api.get('/skills/mine/'),
  create: (data) => api.post('/skills/', data),
  delete: (id) => api.delete(`/skills/${id}/`),
  categories: () => api.get('/skills/categories/'),
}

// Matches
export const matchesAPI = {
  list: () => api.get('/matches/'),
  suggest: () => api.get('/matches/suggest/'),
  create: (data) => api.post('/matches/create/', data),
  accept: (id) => api.post(`/matches/${id}/accept/`),
}

// Messages
export const messagesAPI = {
  threads: () => api.get('/messages/threads/'),
  thread: (userId) => api.get(`/messages/${userId}/`),
  send: (data) => api.post('/messages/send/', data),
}

// Sessions
export const sessionsAPI = {
  list: (params) => api.get('/sessions/', { params }),
  create: (data) => api.post('/sessions/create/', data),
  update: (id, data) => api.patch(`/sessions/${id}/`, data),
  all: () => api.get('/sessions/all/'),
}

// Feedback
export const feedbackAPI = {
  create: (data) => api.post('/feedback/create/', data),
  userFeedback: (userId) => api.get(`/feedback/user/${userId}/`),
  mine: () => api.get('/feedback/'),
}

export default api
