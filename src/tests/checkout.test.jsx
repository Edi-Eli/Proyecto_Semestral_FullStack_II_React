// Checkout — realizado por: Zeus
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AuthContext from '../context/authContext.js'
import CartContext from '../context/cartContext.js'
import Checkout from '../pages/shop/Checkout.jsx'

describe('checkout', () => {
  it('autocompleta los campos cuando hay usuario en sesión', async () => {
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
              carrito: [
                { productoId: 1, nombre: 'Cemento Polpaico', precio: 5000, imagen: '/x.png', cantidad: 1 },
              ],
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
