/**
 * Catálogo simulado — Ferretería Los Maestros
 * ------------------------------------------------------------------
 * Responsable: Sebas
 *
 * Implementa en memoria las mismas respuestas que entregará la API real
 * (paginación tipo Spring Page, filtros y ofertas). Se usa mientras el
 * backend no esté disponible; se elimina cuando el flag VITE_USAR_MOCK
 * pase a false y el backend del módulo producto quede listo.
 */
import { productosIniciales, categoriasIniciales } from '../data/db.js'

const IMAGEN_FALLBACK = '/assets/images/image.png'
const LATENCIA_MS = 150

const UNIDADES = ['Unidad', 'Saco', 'Galón', 'Metro', 'Caja', 'Pallet']
const MARCAS = ['Genérico', 'Polpaico', 'Melón', 'Stanley', 'Bosch', 'Truper', 'Sika']

const subcategoriasIniciales = [
  { id: 1, categoriaId: 1, nombre: 'Cementos' },
  { id: 2, categoriaId: 1, nombre: 'Áridos' },
  { id: 3, categoriaId: 1, nombre: 'Albañilería' },
  { id: 4, categoriaId: 2, nombre: 'Herramientas de mano' },
  { id: 5, categoriaId: 3, nombre: 'Herramientas eléctricas' },
  { id: 6, categoriaId: 4, nombre: 'Jardín' },
  { id: 7, categoriaId: 5, nombre: 'Seguridad' },
]

const subcategoriaPorCategoria = {
  1: 1,
  2: 4,
  3: 5,
  4: 6,
  5: 7,
}

let productos = productosIniciales.map((producto, indice) => {
  const subcategoriaId = subcategoriaPorCategoria[producto.categoriaId] || 1
  const subcategoria = subcategoriasIniciales.find((s) => s.id === subcategoriaId)
  const categoria = categoriasIniciales.find((c) => c.id === producto.categoriaId)
  return {
    ...producto,
    marca: MARCAS[indice % MARCAS.length],
    unidad: UNIDADES[indice % UNIDADES.length],
    precioCompra: Math.round(producto.precio * 0.7),
    subcategoriaId,
    subcategoriaNombre: subcategoria ? subcategoria.nombre : '',
    categoriaNombre: categoria ? categoria.nombre : '',
    activo: true,
  }
})

const categorias = categoriasIniciales.map((categoria) => ({
  ...categoria,
  imagenUrl: categoria.imagen,
}))

const subcategorias = [...subcategoriasIniciales]

let siguienteId = productos.reduce((max, p) => Math.max(max, p.id), 0) + 1

function esperar() {
  return new Promise((resolve) => setTimeout(resolve, LATENCIA_MS))
}

function paginar(lista, page = 0, size = 12) {
  const pagina = Number(page) || 0
  const tamano = Number(size) || 12
  const inicio = pagina * tamano
  const contenido = lista.slice(inicio, inicio + tamano)
  const totalPages = Math.max(1, Math.ceil(lista.length / tamano))
  return {
    content: contenido,
    number: pagina,
    size: tamano,
    totalElements: lista.length,
    totalPages,
    first: pagina === 0,
    last: pagina >= totalPages - 1,
  }
}

function ordenar(lista, orden) {
  if (orden === 'precio-asc') return [...lista].sort((a, b) => a.precio - b.precio)
  if (orden === 'precio-desc') return [...lista].sort((a, b) => b.precio - a.precio)
  if (orden === 'nombre') return [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre))
  return lista
}

function filtrarProductos({ q, categoriaId, subcategoriaId, enOferta }) {
  let resultado = productos.filter((p) => p.activo)
  if (q) {
    const texto = String(q).trim().toLowerCase()
    resultado = resultado.filter((p) =>
      `${p.nombre} ${p.descripcion} ${p.marca}`.toLowerCase().includes(texto),
    )
  }
  if (categoriaId) {
    resultado = resultado.filter((p) => p.categoriaId === Number(categoriaId))
  }
  if (subcategoriaId) {
    resultado = resultado.filter((p) => p.subcategoriaId === Number(subcategoriaId))
  }
  if (enOferta === true || enOferta === 'true') {
    resultado = resultado.filter((p) => p.enOferta && p.precioOferta > 0)
  }
  return resultado
}

export async function listarProductos(opciones = {}) {
  await esperar()
  const { page = 0, size = 12, orden } = opciones
  return paginar(ordenar(filtrarProductos(opciones), orden), page, size)
}

export async function obtenerProducto(id) {
  await esperar()
  return productos.find((p) => p.id === Number(id)) || null
}

export async function listarOfertas(opciones = {}) {
  await esperar()
  const { page = 0, size = 12 } = opciones
  return paginar(filtrarProductos({ enOferta: true }), page, size)
}

export async function listarCategorias() {
  await esperar()
  return categorias
}

export async function listarSubcategorias(categoriaId) {
  await esperar()
  if (!categoriaId) return subcategorias
  return subcategorias.filter((s) => s.categoriaId === Number(categoriaId))
}

export async function crearProducto(datos) {
  await esperar()
  const producto = { ...datos, id: siguienteId++, activo: true, imagen: datos.imagen || IMAGEN_FALLBACK }
  productos = [...productos, producto]
  return producto
}

export async function actualizarProducto(id, datos) {
  await esperar()
  const indice = productos.findIndex((p) => p.id === Number(id))
  if (indice === -1) return null
  productos[indice] = { ...productos[indice], ...datos, id: Number(id) }
  return productos[indice]
}

export async function eliminarProducto(id) {
  await esperar()
  productos = productos.filter((p) => p.id !== Number(id))
  return true
}

export async function actualizarStock(id, { cantidad, accion }) {
  await esperar()
  const indice = productos.findIndex((p) => p.id === Number(id))
  if (indice === -1) return null
  const delta = accion === 'RETIRAR' ? -Number(cantidad) : Number(cantidad)
  productos[indice].stock = Math.max(0, productos[indice].stock + delta)
  return productos[indice]
}

export { IMAGEN_FALLBACK }
