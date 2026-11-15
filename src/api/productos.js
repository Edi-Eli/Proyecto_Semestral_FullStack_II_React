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

export async function listarCriticos(opciones = {}) {
  if (USAR_MOCK) return mock.listarCriticos(opciones)
  return extraerLista(await api.get(construirQuery('/api/productos/criticos', opciones)))
}

export async function listarCategorias() {
  if (USAR_MOCK) return mock.listarCategorias()
  return extraerLista(await api.get('/api/categorias'))
}

export async function listarSubcategorias(categoriaId) {
  if (USAR_MOCK) return mock.listarSubcategorias(categoriaId)
  return extraerLista(await api.get(construirQuery('/api/subcategorias', { categoriaId })))
}

export async function crearCategoria(datos) {
  if (USAR_MOCK) return mock.crearCategoria(datos)
  return api.post('/api/categorias', datos)
}

export async function actualizarCategoria(id, datos) {
  if (USAR_MOCK) return mock.actualizarCategoria(id, datos)
  return api.put(`/api/categorias/${id}`, datos)
}

export async function eliminarCategoria(id) {
  if (USAR_MOCK) return mock.eliminarCategoria(id)
  return api.delete(`/api/categorias/${id}`)
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
  listarCriticos,
  listarCategorias,
  listarSubcategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  actualizarStock,
}
