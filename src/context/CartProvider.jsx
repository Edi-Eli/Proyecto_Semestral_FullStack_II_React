import { useState, useMemo } from 'react'
import CartContext from './cartContext.js'

const CLAVE_CARRITO = 'carrito'

function leerCarritoInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE_CARRITO)
    return guardado ? JSON.parse(guardado) : []
  } catch {
    return []
  }
}

export default function CartProvider({ children }) {
  const [carrito, setCarrito] = useState(leerCarritoInicial)

  function sincronizar(nuevoCarrito) {
    setCarrito(nuevoCarrito)
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(nuevoCarrito))
  }

  function agregarAlCarrito(producto, cantidad) {
    const cantidadFinal = Number(cantidad) || 1
    const existe = carrito.find((item) => item.productoId === producto.id)
    if (existe) {
      sincronizar(
        carrito.map((item) =>
          item.productoId === producto.id
            ? { ...item, cantidad: item.cantidad + cantidadFinal }
            : item,
        ),
      )
    } else {
      sincronizar([
        ...carrito,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          precio:
            producto.enOferta && producto.precioOferta > 0
              ? producto.precioOferta
              : producto.precio,
          imagen: producto.imagen,
          cantidad: cantidadFinal,
        },
      ])
    }
  }

  function cambiarCantidad(id, nuevaCantidad) {
    const cantidad = Math.max(1, Number(nuevaCantidad) || 1)
    sincronizar(
      carrito.map((item) =>
        item.productoId === Number(id) ? { ...item, cantidad } : item,
      ),
    )
  }

  function eliminarDelCarrito(id) {
    sincronizar(carrito.filter((item) => item.productoId !== Number(id)))
  }

  function limpiarCarrito() {
    sincronizar([])
  }

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
        totalCarrito,
        cantidadTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}