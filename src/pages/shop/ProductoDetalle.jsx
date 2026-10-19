import { Link, useParams } from 'react-router-dom'
import { getProductoById, getCategorias, formatearPrecioCLP } from '../../data/crudService.js'
import { useCart } from '../../context/cartContext.js'

export default function ProductoDetalle() {
  const { id } = useParams()
  const { agregarAlCarrito } = useCart()
  const producto = getProductoById(id)

  if (!producto) {
    return (
      <section className="seccion-pro text-center">
        <h1 className="ti-pro">Producto no encontrado</h1>
        <Link to="/productos" className="btn-pro text-decoration-none">Volver a Productos</Link>
      </section>
    )
  }

  const categoria = getCategorias().find((c) => c.id === producto.categoriaId)
  const tieneOferta = producto.enOferta && producto.precioOferta > 0
  const precioFinal = tieneOferta ? producto.precioOferta : producto.precio

  return (
    <section className="det-contenedor">
      <img src={producto.imagen} alt={producto.nombre} />
      <div>
        <h1 className="det-tit">{producto.nombre}</h1>
        <p className="det-cat">Categoría: {categoria ? categoria.nombre : 'Sin categoría'}</p>
        <p className="det-precio">
          {producto.precio === 0 ? 'FREE' : formatearPrecioCLP(precioFinal)}
        </p>
        <p className="det-stock">Stock disponible: {producto.stock}</p>

        <h3>Descripción</h3>
        <p>{producto.descripcion}</p>

        <div className="acciones">
          <button type="button" className="btn-pro" onClick={() => agregarAlCarrito(producto)}>
            Añadir al carrito
          </button>
          <Link to="/carrito" className="btn-pro text-decoration-none">Ir al carrito</Link>
        </div>
      </div>
    </section>
  )
}
