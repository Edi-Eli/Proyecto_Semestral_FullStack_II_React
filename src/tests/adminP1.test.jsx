import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdminDashboard from '../admin/AdminDashboard'
import AdminReportes from '../admin/AdminReportes'
import * as reportesApi from '../api/reportes.js'
import * as pedidosApi from '../api/pedidos.js'
import * as productosApi from '../api/productos.js'

const sesion = vi.hoisted(() => ({ rol: 'Administrador' }))

vi.mock('../context/authContext.js', () => ({
  useAuth: () => ({
    usuarioActivo: { tipoUsuario: sesion.rol, nombre: 'Usuario de prueba' },
  }),
}))

vi.mock('../api/reportes.js', () => ({
  resumen: vi.fn(),
  masVendidos: vi.fn(),
  topClientes: vi.fn(),
  stock: vi.fn(),
}))

vi.mock('../api/pedidos.js', () => ({
  listarPagina: vi.fn(),
}))

vi.mock('../api/productos.js', () => ({
  listar: vi.fn(),
  listarOfertas: vi.fn(),
}))

function renderizar(componente) {
  return render(<MemoryRouter>{componente}</MemoryRouter>)
}

describe('AdminDashboard por rol', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sesion.rol = 'Administrador'
  })

  it('Administrador usa reportes.resumen y reportes.stock', async () => {
    reportesApi.resumen.mockResolvedValue({
      totalPedidos: 10,
      recaudado: 50000,
      totalProductos: 20,
      totalUsuarios: 5,
    })
    reportesApi.stock.mockResolvedValue({ criticos: [1, 2] })

    renderizar(<AdminDashboard />)

    expect(await screen.findByText('Compras')).toBeInTheDocument()
    expect(reportesApi.resumen).toHaveBeenCalledTimes(1)
    expect(reportesApi.stock).toHaveBeenCalledTimes(1)
    expect(pedidosApi.listarPagina).not.toHaveBeenCalled()
  })

  it('Vendedor usa pedidos, productos, ofertas y stock sin llamar a resumen', async () => {
    sesion.rol = 'Vendedor'
    pedidosApi.listarPagina.mockResolvedValue({ totalElements: 7 })
    productosApi.listar.mockResolvedValue({ totalElements: 12 })
    productosApi.listarOfertas.mockResolvedValue({ totalElements: 3 })
    reportesApi.stock.mockResolvedValue({ criticos: [] })

    renderizar(<AdminDashboard />)

    expect(await screen.findByText('Pedidos')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ofertas' })).toBeInTheDocument()
    expect(pedidosApi.listarPagina).toHaveBeenCalledTimes(1)
    expect(productosApi.listar).toHaveBeenCalledTimes(1)
    expect(productosApi.listarOfertas).toHaveBeenCalledTimes(1)
    expect(reportesApi.resumen).not.toHaveBeenCalled()
  })
})

describe('AdminReportes por rol', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sesion.rol = 'Administrador'
  })

  it('Administrador consume resumen, masVendidos, topClientes y stock', async () => {
    reportesApi.resumen.mockResolvedValue({
      recaudado: 100000,
      totalPedidos: 5,
      totalProductos: 10,
      totalUsuarios: 4,
      pedidosPorEstado: { PENDIENTE: 2 },
    })
    reportesApi.masVendidos.mockResolvedValue([
      { productoId: 1, nombre: 'Martillo', cantidad: 3, total: 3000 },
    ])
    reportesApi.topClientes.mockResolvedValue([{ nombre: 'Ana', total: 5000 }])
    reportesApi.stock.mockResolvedValue({ criticos: [] })

    renderizar(<AdminReportes />)

    expect(await screen.findByText('Total recaudado')).toBeInTheDocument()
    expect(screen.getByText('Martillo')).toBeInTheDocument()
    expect(reportesApi.resumen).toHaveBeenCalledTimes(1)
    expect(reportesApi.masVendidos).toHaveBeenCalledTimes(1)
    expect(reportesApi.topClientes).toHaveBeenCalledTimes(1)
    expect(reportesApi.stock).toHaveBeenCalledTimes(1)
  })

  it('Vendedor no llama a resumen ni topClientes', async () => {
    sesion.rol = 'Vendedor'
    pedidosApi.listarPagina.mockResolvedValue({ totalElements: 7 })
    productosApi.listar.mockResolvedValue({ totalElements: 12 })
    reportesApi.masVendidos.mockResolvedValue([
      { productoId: 1, nombre: 'Martillo', cantidad: 3, total: 3000 },
    ])
    reportesApi.stock.mockResolvedValue({ criticos: [] })

    renderizar(<AdminReportes />)

    expect(await screen.findByText('Productos más vendidos')).toBeInTheDocument()
    expect(screen.getByText('Martillo')).toBeInTheDocument()
    expect(reportesApi.masVendidos).toHaveBeenCalledTimes(1)
    expect(reportesApi.stock).toHaveBeenCalledTimes(1)
    expect(reportesApi.resumen).not.toHaveBeenCalled()
    expect(reportesApi.topClientes).not.toHaveBeenCalled()
  })
})
