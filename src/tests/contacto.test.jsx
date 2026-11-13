// Contacto — realizado por: Edi
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Contacto from '../pages/shop/Contacto.jsx'
import * as contactoApi from '../api/contacto.js'

// Se mockea la capa de API de contacto: el test comprueba que el formulario
// llama a `enviarMensaje` y muestra la confirmación.
vi.mock('../api/contacto.js', () => ({
  enviarMensaje: vi.fn(),
}))

describe('Contacto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('actualiza el textarea y el contador de caracteres', () => {
    render(<Contacto />)

    fireEvent.change(screen.getByLabelText(/Comentario/), {
      target: { value: 'Hola, quisiera una cotización.' },
    })
    expect(screen.getByText('30/500')).toBeInTheDocument()
  })

  it('envía el mensaje a la API y muestra la confirmación', async () => {
    contactoApi.enviarMensaje.mockResolvedValue({ id: 1, estado: 'PENDIENTE' })

    render(<Contacto />)

    fireEvent.change(screen.getByLabelText(/^Nombre/), {
      target: { value: 'María González' },
    })
    fireEvent.change(screen.getByLabelText(/Correo/), {
      target: { value: 'maria@duoc.cl' },
    })
    fireEvent.change(screen.getByLabelText(/Comentario/), {
      target: { value: 'Consulta de precios' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Enviar mensaje/ }))

    await waitFor(() => expect(contactoApi.enviarMensaje).toHaveBeenCalledTimes(1))
    expect(contactoApi.enviarMensaje).toHaveBeenCalledWith({
      nombre: 'María González',
      correo: 'maria@duoc.cl',
      mensaje: 'Consulta de precios',
    })
    expect(await screen.findByText(/¡Mensaje enviado!/)).toBeInTheDocument()
  })
})
