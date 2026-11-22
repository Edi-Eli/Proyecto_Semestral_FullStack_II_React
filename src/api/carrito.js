/**
 * API de Carrito (persistente por usuario, en el backend).
 * GET /api/carrito, POST/PUT/DELETE /api/carrito/items...
 */
import api, { extraerLista } from './client.js'

const RUTA_BASE = '/api/carrito'

export async function obtener() {
  return (await api.get(RUTA_BASE)) || { items: [] }
}

export async function agregar(productoId, cantidad = 1) {
  return api.post(`${RUTA_BASE}/items`, { productoId: Number(productoId), cantidad: Number(cantidad) })
}

export async function actualizarCantidad(productoId, cantidad) {
  return api.put(`${RUTA_BASE}/items/${productoId}`, { cantidad: Number(cantidad) })
}

export async function eliminar(productoId) {
  return api.delete(`${RUTA_BASE}/items/${productoId}`)
}

export async function vaciar() {
  return api.delete(RUTA_BASE)
}

export function extraerItems(datos) {
  if (!datos) return []
  if (Array.isArray(datos)) return datos
  if (Array.isArray(datos.items)) return datos.items
  return extraerLista(datos)
}

export default { obtener, agregar, actualizarCantidad, eliminar, vaciar, extraerItems }
