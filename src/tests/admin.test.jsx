import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MetricCard from '../components/admin/MetricCard'
import AdminCriticos from '../admin/AdminCriticos'
import AdminProductos from '../admin/AdminProductos'
import * as productosApi from '../api/productos.js'

const sesion = vi.hoisted(() => ({ rol: 'Administrador' }))

vi.mock('../context/authContext.js', () => ({
  useAuth: () => ({
    usuarioActivo: { tipoUsuario: sesion.rol, nombre: 'Usuario de prueba' },
  }),
}))

vi.mock('../api/productos.js', () => ({
  listar: vi.fn(),
  listarCriticos: vi.fn(),
  listarCategorias: vi.fn(),
  listarSubcategorias: vi.fn(),
  crearProducto: vi.fn(),
  actualizarProducto: vi.fn(),
  eliminarProducto: vi.fn(),
}))

function producto(numero, stock, stockCritico) {
  return {
    id: numero,
    codigo: `PROD${numero}`,
    nombre: `Producto ${numero}`,
    descripcion: '',
    marca: 'Marca demo',
    unidad: 'Unidad',
    precioCompra: 500,
    precio: 1000,
    enOferta: false,
    precioOferta: null,
    stock,
    stockCritico,
    categoriaId: 1,
    categoriaNombre: 'Mat. Construcción',
    subcategoriaId: 1,
    subcategoriaNombre: 'Cementos',
    activo: true,
    imagen: '',
  }
}

describe('admin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sesion.rol = 'Administrador'
    productosApi.listarCategorias.mockResolvedValue([{ id: 1, nombre: 'Mat. Construcción' }])
    productosApi.listarSubcategorias.mockResolvedValue([
      { id: 1, categoriaId: 1, nombre: 'Cementos' },
    ])
  })

  it('MetricCard muestra las props titulo y valor', () => {
    render(<MetricCard titulo="Compras" valor={1234} />)
    expect(screen.getByText('Compras')).toBeInTheDocument()
    expect(screen.getByText('1234')).toBeInTheDocument()
  })

  it('AdminCriticos solo muestra productos con stock <= stockCritico', async () => {
    productosApi.listarCriticos.mockResolvedValue([producto(2, 2, 5)])

    render(
      <MemoryRouter>
        <AdminCriticos />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Producto 2')).toBeInTheDocument()
    expect(screen.queryByText('Producto 1')).not.toBeInTheDocument()
  })

  it('AdminProductos llama a la API crearProducto al guardar', async () => {
    productosApi.listar.mockResolvedValue({ content: [], totalElements: 0, totalPages: 1 })
    productosApi.crearProducto.mockResolvedValue({})

    render(
      <MemoryRouter>
        <AdminProductos />
      </MemoryRouter>,
    )

    fireEvent.change(await screen.findByLabelText('Código producto'), { target: { value: 'FER100' } })
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Producto Test' } })
    fireEvent.change(screen.getByLabelText('Precio compra'), { target: { value: '10000' } })
    fireEvent.change(screen.getByLabelText('Precio'), { target: { value: '15000' } })
    fireEvent.change(screen.getByLabelText('Stock'), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText('Subcategoría'), { target: { value: '1' } })
    fireEvent.click(screen.getByText('Guardar producto'))

    expect(productosApi.crearProducto).toHaveBeenCalledTimes(1)
    expect(productosApi.crearProducto).toHaveBeenCalledWith(
      expect.objectContaining({
        codigo: 'FER100',
        nombre: 'Producto Test',
        subcategoriaId: 1,
        precioCompra: 10000,
        precio: 15000,
        stock: 10,
        activo: true,
      }),
    )
  })

  it('AdminProductos oculta el botón Eliminar para el rol Vendedor', async () => {
    sesion.rol = 'Vendedor'
    productosApi.listar.mockResolvedValue({
      content: [producto(1, 10, 2)],
      totalElements: 1,
      totalPages: 1,
    })

    render(
      <MemoryRouter>
        <AdminProductos />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Producto 1')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument()
  })
})