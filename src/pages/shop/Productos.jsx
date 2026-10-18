import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProductos } from '../../data/crudService.js'
import { useCart } from '../../context/cartContext.js'
import ProductCard from '../../components/common/ProductCard.jsx'

export default function Productos() {
  const { agregarAlCarrito } = useCart()
  const [params] = useSearchParams()
  const [busqueda, setBusqueda] = useState(params.get('q') || '')
  const productos = getProductos()

  const filtrados = productos.filter((p) =>
    `${p.nombre} ${p.descripcion}`.toLowerCase().includes(busqueda.trim().toLowerCase()),
  )

  return (
    <section className="seccion-pro">
      <h1 className="ti-pro">Nuestros Productos</h1>

      <input
        type="search"
        className="form-control mb-4"
        placeholder="Buscar producto..."
        aria-label="Buscar producto"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {filtrados.length === 0 ? (
        <p className="text-center">No se encontraron productos para &quot;{busqueda}&quot;.</p>
      ) : (
        <div className="conte-tar-pro">
          {filtrados.map((producto) => (
            <ProductCard key={producto.id} producto={producto} onAdd={agregarAlCarrito} />
          ))}
        </div>
      )}
    </section>
  )
}
