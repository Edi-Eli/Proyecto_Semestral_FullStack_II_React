import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AuthContext from '../context/authContext.js'
import Login from '../pages/shop/Login.jsx'
import Registro from '../pages/shop/Registro.jsx'
import Contacto from '../pages/shop/Contacto.jsx'

function renderConAuth(ui, contexto = {}) {
  const valorPorDefecto = {
    login: () => ({ ok: false, mensaje: 'Correo o contraseña incorrectos.' }),
    logout: () => {},
    registrar: () => ({ ok: true, usuario: {} }),
    actualizarPerfil: () => null,
    usuarioActivo: null,
  }
  return render(
    <AuthContext.Provider value={{ ...valorPorDefecto, ...contexto }}>
      <MemoryRouter>{ui}</MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('Test 1 - Renderizado condicional de error (Login)', () => {
  it('muestra error de dominio no permitido al enviar correo inválido', () => {
    renderConAuth(<Login />)

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
  })
})

describe('Test 2 - Gestión de estado en el formulario', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('Registro actualiza el valor del input y filtra comunas según la región', () => {
    renderConAuth(<Registro />)

    fireEvent.change(screen.getByLabelText(/^Nombre/), {
      target: { value: 'Juan' },
    })
    expect(screen.getByLabelText(/^Nombre/).value).toBe('Juan')

    fireEvent.change(screen.getByLabelText(/^Región/), {
      target: { value: '7' },
    })
    const selectComuna = screen.getByLabelText(/^Comuna/)
    expect(selectComuna.disabled).toBe(false)
    expect(
      screen.getByRole('option', { name: 'Providencia' }),
    ).toBeInTheDocument()
  })

  it('Contacto actualiza el valor del textarea y el contador de caracteres', () => {
    renderConAuth(<Contacto />)

    fireEvent.change(screen.getByLabelText(/Comentario/), {
      target: { value: 'Hola, quisiera una cotización.' },
    })
    expect(screen.getByText('30/500')).toBeInTheDocument()
  })
})

describe('Test 3 - Eventos + uso de mocks (vi.fn)', () => {
  it('llama una sola vez a login con credenciales válidas', () => {
    const mockLogin = vi.fn(() => ({
      ok: true,
      usuario: { nombre: 'Eduardo', tipoUsuario: 'Cliente' },
    }))

    renderConAuth(<Login />, { login: mockLogin })

    fireEvent.change(screen.getByLabelText(/Correo/), {
      target: { value: 'eduardo@duoc.cl' },
    })
    fireEvent.change(screen.getByLabelText(/Contraseña/), {
      target: { value: '1234' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/ }))

    expect(mockLogin).toHaveBeenCalledTimes(1)
    expect(mockLogin).toHaveBeenCalledWith('eduardo@duoc.cl', '1234')
  })
})