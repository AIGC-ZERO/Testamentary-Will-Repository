import { request } from './http'

export function fetchDashboard() {
  return request('/api/admin/dashboard', { kind: 'admin' })
}

export function fetchRegistrations(status) {
  const q = status ? `?status=${encodeURIComponent(status)}` : ''
  return request(`/api/admin/registrations${q}`, { kind: 'admin' })
}

export function approveRegistration(id) {
  return request(`/api/admin/registrations/${id}/approve`, { method: 'POST', kind: 'admin' })
}

export function supplementRegistration(id) {
  return request(`/api/admin/registrations/${id}/supplement`, { method: 'POST', kind: 'admin' })
}

export function rejectRegistration(id) {
  return request(`/api/admin/registrations/${id}/reject`, { method: 'POST', kind: 'admin' })
}

export function fetchAudits() {
  return request('/api/admin/audits', { kind: 'admin' })
}

export function fetchBusinesses(params = {}) {
  const q = new URLSearchParams()
  if (params.code) q.set('code', params.code)
  if (params.status) q.set('status', params.status)
  const qs = q.toString()
  return request(`/api/businesses${qs ? `?${qs}` : ''}`, { kind: 'user' })
}

export function createBusiness(payload) {
  return request('/api/businesses', { method: 'POST', kind: 'user', body: payload })
}

export function cancelBusiness(orderCode) {
  return request(`/api/businesses/${orderCode}/cancel`, { method: 'POST', kind: 'user' })
}
