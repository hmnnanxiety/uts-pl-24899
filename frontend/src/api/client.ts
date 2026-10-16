import axios from 'axios'
import { getToken, setToken } from './session'

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, ''),
  timeout: 15000,
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token && config.url !== '/login') config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(response => response, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && error.config?.url !== '/login') {
    // Ignore a late response from an older session after a new login.
    if (error.config?.headers.Authorization === `Bearer ${getToken()}`) {
      setToken(null)
      window.dispatchEvent(new Event('framevault:unauthorized'))
    }
  }
  return Promise.reject(error)
})
