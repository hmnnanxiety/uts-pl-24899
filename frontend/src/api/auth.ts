import { api } from './client'
import type { User } from '../types'

export const authApi = {
  async login(email: string, password: string) {
    return (await api.post<{ token: string; user: User }>('/login', { email, password })).data
  },
  async me() { return (await api.get<{ data: User }>('/me')).data.data },
  async logout() { await api.post('/logout') },
}
