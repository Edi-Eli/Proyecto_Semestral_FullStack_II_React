/**
 * Mock de usuarios (TEMPORAL)
 * Solo para probar el panel sin backend. NO se toca api/usuarios.js (de Edi):
 * las vistas de Zeus eligen entre este mock y la API real según VITE_USAR_MOCK.
 */
import { usuariosIniciales } from '../../data/db.js'

const esperar = (ms = 250) => new Promise((r) => setTimeout(r, ms))

const usuarios = usuariosIniciales.map((u) => ({ ...u, activo: u.activo !== false }))

const sinPassword = (u) => {
  const copia = { ...u }
  delete copia.password
  return copia
}

export async function listarUsuarios() {
  await esperar()
  return usuarios.map(sinPassword)
}

export async function obtenerUsuario(run) {
  await esperar()
  const u = usuarios.find((x) => x.run === String(run))
  if (!u) { const e = new Error('Usuario no encontrado.'); e.status = 404; throw e }
  return sinPassword(u)
}

export default { listarUsuarios, obtenerUsuario }