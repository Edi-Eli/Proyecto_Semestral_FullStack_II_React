/**
 * API de Cuentas Corrientes.
 * GET /mia, GET /{clienteId}, GET /{clienteId}/movimientos, POST /, PATCH /{clienteId}/limite,
 * POST /{clienteId}/abonos, GET /resumen-cobros
 */
import api, { extraerLista } from './client.js'

const RUTA_BASE = '/api/cuentas'

export async function miCuenta() {
  return api.get(`${RUTA_BASE}/mia`)
}

export async function cuenta(clienteId) {
  return api.get(`${RUTA_BASE}/${encodeURIComponent(clienteId)}`)
}

export async function movimientos(clienteId) {
  return extraerLista(await api.get(`${RUTA_BASE}/${encodeURIComponent(clienteId)}/movimientos`))
}

export async function abonar(clienteId, monto) {
  return api.post(`${RUTA_BASE}/${encodeURIComponent(clienteId)}/abonos`, { monto: Number(monto) })
}

export async function abrir(datos = {}) {
  return api.post(RUTA_BASE, datos)
}

export async function ajustarLimite(clienteId, limiteCredito) {
  return api.patch(`${RUTA_BASE}/${encodeURIComponent(clienteId)}/limite`, { limiteCredito: Number(limiteCredito) })
}

export async function resumenCobros() {
  return extraerLista(await api.get(`${RUTA_BASE}/resumen-cobros`))
}

export default { miCuenta, cuenta, movimientos, abonar, abrir, ajustarLimite, resumenCobros }
