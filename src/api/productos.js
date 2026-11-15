/**
 * API del Catálogo (productos, categorías, subcategorías) — Ferretería Los Maestros
 * ------------------------------------------------------------------
 * Responsable: Sebas
 *
 * Mientras el backend del módulo `producto` no esté listo, responde el
 * catálogo simulado (VITE_USAR_MOCK). Al conectar el backend real, poner
 * VITE_USAR_MOCK=false y alinear los nombres del DTO con este modelo.
 *
 * Contrato asumido:
 *   GET    /api/productos                 ?page&size&q&categoriaId&subcategoriaId&enOferta&orden
 *   GET    /api/productos/{id}
 *   GET    /api/productos/ofertas         ?page&size
 *   GET    /api/categorias
 *   GET    /api/subcategorias             ?categoriaId
 *   POST   /api/productos
 *   PUT    /api/productos/{id}
 *   PATCH  /api/productos/{id}/stock      { cantidad, accion: AGREGAR|RETIRAR }
 *   DELETE /api/productos/{id}
 */
import api, { extraerLista } from './client.js'
import * as mock from './mock.js'

const USAR_MOCK = (import.meta.env.VITE_USAR_MOCK ?? 'true') !== 'false'

function construirQuery(ruta, parametros = {}) {
  const query = new URLSearchParams()
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      query.append(clave, valor)
    }
  })
  const texto = query.toString()
  return texto ? `${ruta}?${texto}` : ruta
}

export async function listar(opciones = {}) {
  if (USAR_MOCK) return mock.listarProductos(opciones)
  return api.get(construirQuery('/api/productos', opciones))
}

export async function detalle(id) {
  if (USAR_MOCK) return mock.obtenerProducto(id)
  return api.get(`/api/productos/${id}`)
}

export async function listarOfertas(opciones = {}) {
  if (USAR_MOCK) return mock.listarOfertas(opciones)
  return api.get(construirQuery('/api/productos/ofertas', opciones))
}

export async function listarCategorias() {
  if (USAR_MOCK) return mock.listarCategorias()
  return extraerLista(await api.get('/api/categorias'))
}

export async function listarSubcategorias(categoriaId) {
  if (USAR_MOCK) return mock.listarSubcategorias(categoriaId)
  return extraerLista(await api.get(construirQuery('/api/subcategorias', { categoriaId })))
}

export async function crearProducto(datos) {
  if (USAR_MOCK) return mock.crearProducto(datos)
  return api.post('/api/productos', datos)
}

export async function actualizarProducto(id, datos) {
  if (USAR_MOCK) return mock.actualizarProducto(id, datos)
  return api.put(`/api/productos/${id}`, datos)
}

export async function eliminarProducto(id) {
  if (USAR_MOCK) return mock.eliminarProducto(id)
  return api.delete(`/api/productos/${id}`)
}

export async function actualizarStock(id, datos) {
  if (USAR_MOCK) return mock.actualizarStock(id, datos)
  return api.patch(`/api/productos/${id}/stock`, datos)
}

export const usarMock = USAR_MOCK

export default {
  listar,
  detalle,
  listarOfertas,
  listarCategorias,
  listarSubcategorias,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  actualizarStock,
}
