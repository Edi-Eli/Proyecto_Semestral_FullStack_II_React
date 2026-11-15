/**
 * API de Carrito
 * GET/POST/PUT/DELETE /api/carrito...
 */
import api, { extraerLista } from './client.js'
import * as mock from '../utils/mocks/carrito.mock.js'

const USAR_MOCK = (import.meta.env.VITE_USAR_MOCK ?? 'true') !== 'false'
const RUTA_BASE = '/api/carrito'

export async function obtener() {
  if (USAR_MOCK) return mock.obtener()
  return (await api.get(RUTA_BASE)) || { items: [] }
}
export async function agregar(productoId, cantidad = 1) {
  if (USAR_MOCK) return mock.agregar(productoId, cantidad)
  return api.post(`${RUTA_BASE}/items`, { productoId: Number(productoId), cantidad: Number(cantidad) })
}
export async function actualizarCantidad(productoId, cantidad) {
  if (USAR_MOCK) return mock.actualizarCantidad(productoId, cantidad)
  return api.put(`${RUTA_BASE}/items/${productoId}`, { cantidad: Number(cantidad) })
}
export async function eliminar(productoId) {
  if (USAR_MOCK) return mock.eliminar(productoId)
  return api.delete(`${RUTA_BASE}/items/${productoId}`)
}
export async function vaciar() {
  if (USAR_MOCK) return mock.vaciar()
  return api.delete(RUTA_BASE)
}
export function extraerItems(datos) {
  if (!datos) return []
  if (Array.isArray(datos)) return datos
  if (Array.isArray(datos.items)) return datos.items
  return extraerLista(datos)
}
export default { obtener, agregar, actualizarCantidad, eliminar, vaciar, extraerItems }