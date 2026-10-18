import { Link, useParams } from 'react-router-dom'
import { getCategorias, getProductos } from '../../data/crudService.js'
import { useCart } from '../../context/cartContext.js'
import ProductCard from '../../components/common/ProductCard.jsx'

export default function Categorias() {
  const { id } = useParams()
  const { agregarAlCarrito } = useCart()
  const categorias = getCategorias()

  if (!id) {
    return (
      <section className="seccion-pro">
        <h1 className="ti-pro">Categorías</h1>
        <div className="conte-tar-pro">
          {categorias.map((cat) => (
            <article className="tarjeta-pro" key={cat.id}>
              <img src={cat.imagen} alt={cat.nombre} />
              <h3>{cat.nombre}</h3>
              <Link to={`/categorias/${cat.id}`} className="btn-pro text-decoration-none">
                Ver productos
              </Link>
            </article>
          ))}
        </div>
      </section>
    )
  }

  const categoria = categorias.find((c) => c.id === Number(id))
  const productos = getProductos().filter((p) => p.categoriaId === Number(id))

  return (
    <section className="seccion-pro">
      <h1 className="ti-pro">{categoria ? categoria.nombre : 'Categoría'}</h1>

      {productos.length === 0 ? (
        <p className="text-center">No hay productos en esta categoría.</p>
      ) : (
        <div className="conte-tar-pro">
          {productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} onAdd={agregarAlCarrito} />
          ))}
        </div>
      )}
    </section>
  )
}
