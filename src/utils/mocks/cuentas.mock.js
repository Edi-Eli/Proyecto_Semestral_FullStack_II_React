/**
 * Mock de cuentas corrientes (TEMPORAL)
 */
let CUENTA = {
  clienteId: 'cliente@demo.cl',
  limiteCredito: 500000,
  saldoActual: 120000,
  activa: true,
  fechaCreacion: '2024-01-15T09:00:00',
}

let MOVIMIENTOS = [
  { id: 1, tipo: 'CARGO', pedidoId: null, descripcion: 'Compra a cuenta', monto: 120000, saldoPosterior: 120000, fecha: '2024-07-01T11:00:00' },
]

const esperar = (ms = 250) => new Promise((resolver) => setTimeout(resolver, ms))
const resumen = () => ({ ...CUENTA, disponible: CUENTA.limiteCredito - CUENTA.saldoActual })
const nuevoId = () => MOVIMIENTOS.reduce((max, m) => Math.max(max, m.id), 0) + 1

export async function miCuenta() {
  await esperar()
  return resumen()
}

export async function cuenta() {
  await esperar()
  return resumen()
}

export async function movimientos() {
  await esperar()
  return MOVIMIENTOS.map((m) => ({ ...m }))
}

/** Registra un cargo (lo llama el mock de pedidos). Lanza 422 si supera el límite. */
export function registrarCargo(monto, pedidoId = null) {
  const nuevoSaldo = CUENTA.saldoActual + Number(monto)
  if (nuevoSaldo > CUENTA.limiteCredito) {
    const error = new Error('El monto supera el límite de crédito disponible.')
    error.status = 422
    throw error
  }
  CUENTA.saldoActual = nuevoSaldo
  MOVIMIENTOS.unshift({
    id: nuevoId(),
    tipo: 'CARGO',
    pedidoId,
    descripcion: 'Compra con cuenta corriente',
    monto: Number(monto),
    saldoPosterior: nuevoSaldo,
    fecha: new Date().toISOString(),
  })
  return resumen()
}

export async function abonar(monto) {
  await esperar()
  CUENTA.saldoActual = Math.max(0, CUENTA.saldoActual - Number(monto))
  MOVIMIENTOS.unshift({
    id: nuevoId(),
    tipo: 'ABONO',
    pedidoId: null,
    descripcion: 'Abono / pago de cuenta',
    monto: Number(monto),
    saldoPosterior: CUENTA.saldoActual,
    fecha: new Date().toISOString(),
  })
  return resumen()
}

export async function abrir(datos = {}) {
  await esperar()
  CUENTA = { ...CUENTA, ...datos, activa: true }
  return resumen()
}

export async function ajustarLimite(limite) {
  await esperar()
  CUENTA.limiteCredito = Number(limite)
  return resumen()
}

export async function resumenCobros() {
  await esperar()
  return [{ clienteId: CUENTA.clienteId, saldo: CUENTA.saldoActual, limite: CUENTA.limiteCredito }]
}

export default { miCuenta, cuenta, movimientos, abonar, abrir, ajustarLimite, resumenCobros, registrarCargo }