/**
 * API de Usuarios (administración) — Ferretería Los Maestros
 * ------------------------------------------------------------------
 * Responsable: Edi
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

/** Lista todos los usuarios (acepta arreglo, página Spring o HATEOAS). */
export async function listarUsuarios() {
  return extraerLista(await api.get(RUTA_BASE))
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
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarEstado,
}
