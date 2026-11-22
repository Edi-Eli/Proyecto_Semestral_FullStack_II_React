export const IMAGEN_FALLBACK = '/assets/images/image.png'

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

/** Nombre de la categoría por id (doc 06 §3.5). Devuelve '-' si no se encuentra. */
export function nombreCategoria(categorias, id) {
  const categoria = (categorias || []).find((c) => String(c.id) === String(id))
  return categoria ? categoria.nombre : '-'
}

export function imagenProducto(producto) {
  return (producto && producto.imagen) || IMAGEN_FALLBACK
}
