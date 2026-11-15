import { Link } from 'react-router-dom'
import {
  formatearPrecioCLP,
  precioFinal,
  esGratis,
  tieneOferta,
  imagenProducto,
} from '../../utils/productoHelpers.js'

function ProductCard({ producto, onAdd }) {
  const gratis = esGratis(producto)
  const oferta = tieneOferta(producto)
  const final = precioFinal(producto)
  const sinStock = Number(producto.stock) <= 0
  const meta = [producto.marca, producto.unidad].filter(Boolean).join(' · ')

  return (
    <article className="tarjeta-pro">
      <img
        src={imagenProducto(producto)}
        alt={producto.nombre}
        onError={(evento) => {
          evento.currentTarget.src = imagenProducto(null)
        }}
      />
      <h3>{producto.nombre}</h3>

      {meta && <p className="tarjeta-meta text-muted mb-1">{meta}</p>}

      {gratis ? (
        <p className="precio text-success">FREE</p>
      ) : oferta ? (
        <p className="precio">
          <span className="text-decoration-line-through text-muted me-2">
            {formatearPrecioCLP(producto.precio)}
          </span>
          {formatearPrecioCLP(final)}
        </p>
      ) : (
        <p className="precio">{formatearPrecioCLP(final)}</p>
      )}

      <p className={`tarjeta-stock ${sinStock ? 'text-danger' : 'text-muted'}`}>
        {sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
      </p>

      <div className="acciones">
        <Link to={`/producto/${producto.id}`} className="btn-pro text-decoration-none">
          Ver Producto
        </Link>
        <button
          type="button"
          className="btn-pro"
          onClick={() => onAdd(producto)}
          disabled={sinStock}
        >
          Añadir al carrito
        </button>
      </div>
    </article>
  )
}

export default ProductCard
