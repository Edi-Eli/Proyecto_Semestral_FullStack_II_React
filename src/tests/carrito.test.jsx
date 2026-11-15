// Carrito (CartProvider + Carrito) — realizado por: Zeus
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CartProvider from '../context/CartProvider.jsx'
import Carrito from '../pages/shop/Carrito.jsx'

describe('carrito', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('actualiza el total al cambiar la cantidad', () => {
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
})
