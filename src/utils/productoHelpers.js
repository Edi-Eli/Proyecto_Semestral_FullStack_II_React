export const IMAGEN_FALLBACK = '/assets/images/image.png'

export function formatearPrecioCLP(precio) {
  return '$' + Number(precio || 0).toLocaleString('es-CL')
}

export function tieneOferta(producto) {
  return Boolean(producto && producto.enOferta && producto.precioOferta > 0)
}

export function precioFinal(producto) {
  if (!producto) return 0
  return tieneOferta(producto) ? producto.precioOferta : producto.precio
}

export function esGratis(producto) {
  return precioFinal(producto) === 0
}

export function imagenProducto(producto) {
  return (producto && producto.imagen) || IMAGEN_FALLBACK
}
