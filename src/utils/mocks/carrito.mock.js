/**
 * Mock del carrito (TEMPORAL)
 * Fuente de productos: catálogo simulado de Sebas (src/api/mock.js).
 */
import { obtenerProducto } from '../../api/mock.js'

let items = []
let siguienteId = 1
const esperar = (ms = 200) => new Promise((r) => setTimeout(r, ms))
const clonar = () => items.map((i) => ({ ...i }))

export async function obtener() {
  await esperar()
  return { id: 1, items: clonar() }
}

export async function agregar(productoId, cantidad = 1) {
  const producto = await obtenerProducto(productoId)
  if (!producto) { const e = new Error('Producto no encontrado.'); e.status = 404; throw e }
  await esperar()
  const existente = items.find((i) => i.productoId === Number(productoId))
  const total = (existente ? existente.cantidad : 0) + Number(cantidad)
  if (total > producto.stock) { const e = new Error(`Solo hay ${producto.stock} unidades disponibles.`); e.status = 422; throw e }
  const precio = producto.enOferta && producto.precioOferta > 0 ? producto.precioOferta : producto.precio
  if (existente) existente.cantidad = total
  else items.push({ id: siguienteId++, productoId: producto.id, nombre: producto.nombre, precio, imagen: producto.imagen, cantidad: total })
  return obtener()
}

export async function actualizarCantidad(productoId, cantidad) {
  await esperar()
  const nueva = Number(cantidad)
  if (nueva <= 0) { items = items.filter((i) => i.productoId !== Number(productoId)); return obtener() }
  const producto = await obtenerProducto(productoId)
  if (producto && nueva > producto.stock) { const e = new Error(`Solo hay ${producto.stock} unidades disponibles.`); e.status = 422; throw e }
  const item = items.find((i) => i.productoId === Number(productoId))
  if (item) item.cantidad = nueva
  return obtener()
}

export async function eliminar(productoId) {
  await esperar()
  items = items.filter((i) => i.productoId !== Number(productoId))
  return obtener()
}

export async function vaciar() {
  await esperar()
  items = []
  return { id: 1, items: [] }
}

export default { obtener, agregar, actualizarCantidad, eliminar, vaciar }