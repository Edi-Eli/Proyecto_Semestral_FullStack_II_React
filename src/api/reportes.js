/**
 * API de Reportes — consume los endpoints agregados del backend.
 *
 * GET /api/reportes/resumen       (Administrador)
 * GET /api/reportes/mas-vendidos  (Administrador / Vendedor)
 * GET /api/reportes/top-clientes  (Administrador)
 * GET /api/reportes/stock         (Administrador / Vendedor)
 */
import api from './client.js'

const RUTA_BASE = '/api/reportes'

export async function resumen() {
  return api.get(`${RUTA_BASE}/resumen`)
}

export async function masVendidos({ limite = 5 } = {}) {
  return api.get(`${RUTA_BASE}/mas-vendidos?limite=${encodeURIComponent(limite)}`)
}

export async function topClientes({ limite = 5 } = {}) {
  return api.get(`${RUTA_BASE}/top-clientes?limite=${encodeURIComponent(limite)}`)
}

export async function stock() {
  return api.get(`${RUTA_BASE}/stock`)
}

export default { resumen, masVendidos, topClientes, stock }
