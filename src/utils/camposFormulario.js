import { requerido, maxCaracteres, esCorreoValido, validarRun, validarContrasena } from './validaciones.js'

export function requisitosCorreo(correo) {
  const errores = []
  if (!requerido(correo)) {
    errores.push('El correo es requerido.')
    return errores
  }
  if (!maxCaracteres(correo, 100)) {
    errores.push('El correo no puede superar los 100 caracteres.')
  }
  if (!esCorreoValido(correo)) {
    errores.push('Usa un correo con dominio @duoc.cl, @profesor.duoc.cl o @gmail.com.')
  }
  return errores
}

export function requisitosContrasena(contrasena) {
  const errores = []
  if (!requerido(contrasena)) {
    errores.push('La contraseña es requerida.')
    return errores
  }
  if (!validarContrasena(contrasena)) {
    errores.push('La contraseña debe tener entre 4 y 10 caracteres.')
  }
  return errores
}

export function requisitosRun(run) {
  const errores = []
  if (!requerido(run)) {
    errores.push('El RUN es requerido.')
    return errores
  }
  if (!validarRun(run)) {
    errores.push('RUN inválido: usa 7 u 8 dígitos sin puntos ni guiones (ej: 19011022k).')
  }
  return errores
}

export function requisitosRequerido(valor, mensaje, max = 100) {
  const errores = []
  if (!requerido(valor)) {
    errores.push(mensaje)
    return errores
  }
  if (!maxCaracteres(valor, max)) {
    errores.push(`No puede superar los ${max} caracteres.`)
  }
  return errores
}