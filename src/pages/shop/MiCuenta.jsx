/**
 * MiCuenta — Cuenta corriente del cliente.
 * ------------------------------------------------------------------
 * Consume el backend: GET /api/cuentas/mia y
 * GET /api/cuentas/{clienteId}/movimientos.
 */
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../../components/common/Loader.jsx'
import MensajeError from '../../components/common/MensajeError.jsx'
import { formatearPrecioCLP } from '../../utils/formato.js'
import * as cuentasApi from '../../api/cuentasCorrientes.js'

function formatearFecha(fecha) {
  if (!fecha) return ''
  const d = new Date(fecha)
  return Number.isNaN(d.getTime()) ? String(fecha) : d.toLocaleString('es-CL')
}

export default function MiCuenta() {
  const [cuenta, setCuenta] = useState(null)
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [sinCuenta, setSinCuenta] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    setSinCuenta(false)
    try {
      const datos = await cuentasApi.miCuenta()
      setCuenta(datos)
      const movs = await cuentasApi.movimientos(datos.clienteId)
      setMovimientos(Array.isArray(movs) ? movs : [])
    } catch (e) {
      if (e.status === 404) {
        setSinCuenta(true)
      } else {
        setError(e.message || 'No se pudo cargar tu cuenta corriente.')
      }
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    // Carga inicial desde la API (evento externo); el setState ocurre tras el `await`.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar()
  }, [cargar])

  if (cargando) {
    return (
      <section className="seccion-pro">
        <Loader mensaje="Cargando tu cuenta corriente..." />
      </section>
    )
  }

  if (error) {
    return (
      <section className="seccion-pro">
        <MensajeError mensaje={error} onReintentar={cargar} />
      </section>
    )
  }

  if (sinCuenta || !cuenta) {
    return (
      <section className="seccion-pro text-center">
        <h1 className="ti-pro">Mi cuenta corriente</h1>
        <p className="lead">No tienes una cuenta corriente activa.</p>
        <p className="text-muted">
          Si eres contratista o compras con frecuencia, solicítala en la tienda.
        </p>
        <Link to="/productos" className="btn-pro text-decoration-none">Ir a Productos</Link>
      </section>
    )
  }

  return (
    <section className="seccion-pro">
      <h1 className="ti-pro">Mi cuenta corriente</h1>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Límite de crédito</p>
              <h4 className="mb-0">{formatearPrecioCLP(cuenta.limiteCredito)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Saldo usado</p>
              <h4 className="mb-0">{formatearPrecioCLP(cuenta.saldoActual)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Cupo disponible</p>
              <h4 className="mb-0">{formatearPrecioCLP(cuenta.disponible)}</h4>
            </div>
          </div>
        </div>
      </div>

      <h3>Movimientos</h3>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th className="text-end">Monto</th>
              <th className="text-end">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">Sin movimientos registrados.</td>
              </tr>
            ) : (
              movimientos.map((movimiento) => (
                <tr key={movimiento.id}>
                  <td>{formatearFecha(movimiento.fecha)}</td>
                  <td>{movimiento.tipo === 'ABONO' ? 'Abono' : 'Cargo'}</td>
                  <td>{movimiento.descripcion || (movimiento.pedidoId ? `Pedido #${movimiento.pedidoId}` : '—')}</td>
                  <td className="text-end">{formatearPrecioCLP(movimiento.monto)}</td>
                  <td className="text-end">{formatearPrecioCLP(movimiento.saldoPosterior)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
