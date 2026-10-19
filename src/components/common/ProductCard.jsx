import { Link } from 'react-router-dom'
import { formatearPrecioCLP } from '../../data/crudService.js'

function ProductCard({ producto, onAdd }) {
  const esGratis = producto.precio === 0
  const tieneOferta = producto.enOferta && producto.precioOferta > 0
  const precioFinal = tieneOferta ? producto.precioOferta : producto.precio

  return (
    <article className="tarjeta-pro">
      <img src={producto.imagen} alt={producto.nombre} />
      <h3>{producto.nombre}</h3>

      {esGratis ? (
        <p className="precio text-success">FREE</p>
      ) : tieneOferta ? (
        <p className="precio">
          <span className="text-decoration-line-through text-muted me-2">
            {formatearPrecioCLP(producto.precio)}
          </span>
          {formatearPrecioCLP(precioFinal)}
        </p>
      ) : (
        <p className="precio">{formatearPrecioCLP(precioFinal)}</p>
      )}

      <div className="acciones">
        <Link to={`/producto/${producto.id}`} className="btn-pro text-decoration-none">
          Ver Producto
        </Link>
        <button type="button" className="btn-pro" onClick={() => onAdd(producto)}>
          Añadir al carrito
        </button>
      </div>
    </article>
  )
}

export default ProductCard
