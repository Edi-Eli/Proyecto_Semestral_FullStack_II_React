/**
 * Capa base de red — Ferretería Los Maestros
 * ------------------------------------------------------------------
 * Centraliza todas las peticiones HTTP al backend Spring Boot (monolito).
 * Responsable: Edi
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const CLAVE_TOKEN = 'ferreteria_token'
const CLAVE_USUARIO = 'ferreteria_usuario'
const TIEMPO_ESPERA_MS = 15000

let handlerSesionExpirada = null

/* ================== Sesión (token + usuario mínimo) ================== */

/**
 * Guarda el token y el usuario mínimo de la sesión.
 * Nunca guardar la contraseña ni el objeto completo del usuario (área K.1).
 */
export function guardarSesion(token, usuario) {
  try {
    if (token) localStorage.setItem(CLAVE_TOKEN, token)
    if (usuario) localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario))
  } catch {
    // Almacenamiento no disponible (modo privado / pruebas): se ignora.
  }
}

/** Devuelve `{ token, usuario }` de la sesión persistida. */
export function leerSesion() {
  try {
    const token = localStorage.getItem(CLAVE_TOKEN) || ''
    let usuario = null
    const guardado = localStorage.getItem(CLAVE_USUARIO)
    if (guardado) usuario = JSON.parse(guardado)
    return { token, usuario }
  } catch {
    return { token: '', usuario: null }
  }
}

/** Elimina token y usuario de la sesión (logout / token expirado). */
export function limpiarSesion() {
  try {
    localStorage.removeItem(CLAVE_TOKEN)
    localStorage.removeItem(CLAVE_USUARIO)
  } catch {
    // ignorar
  }
}

/**
 * Permite a AuthProvider registrar un callback que se ejecuta cuando una
 * petición recibe 401 (para limpiar su estado de React además del storage).
 */
export function setHandlerSesionExpirada(handler) {
  handlerSesionExpirada = handler
}

/* ================== Mensajes de error ================== */

const MENSAJES_ERROR = {
  400: 'La solicitud no es válida. Revise los datos enviados.',
  401: 'Su sesión ha expirado o las credenciales no son correctas.',
  403: 'No tiene permisos para realizar esta acción.',
  404: 'El recurso solicitado no existe.',
  409: 'Ya existe un registro con esos datos (posible duplicado).',
  422: 'Los datos enviados no superaron la validación del servidor.',
  500: 'Error interno del servidor. Intente nuevamente más tarde.',
}

function mensajePorEstado(estado) {
  return MENSAJES_ERROR[estado] || `Ocurrió un error inesperado (código ${estado}).`
}

/* ================== Petición HTTP ================== */

async function request(method, path, body, opciones = {}) {
  const { ignorar401 = false, headers = {}, timeoutMs = TIEMPO_ESPERA_MS } = opciones

  const cabeceras = { 'Content-Type': 'application/json', ...headers }
  const { token } = leerSesion()
  if (token) cabeceras.Authorization = `Bearer ${token}`

  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort(), timeoutMs)

  let respuesta
  try {
    respuesta = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: cabeceras,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controlador.signal,
    })
  } catch (error) {
    if (error && error.name === 'AbortError') {
      throw new Error('La solicitud tardó demasiado. Intente nuevamente.', { cause: error })
    }
    throw new Error('No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.', {
      cause: error,
    })
  } finally {
    clearTimeout(temporizador)
  }

  // Leer el cuerpo siempre (puede contener `mensaje`/`message` del backend).
  let datos = null
  const texto = await respuesta.text()
  if (texto) {
    try {
      datos = JSON.parse(texto)
    } catch {
      datos = texto
    }
  }

  // Token expirado / no autorizado: limpiar sesión y redirigir al login.
  // `ignorar401` evita esto en el login (credenciales inválidas = 401 legítimo).
  if (respuesta.status === 401 && !ignorar401) {
    limpiarSesion()
    if (typeof handlerSesionExpirada === 'function') handlerSesionExpirada()
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.assign('/login')
    }
  }

  if (!respuesta.ok) {
    const mensajeServidor =
      datos && typeof datos === 'object' && (datos.mensaje || datos.message)
        ? datos.mensaje || datos.message
        : null
    const error = new Error(mensajeServidor || mensajePorEstado(respuesta.status))
    error.status = respuesta.status
    throw error
  }

  return datos
}

/** Cliente HTTP con los métodos usados por los módulos de dominio. */
export const api = {
  get: (path, opciones) => request('GET', path, undefined, opciones),
  post: (path, body, opciones) => request('POST', path, body, opciones),
  put: (path, body, opciones) => request('PUT', path, body, opciones),
  patch: (path, body, opciones) => request('PATCH', path, body, opciones),
  delete: (path, opciones) => request('DELETE', path, undefined, opciones),
}

/**
 * Normaliza la respuesta de una colección, aceptando:
 *  - un arreglo directo,
 *  - una página de Spring Data `{ content: [...] }`,
 *  - una colección HATEOAS `{ _embedded: { <recurso>: [...] } }`.
 */
export function extraerLista(datos) {
  if (Array.isArray(datos)) return datos
  if (datos && Array.isArray(datos.content)) return datos.content
  if (datos && datos._embedded) {
    const primeraColeccion = Object.values(datos._embedded).find(Array.isArray)
    if (primeraColeccion) return primeraColeccion
  }
  return []
}

export default api
