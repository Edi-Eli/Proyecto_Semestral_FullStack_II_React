/**
 * AdminCuentas — Gestión de cuentas corrientes.
 *
 * Administrador: puede abrir cuentas, ajustar límites y registrar abonos.
 * Vendedor: puede consultar cuentas/movimientos y registrar abonos.
 */
import { useEffect, useState } from 'react'
import * as cuentasApi from '../api/cuentasCorrientes.js'
import * as usuariosApi from '../api/usuarios.js'
import { useAuth } from '../context/authContext.js'
import Loader from '../components/common/Loader.jsx'
import MensajeError from '../components/common/MensajeError.jsx'
import { formatearPrecioCLP } from '../utils/formato.js'

const FORM_VACIO = { clienteId: '', limite: '', monto: '' }

function formatearFecha(fecha) {
  if (!fecha) return '—'
  const valor = new Date(fecha)
  return Number.isNaN(valor.getTime()) ? fecha : valor.toLocaleString('es-CL')
}

export default function AdminCuentas() {
  const { usuarioActivo } = useAuth()
  const esAdmin = usuarioActivo?.tipoUsuario === 'Administrador'

  const [cuentas, setCuentas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [recargar, setRecargar] = useState(0)
  const [seleccionada, setSeleccionada] = useState(null)
  const [movimientos, setMovimientos] = useState([])
  const [accion, setAccion] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)

  useEffect(() => {
    let vigente = true
    const cargas = [
      cuentasApi.resumenCobros(),
      esAdmin ? usuariosApi.listarUsuariosTodos({ rol: 'Cliente' }) : Promise.resolve([]),
    ]

    Promise.allSettled(cargas)
      .then(([cuentasRes, usuariosRes]) => {
        if (!vigente) return
        if (cuentasRes.status === 'rejected') {
          setError(cuentasRes.reason?.message || 'No se pudieron cargar las cuentas.')
          setCargando(false)
          return
        }
        setCuentas(cuentasRes.value || [])
        setUsuarios(usuariosRes.status === 'fulfilled' ? usuariosRes.value || [] : [])
        setError(null)
        setCargando(false)
      })
      .catch((err) => {
        if (!vigente) return
        setError(err.message || 'No se pudieron cargar las cuentas.')
        setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [esAdmin, recargar])

  function reintentar() {
    setCargando(true)
    setError(null)
    setRecargar((n) => n + 1)
  }

  async function verMovimientos(cuenta) {
    setSeleccionada(cuenta)
    setMovimientos([])
    setMensaje('')
    try {
      const lista = await cuentasApi.movimientos(cuenta.clienteId)
      setMovimientos(lista || [])
    } catch (err) {
      setMensaje(err.message || 'No se pudieron cargar los movimientos.')
    }
  }

  function abrirAccion(tipo, cuenta) {
    setAccion(tipo)
    setSeleccionada(tipo === 'abrir' ? null : cuenta)
    setMensaje('')
    setForm({ ...FORM_VACIO, clienteId: cuenta?.clienteId ? String(cuenta.clienteId) : '' })
  }

  async function guardarAccion(evento) {
    evento.preventDefault()
    setMensaje('')

    if (accion === 'abono') {
      const monto = Number(form.monto)
      if (!Number.isFinite(monto) || monto <= 0) {
        setMensaje('El monto del abono debe ser mayor que cero.')
        return
      }
      setProcesando(true)
      try {
        await cuentasApi.abonar(Number(form.clienteId), monto)
        setMensaje('Abono registrado correctamente.')
        setAccion(null)
        setForm(FORM_VACIO)
        setRecargar((n) => n + 1)
      } catch (err) {
        setMensaje(err.message || 'No se pudo registrar el abono.')
      } finally {
        setProcesando(false)
      }
      return
    }

    if (accion === 'limite') {
      const limite = Number(form.limite)
      if (!Number.isFinite(limite) || limite < 0) {
        setMensaje('El límite debe ser mayor o igual a cero.')
        return
      }
      setProcesando(true)
      try {
        await cuentasApi.ajustarLimite(Number(form.clienteId), limite)
        setMensaje('Límite de crédito actualizado.')
        setAccion(null)
        setForm(FORM_VACIO)
        setRecargar((n) => n + 1)
      } catch (err) {
        setMensaje(err.message || 'No se pudo ajustar el límite.')
      } finally {
        setProcesando(false)
      }
      return
    }

    if (accion === 'abrir') {
      if (!form.clienteId) {
        setMensaje('Debe seleccionar un cliente.')
        return
      }
      const limite = Number(form.limite)
      if (!Number.isFinite(limite) || limite < 0) {
        setMensaje('El límite debe ser mayor o igual a cero.')
        return
      }
      setProcesando(true)
      try {
        await cuentasApi.abrir({ clienteId: Number(form.clienteId), limiteCredito: limite })
        setMensaje('Cuenta corriente abierta correctamente.')
        setAccion(null)
        setForm(FORM_VACIO)
        setRecargar((n) => n + 1)
      } catch (err) {
        setMensaje(err.message || 'No se pudo abrir la cuenta.')
      } finally {
        setProcesando(false)
      }
    }
  }

  if (cargando) {
    return (
      <main className="admin-contenido">
        <h1>Cuentas Corrientes</h1>
        <Loader mensaje="Cargando cuentas..." />
      </main>
    )
  }

  if (error) {
    return (
      <main className="admin-contenido">
        <h1>Cuentas Corrientes</h1>
        <MensajeError mensaje={error} onReintentar={reintentar} />
      </main>
    )
  }

  return (
    <main className="admin-contenido">
      <h1>Cuentas Corrientes</h1>
      <p className="admin-saludo">
        {esAdmin
          ? 'Administra límites, abonos y movimientos de las cuentas de clientes.'
          : 'Consulta saldos y registra abonos. La apertura y el ajuste de límites son exclusivos del Administrador.'}
      </p>

      {mensaje && <div className="alert alert-info py-2">{mensaje}</div>}

      <section className="seccion-tabla">
        <h2>Resumen de cobros</h2>
        <div className="table-responsive">
          <table className="tabla-admin">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Límite</th>
                <th>Saldo usado</th>
                <th>Disponible</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cuentas.length === 0 ? (
                <tr>
                  <td colSpan="6">No hay cuentas corrientes registradas.</td>
                </tr>
              ) : (
                cuentas.map((cuenta) => (
                  <tr key={cuenta.id ?? cuenta.clienteId}>
                    <td>{cuenta.clienteNombre ?? `Cliente #${cuenta.clienteId}`}</td>
                    <td>{formatearPrecioCLP(cuenta.limiteCredito)}</td>
                    <td>{formatearPrecioCLP(cuenta.saldoActual)}</td>
                    <td>{formatearPrecioCLP(cuenta.disponible)}</td>
                    <td>{cuenta.activa ? 'Activa' : 'Inactiva'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-admin btn-editar"
                        onClick={() => verMovimientos(cuenta)}
                      >
                        Movimientos
                      </button>
                      <button
                        type="button"
                        className="btn-admin btn-editar"
                        onClick={() => abrirAccion('abono', cuenta)}
                      >
                        Abonar
                      </button>
                      {esAdmin && (
                        <button
                          type="button"
                          className="btn-admin btn-editar"
                          onClick={() => abrirAccion('limite', cuenta)}
                        >
                          Ajustar límite
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {seleccionada && (
        <section className="seccion-tabla">
          <h2>Movimientos de {seleccionada.clienteNombre ?? `Cliente #${seleccionada.clienteId}`}</h2>
          <table className="tabla-admin">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Saldo posterior</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan="5">Sin movimientos registrados.</td>
                </tr>
              ) : (
                movimientos.map((movimiento) => (
                  <tr key={movimiento.id}>
                    <td>{formatearFecha(movimiento.fecha)}</td>
                    <td>{movimiento.tipo}</td>
                    <td>{movimiento.descripcion ?? '—'}</td>
                    <td>{formatearPrecioCLP(movimiento.monto)}</td>
                    <td>{formatearPrecioCLP(movimiento.saldoPosterior)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      )}

      {accion && (
        <section className="seccion-formulario">
          <h2>
            {accion === 'abono' && 'Registrar abono'}
            {accion === 'limite' && 'Ajustar límite de crédito'}
            {accion === 'abrir' && 'Abrir cuenta corriente'}
          </h2>
          <form onSubmit={guardarAccion} noValidate>
            <div className="form-admin">
              {accion === 'abrir' && (
                <div className="campo-form">
                  <label htmlFor="cliente-cuenta">Cliente</label>
                  <select
                    id="cliente-cuenta"
                    value={form.clienteId}
                    onChange={(evento) =>
                      setForm((anterior) => ({ ...anterior, clienteId: evento.target.value }))
                    }
                  >
                    <option value="">Seleccione un cliente</option>
                    {usuarios.map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombre} {usuario.apellidos} ({usuario.correo})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {accion === 'abono' && (
                <div className="campo-form">
                  <label htmlFor="monto-abono">Monto del abono</label>
                  <input
                    type="number"
                    id="monto-abono"
                    min="0.01"
                    step="0.01"
                    value={form.monto}
                    onChange={(evento) =>
                      setForm((anterior) => ({ ...anterior, monto: evento.target.value }))
                    }
                  />
                </div>
              )}

              {(accion === 'limite' || accion === 'abrir') && (
                <div className="campo-form">
                  <label htmlFor="limite-cuenta">Límite de crédito</label>
                  <input
                    type="number"
                    id="limite-cuenta"
                    min="0"
                    step="0.01"
                    value={form.limite}
                    onChange={(evento) =>
                      setForm((anterior) => ({ ...anterior, limite: evento.target.value }))
                    }
                  />
                </div>
              )}

              <div className="botones-form">
                <button type="submit" className="btn-admin btn-guardar" disabled={procesando}>
                  {procesando ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  className="btn-admin btn-limpiar"
                  onClick={() => {
                    setAccion(null)
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
      )}

      {esAdmin && !accion && (
        <section className="seccion-formulario">
          <h2>Abrir cuenta corriente</h2>
          <button type="button" className="btn-admin btn-guardar" onClick={() => abrirAccion('abrir', { clienteId: '' })}>
            Abrir nueva cuenta
          </button>
        </section>
      )}
    </main>
  )
}
