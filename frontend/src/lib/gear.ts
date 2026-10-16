import type { Availability, Category, Condition, Gear } from '../types'

export const categories: { value: Category; label: string; plural: string }[] = [
  { value: 'camera', label: 'Camera', plural: 'Cameras' },
  { value: 'lens', label: 'Lens', plural: 'Lenses' },
  { value: 'lighting', label: 'Lighting', plural: 'Lighting' },
  { value: 'tripod', label: 'Tripod', plural: 'Tripods' },
  { value: 'accessory', label: 'Accessory', plural: 'Accessories' },
]
export const conditions: { value: Condition; label: string }[] = [
  { value: 'excellent', label: 'Excellent' }, { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' }, { value: 'damaged', label: 'Damaged' },
]
export const statuses: { value: Availability; label: string }[] = [
  { value: 'available', label: 'Available' }, { value: 'in_use', label: 'In use' },
  { value: 'maintenance', label: 'Maintenance' },
]
export function labelFor(value: string): string {
  return [...categories, ...conditions, ...statuses].find(option => option.value === value)?.label || value
}
export function formatDate(value: string | null, withTime = false): string {
  if (!value) return 'Not recorded'
  // Treat purchase dates as calendar dates, without UTC/local date shifts.
  const date = new Date(withTime ? value : `${value.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(date.getTime())) return 'Not recorded'
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', ...(withTime ? { hour: '2-digit', minute: '2-digit' } as const : {}) }).format(date)
}
export function inventoryStats(items: Gear[]) {
  return { total: items.length, available: items.filter(i => i.status === 'available').length, in_use: items.filter(i => i.status === 'in_use').length, maintenance: items.filter(i => i.status === 'maintenance').length }
}
