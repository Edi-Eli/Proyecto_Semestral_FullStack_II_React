import { Link, useLocation } from 'react-router-dom'
import { formatearPrecioCLP } from '../../data/crudService.js'

export default function PagoError() {
  const { state } = useLocation()
  const orden = state?.orden

  return (
    <section className="seccion-pro">
      <h1 className="ti-pro text-danger">No se pudo realizar el pago</h1>
      <p className="text-center">
        Hubo un problema al procesar tu compra. Puedes intentarlo nuevamente.
      </p>

      {orden && (
        <>
          <h3>Resumen de dirección</h3>
          <p>
            {orden.direccion.calle}
            {orden.direccion.depto ? `, Depto ${orden.direccion.depto}` : ''}, {orden.direccion.comuna},{' '}
            {orden.direccion.region}
          </p>

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
                {orden.items.map((item) => (
                  <tr key={item.productoId}>
                    <td>{item.nombre}</td>
                    <td>{item.cantidad}</td>
                    <td>{formatearPrecioCLP(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h4 className="text-end">Total: {formatearPrecioCLP(orden.total)}</h4>
        </>
      )}

      <div className="text-center mt-3">
        <Link to="/checkout" className="btn btn-danger text-decoration-none">
          VOLVER A REALIZAR EL PAGO
        </Link>
      </div>
    </section>
  )
}
