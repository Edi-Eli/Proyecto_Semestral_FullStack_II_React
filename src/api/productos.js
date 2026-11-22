/**
 * API de Productos y Categorías.
 * Consume directamente el backend Spring Boot (doc 02 §4.3).
 */
import api, { extraerLista } from './client.js'

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

/** Normaliza la respuesta de Spring (Page o HATEOAS) al formato que usan las vistas. */
function normalizarPagina(datos) {
  if (!datos) return { content: [], totalElements: 0, totalPages: 1, number: 0, size: 0 }
  if (Array.isArray(datos.content)) return datos
  const content = extraerLista(datos)
  const page = datos.page || {}
  return {
    content,
    totalElements: page.totalElements ?? content.length,
    totalPages: page.totalPages ?? 1,
    number: page.number ?? 0,
    size: page.size ?? content.length,
  }
}

export async function listar(opciones = {}) {
  return normalizarPagina(await api.get(construirQuery('/api/productos', opciones)))
}

export async function detalle(id) {
  return api.get(`/api/productos/${id}`)
}

export async function listarOfertas(opciones = {}) {
  return normalizarPagina(await api.get(construirQuery('/api/productos/ofertas', opciones)))
}

export async function listarCriticos(opciones = {}) {
  return extraerLista(await api.get(construirQuery('/api/productos/criticos', opciones)))
}

export async function listarCategorias() {
  return extraerLista(await api.get('/api/categorias'))
}

export async function listarSubcategorias(categoriaId) {
  return extraerLista(await api.get(construirQuery('/api/subcategorias', { categoriaId })))
}

export async function crearSubcategoria(datos) {
  return api.post('/api/subcategorias', datos)
}

export async function actualizarSubcategoria(id, datos) {
  return api.put(`/api/subcategorias/${id}`, datos)
}

export async function eliminarSubcategoria(id) {
  return api.delete(`/api/subcategorias/${id}`)
}

export async function crearCategoria(datos) {
  return api.post('/api/categorias', datos)
}

export async function actualizarCategoria(id, datos) {
  return api.put(`/api/categorias/${id}`, datos)
}

export async function eliminarCategoria(id) {
  return api.delete(`/api/categorias/${id}`)
}

export async function crearProducto(datos) {
  return api.post('/api/productos', datos)
}

export async function actualizarProducto(id, datos) {
  return api.put(`/api/productos/${id}`, datos)
}

export async function eliminarProducto(id) {
  return api.delete(`/api/productos/${id}`)
}

export async function actualizarStock(id, datos) {
  return api.patch(`/api/productos/${id}/stock`, datos)
}

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
  crearSubcategoria,
  actualizarSubcategoria,
  eliminarSubcategoria,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  actualizarStock,
}
