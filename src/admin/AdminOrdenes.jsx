import { useEffect, useState } from 'react'
import BoletaModal from '../components/admin/BoletaModal.jsx'
import Loader from '../components/common/Loader.jsx'
import MensajeError from '../components/common/MensajeError.jsx'
import * as pedidosApi from '../api/pedidos.js'
import { formatearPrecioCLP } from '../utils/formato.js'

const ESTADOS = ['PENDIENTE', 'APROBADA', 'DESPACHADA', 'ENTREGADA', 'PAGADA', 'RECHAZADA']
const ETIQUETA_ESTADO = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  DESPACHADA: 'Despachada',
  ENTREGADA: 'Entregada',
  PAGADA: 'Pagada',
  RECHAZADA: 'Rechazada',
}
const ETIQUETA_ENTREGA = { RETIRO: 'Retiro', DESPACHO: 'Despacho' }

function formatearFecha(fecha) {
  if (!fecha) return ''
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return String(fecha)
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function AdminOrdenes() {
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [recargar, setRecargar] = useState(0)
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null)
  const [cambiandoId, setCambiandoId] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    let vigente = true
    pedidosApi
      .listarPagina({ page: 0, size: 1000 })
      .then((pagina) => {
        if (!vigente) return
        setOrdenes(pagina?.content || [])
        setError(null)
        setCargando(false)
      })
      .catch((err) => {
        if (!vigente) return
        setError(err.message || 'No se pudieron cargar los pedidos.')
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

  async function cambiarEstado(orden, nuevoEstado) {
    if (nuevoEstado === orden.estado) return
    setCambiandoId(orden.id)
    setMensaje(null)
    try {
      const actualizada = await pedidosApi.cambiarEstado(orden.id, nuevoEstado)
      setOrdenes((prev) =>
        prev.map((o) => (o.id === orden.id ? { ...o, estado: actualizada.estado } : o)),
      )
      setMensaje(`Pedido ${orden.codigo} actualizado a "${ETIQUETA_ESTADO[nuevoEstado]}".`)
    } catch (err) {
      setMensaje(err.message || 'No se pudo cambiar el estado del pedido.')
    } finally {
      setCambiandoId(null)
    }
  }

  if (cargando) {
    return (
      <main className="admin-contenido">
        <h1>Órdenes</h1>
        <Loader mensaje="Cargando pedidos..." />
      </main>
    )
  }

  if (error) {
    return (
      <main className="admin-contenido">
        <h1>Órdenes</h1>
        <MensajeError mensaje={error} onReintentar={reintentar} />
      </main>
    )
  }

  return (
    <main className="admin-contenido">
      <h1>Órdenes</h1>
      {mensaje && <div className="alert alert-info">{mensaje}</div>}

      <section className="seccion-tabla">
        <h2>Listado de pedidos</h2>
        <div className="table-responsive">
          <table className="tabla-admin">
            <thead>
              <tr>
                <th>Boleta</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Entrega</th>
                <th>Items</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Cambiar estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ordenes.length === 0 ? (
                <tr>
                  <td colSpan="9">No hay pedidos registrados.</td>
                </tr>
              ) : (
                ordenes.map((orden) => (
                  <tr key={orden.id}>
                    <td>{orden.codigo}</td>
                    <td>{formatearFecha(orden.fecha)}</td>
                    <td>{orden.cliente.nombre} {orden.cliente.apellidos}</td>
                    <td>{ETIQUETA_ENTREGA[orden.tipoEntrega] || orden.tipoEntrega}</td>
                    <td>{orden.items.reduce((suma, item) => suma + item.cantidad, 0)}</td>
                    <td>{formatearPrecioCLP(orden.total)}</td>
                    <td>
                      <span className={`badge badge-${(orden.estado || '').toLowerCase()}`}>
                        {ETIQUETA_ESTADO[orden.estado] || orden.estado}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={orden.estado}
                        disabled={cambiandoId === orden.id}
                        aria-label={`Cambiar estado de ${orden.codigo}`}
                        onChange={(evento) => cambiarEstado(orden, evento.target.value)}
                      >
                        {ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>
                            {ETIQUETA_ESTADO[estado]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-admin btn-editar"
                        onClick={() => setOrdenSeleccionada(orden)}
                      >
                        Mostrar Boleta
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <BoletaModal orden={ordenSeleccionada} onCerrar={() => setOrdenSeleccionada(null)} />
    </main>
  )
}