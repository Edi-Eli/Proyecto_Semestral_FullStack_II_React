/**
 * API de Autenticación — Ferretería Los Maestros
 * ------------------------------------------------------------------
 * Responsable: Edi 
 *
 * Envuelve las rutas de autenticación del backend Spring Boot (monolito).
 * Toda la salida HTTP pasa por `./client.js` (token, errores, timeout).
 *
 * Contrato asumido (debe coincidir con el documento 02 del backend):
 *   POST /api/auth/login     { correo, password }  ->  { token, usuario }
 *   POST /api/auth/registro  { ...datos cliente }  ->  { token?, usuario? }
 *   GET  /api/auth/sesion                          ->  { usuario } (valida el token)
 *
 * Regla de seguridad (área K.1): en la sesión solo se guarda el token y la
 * información mínima del usuario. NUNCA la contraseña ni el objeto completo.
 */
import api, { guardarSesion, limpiarSesion, leerSesion } from './client.js'

const RUTAS = {
  login: '/api/auth/login',
  registro: '/api/auth/registro',
  sesion: '/api/auth/sesion',
}

/**
 * Reduce un usuario del backend a los campos mínimos que se persisten.
 * Tolera variantes de nombres: run/id, tipoUsuario/rol.
 */
export function usuarioMinimo(usuario) {
  if (!usuario) return null
  const { run, nombre, correo, tipoUsuario, id, rol } = usuario
  return {
    run: run ?? id ?? null,
    nombre: nombre ?? '',
    correo: correo ?? '',
    tipoUsuario: tipoUsuario ?? rol ?? 'Cliente',
  }
}

/**
 * Inicia sesión contra la API y persiste la sesión.
 * `ignorar401` evita que un 401 de credenciales inválidas dispare el logout
 * global del cliente HTTP (aquí el 401 es esperable y se informa al usuario).
 * @returns {Promise<{ token: string, usuario: object }>}
 */
export async function login(correo, password) {
  const datos = await api.post(
    RUTAS.login,
    { correo: String(correo).trim(), password },
    { ignorar401: true },
  )

  const token = datos?.token || datos?.accessToken || datos?.jwt
  if (!token) {
    throw new Error('El servidor no devolvió un token de sesión. Contacte al administrador.')
  }

  const usuario = usuarioMinimo(datos?.usuario || datos?.user || null)
  guardarSesion(token, usuario)
  return { token, usuario }
}

/**
 * Registra un cliente nuevo. Si el backend devuelve token, deja la sesión
 * iniciada automáticamente (auto-login); si no, el usuario debe ir a /login.
 * @returns {Promise<{ token: string|null, usuario: object|null }>}
 */
export async function registro(datosUsuario) {
  const datos = await api.post(RUTAS.registro, datosUsuario)

  const token = datos?.token || datos?.accessToken || null
  const usuario = usuarioMinimo(datos?.usuario || datos?.user || null)
  if (token) guardarSesion(token, usuario || usuarioMinimo(datosUsuario))

  return { token: token || null, usuario }
}

/**
 * Revalida el token guardado consultando la sesión actual. Se usa al recargar
 * la app para decidir si el usuario sigue autenticado (token no expirado).
 * @returns {Promise<object|null>} usuario mínimo o null
 */
export async function validarSesion() {
  const datos = await api.get(RUTAS.sesion)
  return usuarioMinimo(datos?.usuario || datos?.user || datos)
}

/** Cierra la sesión en el cliente (borra token y usuario del almacenamiento). */
export function logout() {
  limpiarSesion()
}

export { leerSesion }

export default { login, registro, validarSesion, logout, leerSesion, usuarioMinimo }
