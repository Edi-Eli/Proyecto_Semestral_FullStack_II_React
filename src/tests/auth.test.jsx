// Auth (Login y Registro) — realizado por: Edi
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CartProvider from '../context/CartProvider.jsx'
import AuthProvider from '../context/AuthProvider.jsx'
import Login from '../pages/shop/Login.jsx'
import Registro from '../pages/shop/Registro.jsx'
import * as authApi from '../api/auth.js'

// Se mockea la capa de API (no localStorage): los componentes se prueban contra
// la interfaz de `src/api/auth.js`, tal como se hace en producción.
vi.mock('../api/auth.js', () => ({
  login: vi.fn(),
  registro: vi.fn(),
  logout: vi.fn(),
  usuarioMinimo: (usuario) => usuario,
}))

function renderConProviders(ui) {
  return render(
    <MemoryRouter>
      <CartProvider>
        <AuthProvider>{ui}</AuthProvider>
      </CartProvider>
    </MemoryRouter>,
  )
}

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('no llama a la API y muestra error si el dominio del correo no está permitido', () => {
    renderConProviders(<Login />)

    fireEvent.change(screen.getByLabelText(/Correo/), {
      target: { value: 'test@yahoo.com' },
    })
    fireEvent.change(screen.getByLabelText(/Contraseña/), {
      target: { value: '1234' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/ }))

    expect(
      screen.getByText(/dominio @duoc\.cl, @profesor\.duoc\.cl o @gmail\.com/i),
    ).toBeInTheDocument()
    expect(authApi.login).not.toHaveBeenCalled()
  })

  it('llama una sola vez a la API de login con credenciales válidas', async () => {
    authApi.login.mockResolvedValue({
      token: 'token-de-prueba',
      usuario: {
        run: '19011022k',
        nombre: 'Eduardo',
        correo: 'eduardo@duoc.cl',
        tipoUsuario: 'Cliente',
      },
    })

    renderConProviders(<Login />)

    fireEvent.change(screen.getByLabelText(/Correo/), {
      target: { value: 'eduardo@duoc.cl' },
    })
    fireEvent.change(screen.getByLabelText(/Contraseña/), {
      target: { value: '1234' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/ }))

    await waitFor(() => expect(authApi.login).toHaveBeenCalledTimes(1))
    expect(authApi.login).toHaveBeenCalledWith('eduardo@duoc.cl', '1234')
  })
})

describe('Registro', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('actualiza el valor del input y filtra comunas según la región', () => {
    renderConProviders(<Registro />)

    fireEvent.change(screen.getByLabelText(/^Nombre/), {
      target: { value: 'Juan' },
    })
    expect(screen.getByLabelText(/^Nombre/).value).toBe('Juan')

    fireEvent.change(screen.getByLabelText(/^Región/), {
      target: { value: '7' },
    })
    const selectComuna = screen.getByLabelText(/^Comuna/)
    expect(selectComuna.disabled).toBe(false)
    expect(screen.getByRole('option', { name: 'Providencia' })).toBeInTheDocument()
  })
})
