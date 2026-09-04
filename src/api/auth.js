import { request, setToken } from './http'

export function sendSms(mobile, purpose = 'login') {
  return request('/api/auth/sms/send', {
    method: 'POST',
    auth: false,
    body: { mobile, purpose },
  })
}

export async function loginUser(payload) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: payload,
  })
  if (data?.token) setToken(data.kind === 'admin' ? 'admin' : 'user', data.token)
  return data
}

export async function registerUser(payload) {
  const data = await request('/api/auth/register', {
    method: 'POST',
    auth: false,
    body: payload,
  })
  if (data?.token) setToken('user', data.token)
  return data
}

export async function loginAdmin(account, password) {
  const data = await request('/api/auth/admin/login', {
    method: 'POST',
    auth: false,
    body: { account, password },
  })
  if (data?.token) setToken('admin', data.token)
  return data
}

export function fetchMe(kind = 'auto') {
  return request('/api/auth/me', { kind })
}
