import { api } from './client'
import type { Gear, GearInput } from '../types'

export const gearApi = {
  async list() { return (await api.get<{ data: Gear[] }>('/gear')).data.data },
  async get(id: string | number) { return (await api.get<{ data: Gear }>(`/gear/${id}`)).data.data },
  async create(input: GearInput) { return (await api.post<{ data: Gear }>('/gear', input)).data.data },
  async update(id: number, input: GearInput) { return (await api.put<{ data: Gear }>(`/gear/${id}`, input)).data.data },
  async remove(id: number) { await api.delete(`/gear/${id}`) },
}
