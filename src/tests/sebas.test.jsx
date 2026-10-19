import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CartProvider from '../context/CartProvider.jsx'
import AuthContext from '../context/authContext.js'
import CartContext from '../context/cartContext.js'
import Productos from '../pages/shop/Productos.jsx'
import ProductCard from '../components/common/ProductCard.jsx'
import Carrito from '../pages/shop/Carrito.jsx'
import Checkout from '../pages/shop/Checkout.jsx'

const crearProducto = (id, nombre, precio = 5990) => ({
  id,
  codigo: `PROD${id}`,
  nombre,
  descripcion: '',
  precio,
  enOferta: false,
  precioOferta: 0,
  stock: 10,
  stockCritico: 2,
  categoriaId: 1,
  imagen: '/assets/images/image.png',
})

describe('sebas', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renderiza todos los productos del catálogo (renderizado de lista)', () => {
    localStorage.setItem(
      'productos',
      JSON.stringify([
        crearProducto(1, 'Cemento Polpaico'),
        crearProducto(2, 'Ladrillo fiscal'),
        crearProducto(3, 'Mortero Cola'),
      ]),
    )

    render(
      <MemoryRouter>
        <CartProvider>
          <Productos />
        </CartProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Cemento Polpaico')).toBeInTheDocument()
    expect(screen.getByText('Ladrillo fiscal')).toBeInTheDocument()
    expect(screen.getByText('Mortero Cola')).toBeInTheDocument()
  })

  it('ProductCard recibe props, muestra FREE con precio 0 y ejecuta onAdd (props)', () => {
    const onAdd = vi.fn()

    render(
      <MemoryRouter>
        <ProductCard producto={crearProducto(1, 'Arena Gratis', 0)} onAdd={onAdd} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Arena Gratis')).toBeInTheDocument()
    expect(screen.getByText('FREE')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Añadir al carrito/ }))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('Carrito actualiza el total al cambiar la cantidad (estado)', () => {
    localStorage.setItem(
      'carrito',
      JSON.stringify([
        { productoId: 1, nombre: 'Cemento Polpaico', precio: 5000, imagen: '/x.png', cantidad: 1 },
      ]),
    )

    render(
      <MemoryRouter>
        <CartProvider>
          <Carrito />
        </CartProvider>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('total-carrito')).toHaveTextContent('$5.000')

    fireEvent.click(screen.getByRole('button', { name: /Aumentar Cemento Polpaico/ }))

    expect(screen.getByTestId('total-carrito')).toHaveTextContent('$10.000')
  })

  it('Checkout autocompleta los campos cuando hay usuario en sesión (renderizado condicional)', async () => {
    const usuarioActivo = {
      nombre: 'Maria',
      apellidos: 'Torres Silva',
      correo: 'maria.torres@gmail.com',
      region: 'Región Metropolitana de Santiago',
      comuna: 'Santiago',
      direccion: 'Pasaje Las Flores 8',
      tipoUsuario: 'Cliente',
    }

    render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            usuarioActivo,
            login: vi.fn(),
            logout: vi.fn(),
            registrar: vi.fn(),
            actualizarPerfil: vi.fn(),
          }}
        >
          <CartContext.Provider
            value={{
              carrito: [{ productoId: 1, nombre: 'Cemento Polpaico', precio: 5000, imagen: '/x.png', cantidad: 1 }],
              totalCarrito: 5000,
              cantidadTotalItems: 1,
              agregarAlCarrito: vi.fn(),
              cambiarCantidad: vi.fn(),
              eliminarDelCarrito: vi.fn(),
              limpiarCarrito: vi.fn(),
            }}
          >
            <Checkout />
          </CartContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>,
    )

    expect(await screen.findByLabelText(/Nombre/)).toHaveValue('Maria')
    expect(screen.getByLabelText(/Apellidos/)).toHaveValue('Torres Silva')
    expect(screen.getByLabelText(/Correo/)).toHaveValue('maria.torres@gmail.com')
  })
})