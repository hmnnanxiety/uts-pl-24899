import { ref } from 'vue'
import { authApi } from '../api/auth'
import { getToken, setToken } from '../api/session'
import { errorMessage, statusOf } from '../api/errors'
import type { User } from '../types'

const user = ref<User | null>(null)
const ready = ref(false)
const sessionError = ref('')
const notice = ref('')
let restoring: Promise<void> | undefined
function clear() {
  setToken(null)
  user.value = null
  sessionError.value = ''
  ready.value = true
}
async function restore() {
  if (ready.value) return
  if (restoring) return restoring
  restoring = (async () => {
    sessionError.value = ''
    if (!getToken()) {
      ready.value = true
      return
    }
    try {
      user.value = await authApi.me()
      ready.value = true
    } catch (error) {
      if (statusOf(error) === 401) clear()
      else sessionError.value = errorMessage(error)
    }
  })().finally(() => {
    restoring = undefined
  })
  return restoring
}
window.addEventListener('framevault:unauthorized', () => {
  clear()
  notice.value = 'Your session has ended. Sign in to continue.'
})
export function useAuth() {
  return {
    user,
    ready,
    sessionError,
    notice,
    restore,
    clear,
    async login(email: string, password: string) {
      const result = await authApi.login(email, password)
      setToken(result.token)
      user.value = result.user
      ready.value = true
      notice.value = ''
      sessionError.value = ''
    },
    async logout() {
      notice.value = ''
      try {
        await authApi.logout()
      } catch (error) {
        if (statusOf(error) !== 401)
          notice.value =
            'Signed out on this device. The server could not revoke the session; contact your studio administrator if this is a shared device.'
      } finally {
        clear()
      }
    },
  }
}
