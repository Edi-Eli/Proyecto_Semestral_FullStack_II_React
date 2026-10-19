import { getProductos } from '../../data/crudService.js'
import { useCart } from '../../context/cartContext.js'
import ProductCard from '../../components/common/ProductCard.jsx'

export default function Ofertas() {
  const { agregarAlCarrito } = useCart()
  const ofertas = getProductos().filter((p) => p.enOferta === true)

  return (
    <section className="seccion-pro">
      <h1 className="ti-pro">Ofertas</h1>

      {ofertas.length === 0 ? (
        <p className="text-center">No hay ofertas disponibles por ahora.</p>
      ) : (
        <div className="conte-tar-pro">
          {ofertas.map((producto) => (
            <ProductCard key={producto.id} producto={producto} onAdd={agregarAlCarrito} />
          ))}
        </div>
      )}
    </section>
  )
}
