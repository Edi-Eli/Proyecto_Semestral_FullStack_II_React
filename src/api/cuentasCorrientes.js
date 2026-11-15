/**
 * API de Cuentas Corrientes
 * GET /mia, GET /{clienteId}, GET /{clienteId}/movimientos, POST /, PATCH /{clienteId}/limite,
 * POST /{clienteId}/abonos, GET /resumen-cobros
 */
import api from './client.js'
import * as mock from '../utils/mocks/cuentas.mock.js'

const USAR_MOCK = (import.meta.env.VITE_USAR_MOCK ?? 'true') !== 'false'
const RUTA_BASE = '/api/cuentas'

export async function miCuenta() {
  if (USAR_MOCK) return mock.miCuenta()
  return api.get(`${RUTA_BASE}/mia`)
}
export async function cuenta(clienteId) {
  if (USAR_MOCK) return mock.cuenta(clienteId)
  return api.get(`${RUTA_BASE}/${encodeURIComponent(clienteId)}`)
}
export async function movimientos(clienteId) {
  if (USAR_MOCK) return mock.movimientos(clienteId)
  return api.get(`${RUTA_BASE}/${encodeURIComponent(clienteId)}/movimientos`)
}
export async function abonar(clienteId, monto) {
  if (USAR_MOCK) return mock.abonar(monto)
  return api.post(`${RUTA_BASE}/${encodeURIComponent(clienteId)}/abonos`, { monto: Number(monto) })
}
export async function abrir(datos = {}) {
  if (USAR_MOCK) return mock.abrir(datos)
  return api.post(RUTA_BASE, datos)
}
export async function ajustarLimite(clienteId, limiteCredito) {
  if (USAR_MOCK) return mock.ajustarLimite(limiteCredito)
  return api.patch(`${RUTA_BASE}/${encodeURIComponent(clienteId)}/limite`, { limiteCredito: Number(limiteCredito) })
}
export async function resumenCobros() {
  if (USAR_MOCK) return mock.resumenCobros()
  return api.get(`${RUTA_BASE}/resumen-cobros`)
}
export default { miCuenta, cuenta, movimientos, abonar, abrir, ajustarLimite, resumenCobros }