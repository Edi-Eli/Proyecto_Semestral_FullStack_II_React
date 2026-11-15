// Catálogo (Productos, ProductCard, ProductoDetalle) — realizado por: Sebas
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import CartContext from '../context/cartContext.js'
import Productos from '../pages/shop/Productos.jsx'
import ProductoDetalle from '../pages/shop/ProductoDetalle.jsx'
import ProductCard from '../components/common/ProductCard.jsx'
import * as productosApi from '../api/productos.js'

vi.mock('../api/productos.js', () => ({
  listar: vi.fn(),
  detalle: vi.fn(),
  listarOfertas: vi.fn(),
  listarCategorias: vi.fn(),
  listarSubcategorias: vi.fn(),
}))

function crearProducto(overrides = {}) {
  return {
    id: 1,
    codigo: 'PROD1',
    nombre: 'Cemento Polpaico',
    descripcion: 'Cemento de alta calidad.',
    marca: 'Polpaico',
    unidad: 'Saco',
    precio: 5990,
    enOferta: false,
    precioOferta: 0,
    stock: 10,
    stockCritico: 2,
    categoriaId: 1,
    categoriaNombre: 'Mat. Construcción',
    subcategoriaId: 1,
    subcategoriaNombre: 'Cementos',
    activo: true,
    imagen: '/assets/images/image.png',
    ...overrides,
  }
}

function valorCarrito() {
  return {
    carrito: [],
    totalCarrito: 0,
    cantidadTotalItems: 0,
    agregarAlCarrito: vi.fn(),
    cambiarCantidad: vi.fn(),
    eliminarDelCarrito: vi.fn(),
    limpiarCarrito: vi.fn(),
  }
}

describe('productos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Productos lista los productos que entrega la API', async () => {
    productosApi.listar.mockResolvedValue({
      content: [
        crearProducto({ id: 1, nombre: 'Cemento Polpaico' }),
        crearProducto({ id: 2, nombre: 'Ladrillo fiscal' }),
      ],
      totalElements: 2,
      totalPages: 1,
      number: 0,
    })

    render(
      <MemoryRouter>
        <CartContext.Provider value={valorCarrito()}>
          <Productos />
        </CartContext.Provider>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Cemento Polpaico')).toBeInTheDocument()
    expect(screen.getByText('Ladrillo fiscal')).toBeInTheDocument()
  })

  it('ProductCard muestra FREE con precio 0 y ejecuta onAdd', () => {
    const onAdd = vi.fn()

    render(
      <MemoryRouter>
        <ProductCard producto={crearProducto({ nombre: 'Arena Gratis', precio: 0 })} onAdd={onAdd} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Arena Gratis')).toBeInTheDocument()
    expect(screen.getByText('FREE')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Añadir al carrito/ }))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('ProductoDetalle deshabilita añadir al carrito cuando no hay stock', async () => {
    productosApi.detalle.mockResolvedValue(crearProducto({ stock: 0 }))

    render(
      <MemoryRouter initialEntries={['/producto/1']}>
        <CartContext.Provider value={valorCarrito()}>
          <Routes>
            <Route path="/producto/:id" element={<ProductoDetalle />} />
          </Routes>
        </CartContext.Provider>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Sin stock')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Añadir al carrito/ })).toBeDisabled()
  })
})
