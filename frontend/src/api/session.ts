const key = 'framevault.session'
let memoryToken: string | null = null

export function getToken(): string | null {
  try { return sessionStorage.getItem(key) || memoryToken } catch { return memoryToken }
}

export function setToken(token: string | null) {
  memoryToken = token
  try {
    if (token) sessionStorage.setItem(key, token)
    else sessionStorage.removeItem(key)
  } catch { /* Private browser policies can disable storage; in-memory login still works. */ }
}
