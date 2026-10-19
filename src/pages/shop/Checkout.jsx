import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext.js'
import { useCart } from '../../context/cartContext.js'
import {
  createOrden,
  descontarStock,
  formatearPrecioCLP,
  generarCodigoOrden,
  generarNroOrden,
} from '../../data/crudService.js'
import { regiones, getComunas, getRegionById } from '../../data/regiones.js'
import { esCorreoValido, requerido } from '../../utils/validaciones.js'

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

export default function Checkout() {
  const { usuarioActivo } = useAuth()
  const { carrito, totalCarrito, limpiarCarrito } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState(FORM_INICIAL)
  const [errores, setErrores] = useState({})
  const [simularError, setSimularError] = useState(false)

  // Autocompletado cuando hay sesión activa
  useEffect(() => {
    if (!usuarioActivo) return
    const regionEncontrada = regiones.find((r) => r.nombre === usuarioActivo.region)
    setForm((prev) => ({
      ...prev,
      nombre: usuarioActivo.nombre || prev.nombre,
      apellidos: usuarioActivo.apellidos || prev.apellidos,
      correo: usuarioActivo.correo || prev.correo,
      calle: usuarioActivo.direccion || prev.calle,
      region: regionEncontrada ? String(regionEncontrada.id) : prev.region,
      comuna: usuarioActivo.comuna || prev.comuna,
    }))
  }, [usuarioActivo])

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
    if (!requerido(form.calle)) nuevos.calle = 'La calle es requerida.'
    if (!requerido(form.region)) nuevos.region = 'Selecciona una región.'
    if (!requerido(form.comuna)) nuevos.comuna = 'Selecciona una comuna.'
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  function pagar(evento) {
    evento.preventDefault()
    if (carrito.length === 0 || !validar()) return

    const orden = {
      codigo: generarCodigoOrden(),
      nro: generarNroOrden(),
      usuarioId: usuarioActivo ? usuarioActivo.correo : form.correo,
      cliente: { nombre: form.nombre, apellidos: form.apellidos, correo: form.correo },
      direccion: {
        calle: form.calle,
        depto: form.depto,
        region: getRegionById(form.region)?.nombre || '',
        comuna: form.comuna,
        indicaciones: form.indicaciones,
      },
      items: carrito.map((item) => ({
        productoId: item.productoId,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
        subtotal: item.precio * item.cantidad,
      })),
      total: totalCarrito,
      fecha: new Date().toISOString(),
      estado: simularError ? 'Rechazada' : 'Completada',
    }

    if (simularError) {
      navigate('/pago-error', { state: { orden } })
      return
    }

    createOrden(orden)
    descontarStock(carrito)
    limpiarCarrito()
    navigate('/pago-exitoso', { state: { orden } })
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

        <h3 className="mt-4">Dirección de envío</h3>
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

        <div className="form-check my-4">
          <input id="simularError" type="checkbox" className="form-check-input"
            checked={simularError} onChange={(e) => setSimularError(e.target.checked)} />
          <label htmlFor="simularError" className="form-check-label">
            Simular pago fallido (demo)
          </label>
        </div>

        <button type="submit" className="btn btn-success w-100">
          Pagar {formatearPrecioCLP(totalCarrito)}
        </button>
      </form>
    </section>
  )
}
