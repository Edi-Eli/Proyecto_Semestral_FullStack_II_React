/**
 * PagoExitoso — Boleta del pedido confirmado
 */
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { formatearPrecioCLP } from '../../utils/productoHelpers.js'

const ETIQUETA_ENTREGA = { RETIRO: 'Retiro en tienda', DESPACHO: 'Despacho a domicilio' }
const ETIQUETA_PAGO = { CONTADO: 'Contado', CUENTA_CORRIENTE: 'Cuenta corriente' }

export default function PagoExitoso() {
  const { state } = useLocation()
  const orden = state?.orden
  const [correoEnviado, setCorreoEnviado] = useState(false)

  if (!orden) {
    return (
      <section className="seccion-pro text-center">
        <h1 className="ti-pro">No hay una compra reciente</h1>
        <Link to="/productos" className="btn-pro text-decoration-none">Ir a Productos</Link>
      </section>
    )
  }

  const esDespacho = orden.tipoEntrega === 'DESPACHO'

  return (
    <section className="seccion-pro">
      <h1 className="ti-pro text-success">¡Compra realizada con éxito!</h1>
      <p className="text-center">
        Código: <strong>{orden.codigo}</strong> — Nro: <strong>#{orden.nro}</strong>
      </p>

      <h3>Datos del cliente</h3>
      <p>{orden.cliente.nombre} {orden.cliente.apellidos} — {orden.cliente.correo}</p>

      <h3>Entrega y pago</h3>
      <p><strong>Tipo de entrega:</strong> {ETIQUETA_ENTREGA[orden.tipoEntrega] || orden.tipoEntrega}</p>
      {esDespacho ? (
        <p>
          <strong>Dirección:</strong> {orden.direccion.calle}
          {orden.direccion.depto ? `, Depto ${orden.direccion.depto}` : ''}, {orden.direccion.comuna},{' '}
          {orden.direccion.region}
        </p>
      ) : (
        <p><strong>Retiro en:</strong> Ferretería Los Maestros — La Serena</p>
      )}
      <p><strong>Método de pago:</strong> {ETIQUETA_PAGO[orden.metodoPago] || orden.metodoPago}</p>
      <p><strong>Estado:</strong> {orden.estado}</p>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {orden.items.map((item) => (
              <tr key={item.productoId}>
                <td>{item.nombre}</td>
                <td>{formatearPrecioCLP(item.precio)}</td>
                <td>{item.cantidad}</td>
                <td>{formatearPrecioCLP(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h4 className="text-end">Total: {formatearPrecioCLP(orden.total)}</h4>

      <div className="d-flex gap-2 justify-content-center mt-3">
        <button type="button" className="btn btn-outline-secondary" onClick={() => window.print()}>
          Imprimir boleta en PDF
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={() => setCorreoEnviado(true)}>
          Enviar boleta por email
        </button>
        <Link to="/mis-pedidos" className="btn btn-outline-success text-decoration-none">Ver mis pedidos</Link>
        <Link to="/" className="btn btn-success text-decoration-none">Volver al inicio</Link>
      </div>
      {correoEnviado && (
        <p className="text-success text-center mt-2">Boleta enviada a {orden.cliente.correo}.</p>
      )}
    </section>
  )
}