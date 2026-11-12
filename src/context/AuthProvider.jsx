import { useCallback, useEffect, useState } from 'react'
import AuthContext from './authContext.js'
import { useCart } from './cartContext.js'
import * as authApi from '../api/auth.js'
import { setHandlerSesionExpirada, guardarSesion, leerSesion } from '../api/client.js'
import { actualizarUsuario } from '../api/usuarios.js'

/**
 * AuthProvider — Autenticación real con JWT
 * ------------------------------------------------------------------
 * Responsable: Edi
 *
 * Estado que expone:
 *   usuario (alias usuarioActivo) → { run, nombre, correo, tipoUsuario } | null
 *   token                         → string ('')
 *   estaAutenticado               → boolean
 *   tieneRol(rol|roles[])         → boolean
 *   login(correo, password)       → Promise<{ ok, usuario?, mensaje? }>
 *   logout()                      → borra token + usuario + carrito
 *   registrar(datos)              → Promise<{ ok, usuario?, mensaje? }>
 *   actualizarPerfil(datos)       → Promise<usuario|null>
 *
 * Seguridad: NUNCA se guarda la contraseña ni el objeto completo del
 * usuario. La sesión persiste en `client.js` como token + usuario mínimo.
 * `usuarioActivo` se mantiene como alias para no romper a los consumidores
 * existentes (Navbar, AdminLayout, AdminPerfil, Checkout).
 */
export default function AuthProvider({ children }) {
  // AuthProvider vive dentro de CartProvider (ver AppProviders) para poder
  // limpiar el carrito al cerrar sesión.
  const { limpiarCarrito } = useCart()

  const [usuario, setUsuario] = useState(() => leerSesion().usuario)
  const [token, setToken] = useState(() => leerSesion().token)

  // Si `client.js` recibe un 401 (token expirado), limpia también el estado React.
  useEffect(() => {
    setHandlerSesionExpirada(() => {
      setUsuario(null)
      setToken('')
    })
    return () => setHandlerSesionExpirada(null)
  }, [])

  /** Inicia sesión contra la API; guarda token + usuario mínimo. */
  const login = useCallback(async (correo, password) => {
    try {
      const { token: nuevoToken, usuario: nuevoUsuario } = await authApi.login(correo, password)
      setUsuario(nuevoUsuario)
      setToken(nuevoToken)
      return { ok: true, usuario: nuevoUsuario }
    } catch (error) {
      return { ok: false, mensaje: error.message || 'No se pudo iniciar sesión.' }
    }
  }, [])

  /** Cierra sesión: borra token/usuario (cliente) y vacía el carrito. */
  const logout = useCallback(() => {
    authApi.logout()
    limpiarCarrito()
    setUsuario(null)
    setToken('')
  }, [limpiarCarrito])

  /**
   * Registra un cliente. Si el backend inicia sesión al registrar (devuelve
   * token), se deja la sesión activa; si no, el usuario deberá ir a /login.
   */
  const registrar = useCallback(async (datosUsuario) => {
    try {
      const { token: nuevoToken, usuario: nuevoUsuario } = await authApi.registro(datosUsuario)
      if (nuevoToken) {
        setToken(nuevoToken)
        setUsuario(nuevoUsuario)
      }
      return { ok: true, usuario: nuevoUsuario, autenticado: Boolean(nuevoToken) }
    } catch (error) {
      return { ok: false, mensaje: error.message || 'No se pudo registrar el usuario.' }
    }
  }, [])

  /**
   * Actualiza el perfil del usuario autenticado (usado por AdminPerfil).
   * Actualiza también la sesión persistida con el usuario mínimo.
   */
  const actualizarPerfil = useCallback(
    async (datos) => {
      if (!usuario) return null
      const actualizado = await actualizarUsuario(usuario.run, datos)
      const minimo = authApi.usuarioMinimo(actualizado) || {
        ...usuario,
        nombre: datos?.nombre ?? usuario.nombre,
      }
      setUsuario(minimo)
      guardarSesion(token, minimo)
      return minimo
    },
    [usuario, token],
  )

  /** ¿El usuario autenticado tiene alguno de los roles indicados? */
  const tieneRol = useCallback(
    (...roles) => {
      if (!usuario) return false
      return roles.flat().includes(usuario.tipoUsuario)
    },
    [usuario],
  )

  const estaAutenticado = Boolean(token)

  return (
    <AuthContext.Provider
      value={{
        usuario,
        usuarioActivo: usuario, // alias de compatibilidad con el código existente
        token,
        estaAutenticado,
        tieneRol,
        login,
        logout,
        registrar,
        actualizarPerfil,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
