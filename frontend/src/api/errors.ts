import axios from 'axios'
import type { FieldErrors } from '../types'

export function statusOf(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}
export function fieldErrors(error: unknown): FieldErrors {
  return axios.isAxiosError(error) && error.response?.status === 422
    ? error.response.data?.errors || {}
    : {}
}
export function errorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Something went wrong. Please try again.'
  if (!error.response)
    return 'We couldn’t reach the studio server. Check your connection and try again.'
  if (error.response.status === 401) return 'Your session has ended. Please sign in again.'
  if (error.response.status === 404) return 'This equipment is no longer in the archive.'
  if (error.response.status === 422) return 'Please check the highlighted fields.'
  if (error.response.status === 429) return 'Too many requests. Please wait a moment and try again.'
  return 'The studio server couldn’t complete that request. Please try again.'
}
