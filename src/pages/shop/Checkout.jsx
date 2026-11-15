/**
 * Checkout
 * - Tipo de entrega: RETIRO | DESPACHO.
 * - Método de pago: CONTADO | CUENTA_CORRIENTE (valida saldo/límite).
 * - Mapa Leaflet con radio de cobertura (solo si elige Despacho).
 * - Crea el pedido en la API (el backend/mock valida y descuenta stock).
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Circle, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '../../context/authContext.js'
import { useCart } from '../../context/cartContext.js'
import * as pedidosApi from '../../api/pedidos.js'
import * as cuentasApi from '../../api/cuentasCorrientes.js'
import { regiones, getComunas, getRegionById } from '../../data/regiones.js'
import { formatearPrecioCLP } from '../../utils/productoHelpers.js'
import { esCorreoValido, requerido } from '../../utils/validaciones.js'

const TIENDA = { lat: -29.9045, lng: -71.2489, nombre: 'Ferretería Los Maestros — La Serena' }
const RADIO_COBERTURA_KM = 35

// Coordenadas de las comunas de la Región de Coquimbo (zona de despacho).
const COORDENADAS_COMUNAS = {
  'La Serena': { lat: -29.9045, lng: -71.2489 },
  Coquimbo: { lat: -29.9533, lng: -71.3436 },
  Andacollo: { lat: -30.2328, lng: -71.0861 },
  Vicuña: { lat: -30.0318, lng: -70.7086 },
  'La Higuera': { lat: -29.5067, lng: -71.2 },
  Paihuano: { lat: -30.03, lng: -70.51 },
  Ovalle: { lat: -30.6011, lng: -71.199 },
  'Monte Patria': { lat: -30.695, lng: -70.947 },
  Punitaqui: { lat: -30.834, lng: -71.258 },
  Combarbalá: { lat: -31.18, lng: -71.0 },
  Canela: { lat: -31.4, lng: -71.45 },
  Illapel: { lat: -31.633, lng: -71.17 },
  'Los Vilos': { lat: -31.91, lng: -71.51 },
  Salamanca: { lat: -31.78, lng: -70.97 },
}

function distanciaKm(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const FORM_INICIAL = {
  nombre: '',
  apellidos: '',
  correo: '',
  calle: '',
  depto: '',
  region: '',
  comuna: '',
  indicaciones: '',
}

function formularioInicial(usuario) {
  if (!usuario) return FORM_INICIAL
  const regionEncontrada = regiones.find((r) => r.nombre === usuario.region)
  return {
    ...FORM_INICIAL,
    nombre: usuario.nombre || '',
    apellidos: usuario.apellidos || '',
    correo: usuario.correo || '',
    calle: usuario.direccion || '',
    region: regionEncontrada ? String(regionEncontrada.id) : '',
    comuna: usuario.comuna || '',
  }
}

export default function Checkout() {
  const { usuarioActivo } = useAuth()
  const { carrito, totalCarrito, limpiarCarrito } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState(() => formularioInicial(usuarioActivo))
  const [usuarioPrevio, setUsuarioPrevio] = useState(usuarioActivo)
  const [tipoEntrega, setTipoEntrega] = useState('RETIRO')
  const [metodoPago, setMetodoPago] = useState('CONTADO')
  const [cuentaCargada, setCuentaCargada] = useState(null)
  const [errores, setErrores] = useState({})
  const [errorPago, setErrorPago] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (usuarioPrevio !== usuarioActivo) {
    setUsuarioPrevio(usuarioActivo)
    setForm(formularioInicial(usuarioActivo))
  }

  // Consulta la cuenta corriente del cliente (mock mientras no hay backend).
  useEffect(() => {
    if (!usuarioActivo) return undefined
    let vigente = true
    cuentasApi
      .miCuenta()
      .then((c) => {
        if (vigente) setCuentaCargada(c)
      })
      .catch(() => {
        if (vigente) setCuentaCargada(null)
      })
    return () => {
      vigente = false
    }
  }, [usuarioActivo])

  const cuenta = usuarioActivo ? cuentaCargada : null

  const coordsCliente = COORDENADAS_COMUNAS[form.comuna] || null
  const dentroDeCobertura = coordsCliente
    ? distanciaKm(TIENDA, coordsCliente) <= RADIO_COBERTURA_KM
    : false
  const disponibleCuenta = cuenta
    ? Number(cuenta.disponible ?? cuenta.limiteCredito - cuenta.saldoActual)
    : 0
  const puedeCuentaCorriente = Boolean(usuarioActivo) && disponibleCuenta >= totalCarrito

  function manejarCambio(evento) {
    const { name, value } = evento.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'region' ? { comuna: '' } : {}),
    }))
  }

  function validar() {
    const nuevos = {}
    if (!requerido(form.nombre)) nuevos.nombre = 'El nombre es requerido.'
    if (!requerido(form.apellidos)) nuevos.apellidos = 'Los apellidos son requeridos.'
    if (!esCorreoValido(form.correo)) {
      nuevos.correo = 'Correo inválido (@duoc.cl, @profesor.duoc.cl o @gmail.com).'
    }
    if (tipoEntrega === 'DESPACHO') {
      if (!requerido(form.calle)) nuevos.calle = 'La calle es requerida.'
      if (!requerido(form.region)) nuevos.region = 'Selecciona una región.'
      if (!requerido(form.comuna)) nuevos.comuna = 'Selecciona una comuna.'
      else if (!dentroDeCobertura) {
        nuevos.comuna = 'Tu comuna está fuera del radio de despacho. Elige "Retiro en tienda".'
      }
    }
    if (metodoPago === 'CUENTA_CORRIENTE' && !puedeCuentaCorriente) {
      nuevos.metodoPago = 'Tu cuenta corriente no tiene cupo suficiente para este pedido.'
    }
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  async function pagar(evento) {
    evento.preventDefault()
    if (carrito.length === 0 || !validar()) return

    setEnviando(true)
    setErrorPago(null)
    try {
      const pedido = await pedidosApi.crear({
        items: carrito.map((item) => ({ productoId: item.productoId, cantidad: item.cantidad })),
        direccion: {
          calle: form.calle,
          depto: form.depto,
          region: getRegionById(form.region)?.nombre || '',
          comuna: form.comuna,
          indicaciones: form.indicaciones,
        },
        tipoEntrega,
        metodoPago,
      })
      limpiarCarrito()
      navigate('/pago-exitoso', { state: { orden: pedido } })
    } catch (error) {
      setErrorPago(error.message || 'No se pudo procesar el pedido. Intente nuevamente.')
    } finally {
      setEnviando(false)
    }
  }

  if (carrito.length === 0) {
    return (
      <section className="seccion-pro text-center">
        <h1 className="ti-pro">Checkout</h1>
        <p className="lead">Tu carrito está vacío.</p>
        <Link to="/productos" className="btn-pro text-decoration-none">Ir a Productos</Link>
      </section>
    )
  }

  return (
    <section className="seccion-pro">
      <h1 className="ti-pro">Finalizar Compra</h1>

      <h3>Resumen del pedido</h3>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {carrito.map((item) => (
              <tr key={item.productoId}>
                <td>{item.nombre}</td>
                <td>{item.cantidad}</td>
                <td>{formatearPrecioCLP(item.precio * item.cantidad)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h4 className="text-end mb-4">Total: {formatearPrecioCLP(totalCarrito)}</h4>

      <form onSubmit={pagar} noValidate>
        <h3>Datos del cliente</h3>
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="nombre" className="form-label">Nombre</label>
            <input id="nombre" name="nombre" className="form-control"
              value={form.nombre} onChange={manejarCambio} />
            {errores.nombre && <small className="text-danger">{errores.nombre}</small>}
          </div>
          <div className="col-md-6">
            <label htmlFor="apellidos" className="form-label">Apellidos</label>
            <input id="apellidos" name="apellidos" className="form-control"
              value={form.apellidos} onChange={manejarCambio} />
            {errores.apellidos && <small className="text-danger">{errores.apellidos}</small>}
          </div>
          <div className="col-md-6">
            <label htmlFor="correo" className="form-label">Correo</label>
            <input id="correo" name="correo" type="email" className="form-control"
              value={form.correo} onChange={manejarCambio} />
            {errores.correo && <small className="text-danger">{errores.correo}</small>}
          </div>
        </div>

        <h3 className="mt-4">Tipo de entrega</h3>
        <div className="d-flex gap-4">
          <div className="form-check">
            <input id="entrega-retiro" type="radio" name="tipoEntrega" className="form-check-input"
              checked={tipoEntrega === 'RETIRO'} onChange={() => setTipoEntrega('RETIRO')} />
            <label htmlFor="entrega-retiro" className="form-check-label">Retiro en tienda</label>
          </div>
          <div className="form-check">
            <input id="entrega-despacho" type="radio" name="tipoEntrega" className="form-check-input"
              checked={tipoEntrega === 'DESPACHO'} onChange={() => setTipoEntrega('DESPACHO')} />
            <label htmlFor="entrega-despacho" className="form-check-label">Despacho a domicilio</label>
          </div>
        </div>

        {tipoEntrega === 'RETIRO' ? (
          <p className="text-muted mt-2">
            Retiras en <strong>{TIENDA.nombre}</strong>. Te avisaremos cuando esté listo.
          </p>
        ) : (
          <>
            <h3 className="mt-4">Dirección de despacho</h3>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="calle" className="form-label">Calle</label>
                <input id="calle" name="calle" className="form-control"
                  value={form.calle} onChange={manejarCambio} />
                {errores.calle && <small className="text-danger">{errores.calle}</small>}
              </div>
              <div className="col-md-6">
                <label htmlFor="depto" className="form-label">Depto (opcional)</label>
                <input id="depto" name="depto" className="form-control"
                  value={form.depto} onChange={manejarCambio} />
              </div>
              <div className="col-md-6">
                <label htmlFor="region" className="form-label">Región</label>
                <select id="region" name="region" className="form-select"
                  value={form.region} onChange={manejarCambio}>
                  <option value="">Selecciona...</option>
                  {regiones.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
                {errores.region && <small className="text-danger">{errores.region}</small>}
              </div>
              <div className="col-md-6">
                <label htmlFor="comuna" className="form-label">Comuna</label>
                <select id="comuna" name="comuna" className="form-select"
                  value={form.comuna} onChange={manejarCambio} disabled={!form.region}>
                  <option value="">Selecciona...</option>
                  {getComunas(form.region).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errores.comuna && <small className="text-danger">{errores.comuna}</small>}
              </div>
              <div className="col-12">
                <label htmlFor="indicaciones" className="form-label">Indicaciones (opcional)</label>
                <textarea id="indicaciones" name="indicaciones" className="form-control" rows="2"
                  value={form.indicaciones} onChange={manejarCambio} />
              </div>
            </div>

            <div className="my-3">
              {form.comuna && (
                <p className={dentroDeCobertura ? 'text-success' : 'text-danger'}>
                  {dentroDeCobertura
                    ? `✔ ${form.comuna} está dentro del radio de despacho (${RADIO_COBERTURA_KM} km).`
                    : `✘ ${form.comuna} está fuera del radio de despacho (${RADIO_COBERTURA_KM} km). Elige retiro en tienda.`}
                </p>
              )}
              <MapContainer
                center={[TIENDA.lat, TIENDA.lng]}
                zoom={9}
                style={{ height: 320, width: '100%', borderRadius: 8 }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                <Circle
                  center={[TIENDA.lat, TIENDA.lng]}
                  radius={RADIO_COBERTURA_KM * 1000}
                  pathOptions={{ color: '#198754', fillColor: '#198754', fillOpacity: 0.1 }}
                />
                <CircleMarker center={[TIENDA.lat, TIENDA.lng]} radius={8} pathOptions={{ color: '#198754' }}>
                  <Popup>{TIENDA.nombre}</Popup>
                </CircleMarker>
                {coordsCliente && (
                  <CircleMarker
                    center={[coordsCliente.lat, coordsCliente.lng]}
                    radius={8}
                    pathOptions={{ color: dentroDeCobertura ? '#0d6efd' : '#dc3545' }}
                  >
                    <Popup>{form.comuna}</Popup>
                  </CircleMarker>
                )}
              </MapContainer>
            </div>
          </>
        )}

        <h3 className="mt-4">Método de pago</h3>
        <div className="d-flex gap-4 flex-wrap">
          <div className="form-check">
            <input id="pago-contado" type="radio" name="metodoPago" className="form-check-input"
              checked={metodoPago === 'CONTADO'} onChange={() => setMetodoPago('CONTADO')} />
            <label htmlFor="pago-contado" className="form-check-label">Contado</label>
          </div>
          <div className="form-check">
            <input id="pago-cuenta" type="radio" name="metodoPago" className="form-check-input"
              checked={metodoPago === 'CUENTA_CORRIENTE'}
              disabled={!puedeCuentaCorriente}
              onChange={() => setMetodoPago('CUENTA_CORRIENTE')} />
            <label htmlFor="pago-cuenta" className="form-check-label">
              Cuenta corriente{' '}
              {usuarioActivo && cuenta
                ? `(cupo: ${formatearPrecioCLP(disponibleCuenta)})`
                : '(solo clientes con cuenta)'}
            </label>
          </div>
        </div>
        {errores.metodoPago && <small className="text-danger d-block mt-1">{errores.metodoPago}</small>}

        {errorPago && <div className="alert alert-danger mt-3">{errorPago}</div>}

        <button type="submit" className="btn btn-success w-100 mt-4" disabled={enviando}>
          {enviando ? 'Procesando...' : `Pagar ${formatearPrecioCLP(totalCarrito)}`}
        </button>
      </form>
    </section>
  )
}