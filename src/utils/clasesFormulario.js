/**
 * Clases CSS de un campo de formulario según su estado de validación (doc 06 §3.2).
 * Centraliza la lógica que antes estaba repetida en Registro, Contacto y Login.
 *
 * @param {string[]} errores mensajes de error del campo (vacío = sin errores)
 * @param {string} valor valor actual del campo
 */
export function claseCampo(errores, valor) {
  if (errores.length) return 'form-control input-invalid'
  if (String(valor).length > 0) return 'form-control input-valid'
  return 'form-control'
}
