/**
 * AdminOfertas — Gestión de productos en oferta.
 *
 * Lista los productos con `enOferta = true` y permite crear, editar o quitar
 * una oferta. El backend exige el payload completo de ProductoRequest, por lo
 * que antes de guardar se consulta el detalle administrativo del producto.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as productosApi from '../api/productos.js'
import { formatearPrecioCLP } from '../utils/formato.js'
import Loader from '../components/common/Loader.jsx'
import MensajeError from '../components/common/MensajeError.jsx'
import { requerido } from '../utils/validaciones.js'

const FORM_VACIO = { productoId: '', precioOferta: '' }

function productoARequest(producto, { enOferta, precioOferta }) {
  return {
    codigo: producto.codigo,
    subcategoriaId: producto.subcategoriaId,
    nombre: producto.nombre,
    descripcion: producto.descripcion ?? null,
    marca: producto.marca ?? null,
    unidad: producto.unidad ?? null,
    precioCompra: producto.precioCompra,
    precio: producto.precio,
    enOferta,
    precioOferta,
    stock: producto.stock,
    stockCritico: producto.stockCritico,
    imagen: producto.imagen ?? null,
    activo: producto.activo !== false,
  }
}

export default function AdminOfertas() {
  const [ofertas, setOfertas] = useState([])
  const [productos, setProductos] = useState([])
  const [form, setForm] = useState(FORM_VACIO)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    let vigente = true
    Promise.allSettled([
      productosApi.listarOfertas({ page: 0, size: 1000 }),
      productosApi.listar({ page: 0, size: 1000 }),
    ])
      .then(([ofertasRes, productosRes]) => {
        if (!vigente) return
        if (ofertasRes.status === 'rejected' && productosRes.status === 'rejected') {
          setError('No se pudieron cargar las ofertas.')
          setCargando(false)
          return
        }
        setOfertas(ofertasRes.status === 'fulfilled' ? ofertasRes.value?.content || [] : [])
        setProductos(productosRes.status === 'fulfilled' ? productosRes.value?.content || [] : [])
        setError(null)
        setCargando(false)
      })
      .catch((err) => {
        if (!vigente) return
        setError(err.message || 'No se pudieron cargar las ofertas.')
        setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [recargar])

  function reintentar() {
    setCargando(true)
    setError(null)
    setRecargar((n) => n + 1)
  }

  function seleccionarOferta(producto) {
    setForm({
      productoId: String(producto.id),
      precioOferta: producto.precioOferta != null ? String(producto.precioOferta) : '',
    })
    setMensaje('')
  }

  async function guardarOferta(evento) {
    evento.preventDefault()
    setMensaje('')

    if (!requerido(form.productoId)) {
      setMensaje('Debe seleccionar un producto.')
      return
    }
    const precio = Number(String(form.precioOferta).replace(',', '.'))
    if (!Number.isFinite(precio) || precio <= 0) {
      setMensaje('El precio de oferta debe ser mayor que cero.')
      return
    }

    setGuardando(true)
    try {
      const detalle = await productosApi.detalle(form.productoId)
      await productosApi.actualizarProducto(
        form.productoId,
        productoARequest(detalle, { enOferta: true, precioOferta: precio }),
      )
      setMensaje('Oferta guardada correctamente.')
      setForm(FORM_VACIO)
      setRecargar((n) => n + 1)
    } catch (err) {
      setMensaje(err.message || 'No se pudo guardar la oferta.')
    } finally {
      setGuardando(false)
    }
  }

  async function quitarOferta(producto) {
    setGuardando(true)
    setMensaje('')
    try {
      const detalle = await productosApi.detalle(producto.id)
      await productosApi.actualizarProducto(
        producto.id,
        productoARequest(detalle, { enOferta: false, precioOferta: null }),
      )
      setMensaje(`Oferta de ${producto.nombre} eliminada.`)
      setForm((anterior) =>
        String(anterior.productoId) === String(producto.id) ? FORM_VACIO : anterior,
      )
      setRecargar((n) => n + 1)
    } catch (err) {
      setMensaje(err.message || 'No se pudo quitar la oferta.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <main className="admin-contenido">
        <h1>Ofertas</h1>
        <Loader mensaje="Cargando ofertas..." />
      </main>
    )
  }

  if (error) {
    return (
      <main className="admin-contenido">
        <h1>Ofertas</h1>
        <MensajeError mensaje={error} onReintentar={reintentar} />
      </main>
    )
  }

  return (
    <main className="admin-contenido">
      <h1>Ofertas</h1>
      <p className="admin-saludo">
        Administra los productos con precio de oferta. Para editar el resto de los datos usa{' '}
        <Link to="/admin/productos">Productos</Link>.
      </p>

      {mensaje && <div className="alert alert-info py-2">{mensaje}</div>}

      <section className="seccion-tabla">
        <h2>Productos en oferta</h2>
        <table className="tabla-admin">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Precio normal</th>
              <th>Precio oferta</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ofertas.length === 0 ? (
              <tr>
                <td colSpan="6">No hay productos en oferta.</td>
              </tr>
            ) : (
              ofertas.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.codigo}</td>
                  <td>{producto.nombre}</td>
                  <td>{formatearPrecioCLP(producto.precio)}</td>
                  <td>{formatearPrecioCLP(producto.precioOferta)}</td>
                  <td>{producto.stock}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-admin btn-editar"
                      onClick={() => seleccionarOferta(producto)}
                    >
                      Editar oferta
                    </button>
                    <button
                      type="button"
                      className="btn-admin btn-eliminar"
                      disabled={guardando}
                      onClick={() => quitarOferta(producto)}
                    >
                      Quitar oferta
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="seccion-formulario">
        <h2>{form.productoId ? 'Editar oferta' : 'Nueva oferta'}</h2>
        <form onSubmit={guardarOferta} noValidate>
          <div className="form-admin">
            <div className="campo-form">
              <label htmlFor="producto-oferta">Producto</label>
              <select
                id="producto-oferta"
                value={form.productoId}
                onChange={(evento) => setForm((anterior) => ({ ...anterior, productoId: evento.target.value }))}
              >
                <option value="">Seleccione un producto</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.codigo} — {producto.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo-form">
              <label htmlFor="precio-oferta">Precio de oferta</label>
              <input
                type="number"
                id="precio-oferta"
                min="0.01"
                step="0.01"
                value={form.precioOferta}
                onChange={(evento) =>
                  setForm((anterior) => ({ ...anterior, precioOferta: evento.target.value }))
                }
              />
            </div>

            <div className="botones-form">
              <button type="submit" className="btn-admin btn-guardar" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar oferta'}
              </button>
              <button
                type="button"
                className="btn-admin btn-limpiar"
                onClick={() => {
                  setForm(FORM_VACIO)
                  setMensaje('')
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}
