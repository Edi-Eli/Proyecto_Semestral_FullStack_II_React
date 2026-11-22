/**
 * MisPedidos — Historial de compras del cliente
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as pedidosApi from '../../api/pedidos.js'
import { formatearPrecioCLP } from '../../utils/formato.js'
import BoletaModal from '../../components/admin/BoletaModal.jsx'
import Loader from '../../components/common/Loader.jsx'
import MensajeError from '../../components/common/MensajeError.jsx'

const ESTADOS = {
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

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [recargar, setRecargar] = useState(0)
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)

  useEffect(() => {
    let vigente = true
    pedidosApi
      .mios()
      .then((lista) => {
        if (!vigente) return
        setPedidos(Array.isArray(lista) ? lista : [])
        setError(null)
        setCargando(false)
      })
      .catch((err) => {
        if (!vigente) return
        setError(err.message || 'No se pudieron cargar tus pedidos.')
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

  if (cargando) {
    return (
      <section className="seccion-pro">
        <Loader mensaje="Cargando tus pedidos..." />
      </section>
    )
  }

  if (error) {
    return (
      <section className="seccion-pro">
        <MensajeError mensaje={error} onReintentar={reintentar} />
      </section>
    )
  }

  return (
    <section className="seccion-pro">
      <h1 className="ti-pro">Mis Pedidos</h1>

      {pedidos.length === 0 ? (
        <div className="text-center">
          <p className="lead">Todavía no tienes pedidos.</p>
          <Link to="/productos" className="btn-pro text-decoration-none">Ir a Productos</Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Boleta</th>
                <th>Fecha</th>
                <th>Items</th>
                <th>Entrega</th>
                <th>Total</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td>{pedido.codigo}</td>
                  <td>{formatearFecha(pedido.fecha)}</td>
                  <td>{pedido.items.reduce((suma, item) => suma + item.cantidad, 0)}</td>
                  <td>{ETIQUETA_ENTREGA[pedido.tipoEntrega] || pedido.tipoEntrega}</td>
                  <td>{formatearPrecioCLP(pedido.total)}</td>
                  <td>
                    <span className={`badge badge-${(pedido.estado || '').toLowerCase()}`}>
                      {ESTADOS[pedido.estado] || pedido.estado}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success"
                      onClick={() => setPedidoSeleccionado(pedido)}
                    >
                      Ver boleta
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <BoletaModal orden={pedidoSeleccionado} onCerrar={() => setPedidoSeleccionado(null)} />
    </section>
  )
}