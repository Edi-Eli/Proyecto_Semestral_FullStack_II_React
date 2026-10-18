import { useState } from 'react'
import AuthContext from './authContext.js'
import { getUsuarioByCorreo, createUsuario, updateUsuario } from '../data/crudService.js'

const CLAVE_SESION = 'usuarioActivo'

function leerSesionInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE_SESION)
    return guardado ? JSON.parse(guardado) : null
  } catch {
    return null
  }
}

export default function AuthProvider({ children }) {
  const [usuarioActivo, setUsuarioActivo] = useState(leerSesionInicial)

  function login(correo, password) {
    const usuario = getUsuarioByCorreo(correo)
    if (usuario && usuario.password === password) {
      setUsuarioActivo(usuario)
      localStorage.setItem(CLAVE_SESION, JSON.stringify(usuario))
      return { ok: true, usuario }
    }
    return { ok: false, mensaje: 'Correo o contraseña incorrectos.' }
  }

  function logout() {
    setUsuarioActivo(null)
    localStorage.removeItem(CLAVE_SESION)
  }

  function registrar(datosUsuario) {
    const nuevo = createUsuario(datosUsuario)
    setUsuarioActivo(nuevo)
    localStorage.setItem(CLAVE_SESION, JSON.stringify(nuevo))
    return { ok: true, usuario: nuevo }
  }

  function actualizarPerfil(datos) {
    if (!usuarioActivo) return null
    const actualizado = { ...usuarioActivo, ...datos }
    updateUsuario(usuarioActivo.run, actualizado)
    setUsuarioActivo(actualizado)
    localStorage.setItem(CLAVE_SESION, JSON.stringify(actualizado))
    return actualizado
  }

  return (
    <AuthContext.Provider
      value={{ usuarioActivo, login, logout, registrar, actualizarPerfil }}
    >
      {children}
    </AuthContext.Provider>
  )
}