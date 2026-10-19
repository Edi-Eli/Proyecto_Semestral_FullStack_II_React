import { Link } from 'react-router-dom'
import { getProductos, getCategorias } from '../../data/crudService.js'
import { useCart } from '../../context/cartContext.js'
import ProductCard from '../../components/common/ProductCard.jsx'

export default function Home() {
  const { agregarAlCarrito } = useCart()
  const categorias = getCategorias()
  const destacados = getProductos().slice(0, 8)

  return (
    <>
      <section className="seccion-pro text-center">
        <h1 className="ti-pro" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
          Ferretería Los Maestros
        </h1>
        <p className="lead">Bienvenido a tu tienda de materiales de construcción y herramientas.</p>
        <Link to="/productos" className="btn-pro text-decoration-none">Ver todos los productos</Link>
      </section>

      <section className="seccion-pro">
        <h2 className="ti-pro">Categorías</h2>
        <div className="conte-tar-pro">
          {categorias.map((cat) => (
            <article className="tarjeta-pro" key={cat.id}>
              <img src={cat.imagen} alt={cat.nombre} />
              <h3>{cat.nombre}</h3>
              <Link to={`/categorias/${cat.id}`} className="btn-pro text-decoration-none">
                Ver categoría
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="seccion-pro">
        <h2 className="ti-pro">Productos destacados</h2>
        <div className="conte-tar-pro">
          {destacados.map((producto) => (
            <ProductCard key={producto.id} producto={producto} onAdd={agregarAlCarrito} />
          ))}
        </div>
      </section>
    </>
  )
}
