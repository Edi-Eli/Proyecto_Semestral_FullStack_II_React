/**
 * API de Contacto — Ferretería Los Maestros
 * ------------------------------------------------------------------
 * Responsable: Edi
 *
 * Contrato asumido (debe coincidir con el documento 02 del backend):
 *   POST  /api/contactos               { nombre, correo, mensaje } -> mensaje creado
 *   GET   /api/contactos               -> lista de mensajes (solo admin/vendedor)
 *   PATCH /api/contactos/{id}/estado   { estado: 'LEIDO' | 'RESUELTO' }
 *
 * La EP3 exige un CR mínimo de mensajes de contacto: crear (formulario público)
 * y listar/marcar como leído o resuelto (vista administrativa).
 */
import api, { extraerLista } from './client.js'

const RUTA_BASE = '/api/contactos'

const ruta = (id) => `${RUTA_BASE}/${encodeURIComponent(id)}`

/**
 * Envía un mensaje de contacto desde el formulario público.
 * @param {{nombre: string, correo: string, mensaje: string}} datos
 */
export async function enviarMensaje({ nombre, correo, mensaje }) {
  return api.post(RUTA_BASE, {
    nombre: String(nombre).trim(),
    correo: String(correo).trim(),
    mensaje: String(mensaje).trim(),
  })
}

/** Lista los mensajes recibidos (vista administrativa: CR mínimo de EP3). */
export async function listarMensajes() {
  return extraerLista(await api.get(RUTA_BASE))
}

/**
 * Cambia el estado de un mensaje.
 * @param {string|number} id
 * @param {'LEIDO'|'RESUELTO'} estado
 */
export async function cambiarEstado(id, estado) {
  return api.patch(`${ruta(id)}/estado`, { estado })
}

/** Atajo: marca un mensaje como LEIDO. */
export function marcarLeido(id) {
  return cambiarEstado(id, 'LEIDO')
}

/** Atajo: marca un mensaje como RESUELTO. */
export function marcarResuelto(id) {
  return cambiarEstado(id, 'RESUELTO')
}

export default {
  enviarMensaje,
  listarMensajes,
  cambiarEstado,
  marcarLeido,
  marcarResuelto,
}
