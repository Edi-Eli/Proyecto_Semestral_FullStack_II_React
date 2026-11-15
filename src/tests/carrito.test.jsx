import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CartProvider from '../context/CartProvider.jsx'
import Carrito from '../pages/shop/Carrito.jsx'
import { useCart } from '../context/cartContext.js'
import * as productosApi from '../api/productos.js'

vi.mock('../api/productos.js', () => ({
  detalle: vi.fn(),
  listar: vi.fn(),
  listarCategorias: vi.fn(),
}))

function producto(overrides = {}) {
  return {
    id: 1,
    nombre: 'Cemento Polpaico',
    precio: 5000,
    enOferta: false,
    precioOferta: 0,
    stock: 5,
    imagen: '/x.png',
    ...overrides,
  }
}

function Escenario({ producto: p, cantidad = 1 }) {
  const { agregarAlCarrito, cantidadTotalItems } = useCart()
  return (
    <>
      <button type="button" onClick={() => agregarAlCarrito(p, cantidad)}>Agregar</button>
      <div data-testid="cantidad">{cantidadTotalItems}</div>
    </>
  )
}

describe('carrito', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    productosApi.detalle.mockResolvedValue(producto())
  })

  it('no permite superar el stock disponible', async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <Escenario producto={producto({ stock: 2 })} />
        </CartProvider>
      </MemoryRouter>,
    )

    const boton = screen.getByText('Agregar')
    fireEvent.click(boton)
    fireEvent.click(boton)
    fireEvent.click(boton)

    await waitFor(() => expect(screen.getByTestId('cantidad')).toHaveTextContent('2'))
  })

  it('limita a 2 unidades los productos gratis', async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <Escenario producto={producto({ id: 5, nombre: 'Arena fina', precio: 0, stock: 20 })} />
        </CartProvider>
      </MemoryRouter>,
    )

    const boton = screen.getByText('Agregar')
    fireEvent.click(boton)
    fireEvent.click(boton)
    fireEvent.click(boton)

    await waitFor(() => expect(screen.getByTestId('cantidad')).toHaveTextContent('2'))
  })

  it('muestra el toast al agregar un producto', async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <Escenario producto={producto()} />
        </CartProvider>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('Agregar'))
    expect(await screen.findByText('Producto agregado al carrito ✓')).toBeInTheDocument()
  })

  it('Carrito muestra el total y lo actualiza al aumentar la cantidad', async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <Escenario producto={producto()} />
          <Carrito />
        </CartProvider>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('Agregar'))
    expect(await screen.findByTestId('total-carrito')).toHaveTextContent('$5.000')

    fireEvent.click(screen.getByRole('button', { name: /Aumentar Cemento Polpaico/ }))
    expect(screen.getByTestId('total-carrito')).toHaveTextContent('$10.000')
  })
})