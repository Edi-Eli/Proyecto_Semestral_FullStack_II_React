/**
 * CartProvider — Carrito de compras
 *
 * - Guarda el carrito en el estado de React (sin localStorage de negocio).
 * - Valida stock al agregar y al cambiar cantidad.
 * - Limita los productos gratis a MAX_PRODUCTOS_GRATIS por persona.
 * - Muestra un toast ("Producto agregado al carrito ✓").
 * - `refrescarPrecios()` re-consulta precio/stock vigentes desde la API.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CartContext from './cartContext.js'
import Toast from '../components/common/Toast.jsx'
import * as productosApi from '../api/productos.js'
import { precioFinal, esGratis } from '../utils/productoHelpers.js'

const MAX_PRODUCTOS_GRATIS = 2
const DURACION_TOAST_MS = 3000

export default function CartProvider({ children }) {
  const [carrito, setCarrito] = useState([])
  const [toast, setToast] = useState(null)
  const [avisos, setAvisos] = useState([])
  const temporizador = useRef(null)

  useEffect(() => () => clearTimeout(temporizador.current), [])

  const mostrarToast = useCallback((mensaje, tipo = 'exito') => {
    setToast({ mensaje, tipo })
    clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => setToast(null), DURACION_TOAST_MS)
  }, [])

  const cerrarToast = useCallback(() => {
    clearTimeout(temporizador.current)
    setToast(null)
  }, [])

  /** Agrega un producto al carrito validando stock y límite de gratis. */
  const agregarAlCarrito = useCallback(
    (producto, cantidad = 1) => {
      const cantidadFinal = Math.max(1, Number(cantidad) || 1)
      const stock = Number(producto.stock ?? 0)

      if (stock <= 0) {
        mostrarToast('Producto sin stock disponible.', 'error')
        return false
      }

      const existente = carrito.find((i) => i.productoId === producto.id)
      const cantidadNueva = (existente ? existente.cantidad : 0) + cantidadFinal

      if (esGratis(producto) && cantidadNueva > MAX_PRODUCTOS_GRATIS) {
        mostrarToast(`Máximo ${MAX_PRODUCTOS_GRATIS} unidades de productos gratis.`, 'error')
        return false
      }
      if (cantidadNueva > stock) {
        mostrarToast(`Solo hay ${stock} unidades disponibles.`, 'error')
        return false
      }

      const item = {
        productoId: producto.id,
        nombre: producto.nombre,
        precio: precioFinal(producto),
        imagen: producto.imagen,
        stock,
        cantidad: cantidadNueva,
      }

      setCarrito(
        existente
          ? carrito.map((i) => (i.productoId === producto.id ? item : i))
          : [...carrito, item],
      )
      mostrarToast('Producto agregado al carrito ✓')
      return true
    },
    [carrito, mostrarToast],
  )

  /** Cambia la cantidad de un item respetando stock y límite de gratis. */
  const cambiarCantidad = useCallback(
    (id, nuevaCantidad) => {
      const numero = Number(nuevaCantidad)
      const item = carrito.find((i) => i.productoId === Number(id))
      if (!item) return

      if (numero <= 0) {
        setCarrito(carrito.filter((i) => i.productoId !== Number(id)))
        return
      }
      if (item.precio === 0 && numero > MAX_PRODUCTOS_GRATIS) {
        mostrarToast(`Máximo ${MAX_PRODUCTOS_GRATIS} unidades de productos gratis.`, 'error')
        return
      }
      if (item.stock > 0 && numero > item.stock) {
        mostrarToast(`Solo hay ${item.stock} unidades disponibles.`, 'error')
        return
      }
      setCarrito(carrito.map((i) => (i.productoId === Number(id) ? { ...i, cantidad: numero } : i)))
    },
    [carrito, mostrarToast],
  )

  const eliminarDelCarrito = useCallback(
    (id) => setCarrito((prev) => prev.filter((i) => i.productoId !== Number(id))),
    [],
  )

  const limpiarCarrito = useCallback(() => {
    setCarrito([])
    setAvisos([])
  }, [])

  /** Re-consulta precio/stock vigentes de los items del carrito. */
  const refrescarPrecios = useCallback(async () => {
    if (carrito.length === 0) {
      setAvisos([])
      return []
    }
    const resultados = await Promise.all(
      carrito.map(async (item) => {
        try {
          const producto = await productosApi.detalle(item.productoId)
          if (!producto) return { item, cambio: null }
          const precio = precioFinal(producto)
          const stock = Number(producto.stock ?? 0)
          const cambio =
            precio !== item.precio || stock !== item.stock
              ? {
                  productoId: item.productoId,
                  nombre: item.nombre,
                  precioAnterior: item.precio,
                  precioNuevo: precio,
                  stockAnterior: item.stock,
                  stockNuevo: stock,
                }
              : null
          const cantidad = stock > 0 ? Math.min(item.cantidad, stock) : item.cantidad
          return { item: { ...item, precio, stock, cantidad }, cambio }
        } catch {
          return { item, cambio: null }
        }
      }),
    )
    setCarrito(resultados.map((r) => r.item))
    const cambios = resultados.map((r) => r.cambio).filter(Boolean)
    setAvisos(cambios)
    return cambios
  }, [carrito])

  const totalCarrito = useMemo(
    () => carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0),
    [carrito],
  )

  const cantidadTotalItems = useMemo(
    () => carrito.reduce((suma, item) => suma + item.cantidad, 0),
    [carrito],
  )

  return (
    <CartContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        cambiarCantidad,
        eliminarDelCarrito,
        limpiarCarrito,
        refrescarPrecios,
        totalCarrito,
        cantidadTotalItems,
        toast,
        mostrarToast,
        cerrarToast,
        avisos,
      }}
    >
      {children}
      <Toast mensaje={toast?.mensaje} tipo={toast?.tipo} onCerrar={cerrarToast} />
    </CartContext.Provider>
  )
}