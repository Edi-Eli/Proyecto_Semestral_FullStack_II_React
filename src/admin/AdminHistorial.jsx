/**
 * AdminHistorial — Compras de un cliente
 */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loader from '../components/common/Loader.jsx'
import MensajeError from '../components/common/MensajeError.jsx'
import * as pedidosApi from '../api/pedidos.js'
import * as usuariosApiReal from '../api/usuarios.js'
import * as usuariosMock from '../utils/mocks/usuarios.mock.js'
import { formatearPrecioCLP } from '../utils/productoHelpers.js'

const USAR_MOCK = (import.meta.env.VITE_USAR_MOCK ?? 'true') !== 'false'
const usuariosApi = USAR_MOCK ? usuariosMock : usuariosApiReal

const ETIQUETA_ESTADO = {
  PENDIENTE: 'Pendiente', APROBADA: 'Aprobada', DESPACHADA: 'Despachada',
  ENTREGADA: 'Entregada', PAGADA: 'Pagada', RECHAZADA: 'Rechazada',
}

function formatearFecha(fecha) {
  if (!fecha) return ''
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return String(fecha)
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function AdminHistorial() {
  const { id } = useParams()
  const [usuario, setUsuario] = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    let vigente = true
    usuariosApi
      .obtenerUsuario(id)
      .then((u) => pedidosApi.porUsuario(u.correo).then((lista) => ({ u, lista })))
      .then(({ u, lista }) => {
        if (!vigente) return
        setUsuario(u)
        setPedidos(Array.isArray(lista) ? lista : [])
        setError(null)
        setCargando(false)
      })
      .catch((err) => {
        if (!vigente) return
        setError(err.message || 'No se pudo cargar el historial.')
        setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [id, recargar])

  function reintentar() {
    setCargando(true)
    setError(null)
    setRecargar((n) => n + 1)
  }

  if (cargando) {
    return (
      <main className="admin-contenido">
        <h1>Historial de Compras</h1>
        <Loader mensaje="Cargando historial..." />
      </main>
    )
  }

  if (error) {
    return (
      <main className="admin-contenido">
        <h1>Historial de Compras</h1>
        <MensajeError mensaje={error} onReintentar={reintentar} />
      </main>
    )
  }

  return (
    <main className="admin-contenido">
      <h1>Historial de Compras</h1>

      {usuario && (
        <p className="admin-saludo">
          {usuario.nombre} {usuario.apellidos} — {usuario.correo}
        </p>
      )}

      <section className="seccion-tabla">
        <table className="tabla-admin">
          <thead>
            <tr><th>Boleta</th><th>Fecha</th><th>Items</th><th>Total</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {pedidos.length === 0 ? (
              <tr><td colSpan="5">Este usuario no tiene compras registradas.</td></tr>
            ) : (
              pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td>{pedido.codigo}</td>
                  <td>{formatearFecha(pedido.fecha)}</td>
                  <td>{pedido.items.reduce((suma, item) => suma + item.cantidad, 0)}</td>
                  <td>{formatearPrecioCLP(pedido.total)}</td>
                  <td>
                    <span className={`badge badge-${(pedido.estado || '').toLowerCase()}`}>
                      {ETIQUETA_ESTADO[pedido.estado] || pedido.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <Link className="btn-admin btn-editar" to="/admin/usuarios">Volver a Usuarios</Link>
    </main>
  )
}