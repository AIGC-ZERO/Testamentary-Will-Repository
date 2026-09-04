const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

export const TOKEN_USER = 'will-demo-user-token'
export const TOKEN_ADMIN = 'will-demo-admin-token'

export function getToken(kind = 'user') {
  return localStorage.getItem(kind === 'admin' ? TOKEN_ADMIN : TOKEN_USER) || ''
}

export function setToken(kind, token) {
  const key = kind === 'admin' ? TOKEN_ADMIN : TOKEN_USER
  if (token) localStorage.setItem(key, token)
  else localStorage.removeItem(key)
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_USER)
  localStorage.removeItem(TOKEN_ADMIN)
}

export class ApiError extends Error {
  constructor(message, code = -1, status = 0) {
    super(message)
    this.code = code
    this.status = status
  }
}

/**
 * @param {string} path
 * @param {{ method?: string, body?: any, kind?: 'user'|'admin'|'auto', auth?: boolean }} [opts]
 */
export async function request(path, opts = {}) {
  const method = opts.method || 'GET'
  const kind = opts.kind || 'auto'
  const auth = opts.auth !== false
  const headers = { Accept: 'application/json' }
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'

  if (auth) {
    let token = ''
    if (kind === 'admin') token = getToken('admin')
    else if (kind === 'user') token = getToken('user')
    else token = getToken('admin') || getToken('user')
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
  let res
  try {
    res = await fetch(url, {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    })
  } catch (err) {
    throw new ApiError(err?.message || '网络不可用', -1, 0)
  }

  let json = null
  try {
    json = await res.json()
  } catch {
    json = null
  }

  if (!res.ok) {
    throw new ApiError(json?.message || json?.msg || `请求失败(${res.status})`, json?.code ?? -1, res.status)
  }
  if (json && typeof json.code === 'number' && json.code !== 0) {
    throw new ApiError(json.msg || '业务失败', json.code, res.status)
  }
  return json?.data !== undefined ? json.data : json
}

export async function pingApi() {
  try {
    await request('/api/health', { auth: false })
    return true
  } catch {
    return false
  }
}
