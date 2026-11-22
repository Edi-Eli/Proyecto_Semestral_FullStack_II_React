/** Formato de moneda chilena. Único origen para todo el front (doc 06 §4.1). */
export function formatearPrecioCLP(precio) {
  return '$' + Number(precio || 0).toLocaleString('es-CL')
}
