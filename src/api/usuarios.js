/**
 * API de Usuarios (administración) — Ferretería Los Maestros
 * ------------------------------------------------------------------
 *
 * Contrato asumido (debe coincidir con el documento 02 del backend):
 *   GET    /api/usuarios                 -> lista de usuarios
 *   GET    /api/usuarios/{run}           -> un usuario
 *   POST   /api/usuarios                 -> crear usuario
 *   PUT    /api/usuarios/{run}           -> actualizar usuario
 *   DELETE /api/usuarios/{run}           -> eliminar usuario
 *   PATCH  /api/usuarios/{run}/estado    -> activar/desactivar { activo: boolean }
 *
 * El panel de administración NO es visible para clientes; aun así, el
 * backend debe validar el rol (defensa en profundidad).
 */
import api, { extraerLista } from './client.js'

const RUTA_BASE = '/api/usuarios'

const ruta = (run) => `${RUTA_BASE}/${encodeURIComponent(run)}`

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

/** Lista usuarios con paginación opcional. */
export async function listarUsuarios({ page = 0, size = 20, rol, activo, q } = {}) {
  const query = construirQuery({ page, size, rol, activo, q })
  return extraerLista(await api.get(`${RUTA_BASE}${query}`))
}

/** Recorre todas las páginas y devuelve el listado completo. */
export async function listarUsuariosTodos({ size = 200, rol, activo, q } = {}) {
  const primera = normalizarPagina(
    await api.get(`${RUTA_BASE}${construirQuery({ page: 0, size, rol, activo, q })}`),
  )
  const usuarios = [...primera.content]
  for (let page = 1; page < primera.totalPages; page += 1) {
    const siguiente = normalizarPagina(
      await api.get(`${RUTA_BASE}${construirQuery({ page, size, rol, activo, q })}`),
    )
    usuarios.push(...siguiente.content)
  }
  return usuarios
}

/** Obtiene un usuario por RUN. */
export async function obtenerUsuario(run) {
  return api.get(ruta(run))
}

/** Crea un usuario nuevo. */
export async function crearUsuario(datos) {
  return api.post(RUTA_BASE, datos)
}

/** Actualiza un usuario existente (sin cambiar su contraseña salvo que se envíe). */
export async function actualizarUsuario(run, datos) {
  return api.put(ruta(run), datos)
}

/** Elimina un usuario. */
export async function eliminarUsuario(run) {
  return api.delete(ruta(run))
}

/**
 * Activa o desactiva un usuario (área B/F: el contexto exige "desactivar").
 * @param {string} run
 * @param {boolean} activo
 */
export async function cambiarEstado(run, activo) {
  return api.patch(`${ruta(run)}/estado`, { activo: Boolean(activo) })
}

export default {
  listarUsuarios,
  listarUsuariosTodos,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarEstado,
}
