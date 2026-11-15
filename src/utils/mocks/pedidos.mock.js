/**
 * Mock de pedidos (TEMPORAL)
 * Fuente de productos/stock: catálogo simulado de Sebas (src/api/mock.js).
 */
import { obtenerProducto, actualizarStock } from '../../api/mock.js'
import { registrarCargo } from './cuentas.mock.js'

const esperar = (ms = 350) => new Promise((r) => setTimeout(r, ms))

const PEDIDOS = [
  { id: 1, codigo: 'ORDER2024070501', nro: '2024070501', usuarioId: 'maria.torres@gmail.com', cliente: { nombre: 'Maria', apellidos: 'Torres Silva', correo: 'maria.torres@gmail.com' }, direccion: { calle: 'Pasaje Las Flores 8', depto: '', region: 'Región Metropolitana de Santiago', comuna: 'Providencia', indicaciones: '' }, tipoEntrega: 'DESPACHO', metodoPago: 'CONTADO', items: [{ productoId: 1, nombre: 'Cemento Polpaico gris 25KG', precio: 5490, cantidad: 2, subtotal: 10980 }], total: 10980, fecha: '2024-07-05T10:30:00', estado: 'ENTREGADA' },
  { id: 2, codigo: 'ORDER2024071502', nro: '2024071502', usuarioId: 'maria.torres@gmail.com', cliente: { nombre: 'Maria', apellidos: 'Torres Silva', correo: 'maria.torres@gmail.com' }, direccion: { calle: 'Pasaje Las Flores 8', depto: '', region: 'Región Metropolitana de Santiago', comuna: 'Providencia', indicaciones: '' }, tipoEntrega: 'RETIRO', metodoPago: 'CUENTA_CORRIENTE', items: [{ productoId: 12, nombre: 'Esmeril Angular Electrico', precio: 45990, cantidad: 1, subtotal: 45990 }], total: 45990, fecha: '2024-07-15T15:45:00', estado: 'PENDIENTE' },
]
let siguienteId = PEDIDOS.length + 1

export async function crear({ items = [], direccion = {}, tipoEntrega = 'RETIRO', metodoPago = 'CONTADO' } = {}) {
  await esperar()
  if (!items.length) { const e = new Error('El pedido no tiene productos.'); e.status = 422; throw e }

  const detalle = []
  for (const { productoId, cantidad } of items) {
    const p = await obtenerProducto(productoId)
    if (!p) { const e = new Error('Producto no encontrado.'); e.status = 404; throw e }
    const cant = Number(cantidad)
    if (cant > p.stock) { const e = new Error(`Stock insuficiente para "${p.nombre}" (disponible: ${p.stock}).`); e.status = 422; throw e }
    const precio = p.enOferta && p.precioOferta > 0 ? p.precioOferta : p.precio
    detalle.push({ productoId: p.id, nombre: p.nombre, precio, cantidad: cant, subtotal: precio * cant })
  }

  const total = detalle.reduce((suma, i) => suma + i.subtotal, 0)
  const id = siguienteId
  if (metodoPago === 'CUENTA_CORRIENTE') registrarCargo(total, id)

  for (const it of detalle) await actualizarStock(it.productoId, { cantidad: it.cantidad, accion: 'RETIRAR' })

  const ahora = new Date()
  const pedido = {
    id, codigo: `ORDER${ahora.getTime()}`, nro: String(ahora.getTime()).slice(-10),
    usuarioId: 'cliente@demo.cl',
    cliente: { nombre: 'Cliente', apellidos: 'Demo', correo: 'cliente@demo.cl' },
    direccion, tipoEntrega, metodoPago, items: detalle, total,
    fecha: ahora.toISOString(),
    estado: metodoPago === 'CUENTA_CORRIENTE' ? 'PENDIENTE' : 'APROBADA',
  }
  PEDIDOS.unshift(pedido)
  siguienteId += 1
  return { ...pedido }
}

export async function mios() { await esperar(); return PEDIDOS.map((p) => ({ ...p })) }
export async function listar({ estado } = {}) { await esperar(); return (estado ? PEDIDOS.filter((p) => p.estado === estado) : PEDIDOS).map((p) => ({ ...p })) }

export async function detalle(id) {
  await esperar()
  const pedido = PEDIDOS.find((p) => p.id === Number(id))
  if (!pedido) { const e = new Error('Pedido no encontrado.'); e.status = 404; throw e }
  return { ...pedido }
}

export async function cambiarEstado(id, estado) {
  await esperar()
  const pedido = PEDIDOS.find((p) => p.id === Number(id))
  if (!pedido) { const e = new Error('Pedido no encontrado.'); e.status = 404; throw e }
  if (estado === 'RECHAZADA' && pedido.estado !== 'RECHAZADA') {
    for (const it of pedido.items) await actualizarStock(it.productoId, { cantidad: it.cantidad, accion: 'AGREGAR' })
  }
  pedido.estado = estado
  return { ...pedido }
}

export async function boleta(id) { return detalle(id) }
export async function porUsuario(usuarioId) {
  await esperar()
  const clave = String(usuarioId)
  return PEDIDOS.filter((p) => String(p.usuarioId) === clave || p.cliente?.correo === clave).map((p) => ({ ...p }))
}

export default { crear, mios, listar, detalle, cambiarEstado, boleta, porUsuario }