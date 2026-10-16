export interface User {
  id: number
  name: string
  email: string
}
export type Category = 'camera' | 'lens' | 'lighting' | 'tripod' | 'accessory'
export type Condition = 'excellent' | 'good' | 'fair' | 'damaged'
export type Availability = 'available' | 'in_use' | 'maintenance'
export interface GearInput {
  code: string
  name: string
  brand: string
  model: string | null
  category: Category
  condition: Condition
  status: Availability
  storage_location: string | null
  purchase_date: string | null
  notes: string | null
}
export interface Gear extends GearInput {
  id: number
  created_by: number | null
  created_at: string
  updated_at: string
}
export type FieldErrors = Record<string, string[]>
