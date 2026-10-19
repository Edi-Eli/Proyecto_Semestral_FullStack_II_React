import { Link } from 'react-router-dom'
import { useCart } from '../../context/cartContext.js'
import { formatearPrecioCLP } from '../../data/crudService.js'

export default function Carrito() {
  const { carrito, cambiarCantidad, eliminarDelCarrito, limpiarCarrito, totalCarrito } = useCart()

  if (carrito.length === 0) {
    return (
      <section className="seccion-pro text-center">
        <h1 className="ti-pro">Tu Carrito de Compras</h1>
        <p className="lead">El carrito está vacío.</p>
        <Link to="/productos" className="btn-pro text-decoration-none">Ir a Productos</Link>
      </section>
    )
  }

  return (
    <section className="seccion-pro">
      <h1 className="ti-pro">Tu Carrito de Compras</h1>

      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {carrito.map((item) => (
              <tr key={item.productoId}>
                <td className="d-flex align-items-center gap-2">
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    style={{ width: 50, height: 50, objectFit: 'contain' }}
                  />
                  {item.nombre}
                </td>
                <td>{formatearPrecioCLP(item.precio)}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      aria-label={`Disminuir ${item.nombre}`}
                      onClick={() => cambiarCantidad(item.productoId, item.cantidad - 1)}
                    >
                      -
                    </button>
                    <span>{item.cantidad}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      aria-label={`Aumentar ${item.nombre}`}
                      onClick={() => cambiarCantidad(item.productoId, item.cantidad + 1)}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td>{formatearPrecioCLP(item.precio * item.cantidad)}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => eliminarDelCarrito(item.productoId)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h3>
          Total: <span data-testid="total-carrito">{formatearPrecioCLP(totalCarrito)}</span>
        </h3>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={limpiarCarrito}>
            Limpiar
          </button>
          <Link to="/checkout" className="btn btn-success text-decoration-none">
            Comprar ahora
          </Link>
        </div>
      </div>
    </section>
  )
}
