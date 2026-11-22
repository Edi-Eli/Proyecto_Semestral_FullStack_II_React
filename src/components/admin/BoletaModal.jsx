import { formatearPrecioCLP } from '../../utils/formato.js'

const ETIQUETA_ENTREGA = { RETIRO: 'Retiro en tienda', DESPACHO: 'Despacho a domicilio' }
const ETIQUETA_PAGO = { CONTADO: 'Contado', CUENTA_CORRIENTE: 'Cuenta corriente' }

function formatearFecha(fecha) {
  if (!fecha) return ''
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return String(fecha)
  return d.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function BoletaModal({ orden, onCerrar }) {
  if (!orden) return null

  const esDespacho = orden.tipoEntrega === 'DESPACHO'
  const direccion = orden.direccion || {}

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-boleta" onClick={(evento) => evento.stopPropagation()}>
        <div className="boleta-header">
          <h2>Boleta {orden.codigo}</h2>
          <button type="button" className="btn-admin btn-limpiar" onClick={onCerrar}>
            Cerrar
          </button>
        </div>

        <p><strong>Nro:</strong> #{orden.nro}</p>
        <p><strong>Fecha:</strong> {formatearFecha(orden.fecha)}</p>
        <p>
          <strong>Cliente:</strong> {orden.cliente.nombre} {orden.cliente.apellidos} (
          {orden.cliente.correo})
        </p>
        <p>
          <strong>Tipo de entrega:</strong> {ETIQUETA_ENTREGA[orden.tipoEntrega] || orden.tipoEntrega}
        </p>
        {esDespacho ? (
          <p>
            <strong>Dirección:</strong> {direccion.calle}
            {direccion.depto ? `, Depto ${direccion.depto}` : ''}, {direccion.comuna}, {direccion.region}
            {direccion.indicaciones ? ` (${direccion.indicaciones})` : ''}
          </p>
        ) : (
          <p><strong>Retiro en:</strong> Ferretería Los Maestros — La Serena</p>
        )}
        <p>
          <strong>Método de pago:</strong> {ETIQUETA_PAGO[orden.metodoPago] || orden.metodoPago}
        </p>
        <p>
          <strong>Estado:</strong>{' '}
          <span className={`badge badge-${(orden.estado || '').toLowerCase()}`}>{orden.estado}</span>
        </p>

        <table className="tabla-admin">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {orden.items.map((item) => (
              <tr key={item.productoId}>
                <td>{item.nombre}</td>
                <td>{item.cantidad}</td>
                <td>{formatearPrecioCLP(item.precio)}</td>
                <td>{formatearPrecioCLP(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="boleta-totales">
          <p className="boleta-total">Total: {formatearPrecioCLP(orden.total)}</p>
        </div>
      </div>
    </div>
  )
}