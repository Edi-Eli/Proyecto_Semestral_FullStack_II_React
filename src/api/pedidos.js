/**
 * API de Pedidos.
 * POST /api/pedidos, GET /mios, GET ?estado, GET/{id}, PUT/{id}/estado, GET/{id}/boleta, GET/usuario/{usuarioId}
 */
import api, { extraerLista } from './client.js'

const RUTA_BASE = '/api/pedidos'

function construirQuery(parametros = {}) {
  const query = new URLSearchParams()
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      query.append(clave, valor)
    }
  })
  const texto = query.toString()
  return texto ? `?${texto}` : ''
}

/** Normaliza una página Spring/HATEOAS a { content, totalElements, totalPages, number }. */
function normalizarPagina(datos) {
  if (!datos) return { content: [], totalElements: 0, totalPages: 0, number: 0 }
  const content = extraerLista(datos)
  const page = datos.page || {}
  return {
    content,
    totalElements: page.totalElements ?? content.length,
    totalPages: page.totalPages ?? (content.length > 0 ? 1 : 0),
    number: page.number ?? 0,
  }
}

export async function crear(payload) {
  return api.post(RUTA_BASE, payload)
}

export async function mios() {
  return extraerLista(await api.get(`${RUTA_BASE}/mios`))
}

export async function listar({ estado } = {}) {
  const query = construirQuery({ estado })
  return extraerLista(await api.get(`${RUTA_BASE}${query}`))
}

/** Lista paginada para tablas administrativas. */
export async function listarPagina({ estado, page = 0, size = 12 } = {}) {
  const query = construirQuery({ estado, page, size })
  return normalizarPagina(await api.get(`${RUTA_BASE}${query}`))
}

export async function detalle(id) {
  return api.get(`${RUTA_BASE}/${id}`)
}

export async function cambiarEstado(id, estado) {
  return api.put(`${RUTA_BASE}/${id}/estado`, { estado })
}

export async function boleta(id) {
  return api.get(`${RUTA_BASE}/${id}/boleta`)
}

export async function porUsuario(usuarioId) {
  return extraerLista(await api.get(`${RUTA_BASE}/usuario/${encodeURIComponent(usuarioId)}`))
}

export default { crear, mios, listar, listarPagina, detalle, cambiarEstado, boleta, porUsuario }
