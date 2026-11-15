/**
 * API de Pedidos
 * POST /api/pedidos, GET /mios, GET ?estado, GET/{id}, PUT/{id}/estado, GET/{id}/boleta, GET/usuario/{usuarioId}
 */
import api, { extraerLista } from './client.js'
import * as mock from '../utils/mocks/pedidos.mock.js'

const USAR_MOCK = (import.meta.env.VITE_USAR_MOCK ?? 'true') !== 'false'
const RUTA_BASE = '/api/pedidos'

export async function crear(payload) {
  if (USAR_MOCK) return mock.crear(payload)
  return api.post(RUTA_BASE, payload)
}
export async function mios() {
  if (USAR_MOCK) return mock.mios()
  return extraerLista(await api.get(`${RUTA_BASE}/mios`))
}
export async function listar({ estado } = {}) {
  if (USAR_MOCK) return mock.listar({ estado })
  const query = estado ? `?estado=${encodeURIComponent(estado)}` : ''
  return extraerLista(await api.get(`${RUTA_BASE}${query}`))
}
export async function detalle(id) {
  if (USAR_MOCK) return mock.detalle(id)
  return api.get(`${RUTA_BASE}/${id}`)
}
export async function cambiarEstado(id, estado) {
  if (USAR_MOCK) return mock.cambiarEstado(id, estado)
  return api.put(`${RUTA_BASE}/${id}/estado`, { estado })
}
export async function boleta(id) {
  if (USAR_MOCK) return mock.boleta(id)
  return api.get(`${RUTA_BASE}/${id}/boleta`)
}
export async function porUsuario(usuarioId) {
  if (USAR_MOCK) return mock.porUsuario(usuarioId)
  return extraerLista(await api.get(`${RUTA_BASE}/usuario/${encodeURIComponent(usuarioId)}`))
}
export default { crear, mios, listar, detalle, cambiarEstado, boleta, porUsuario }