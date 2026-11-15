import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as productosApi from '../../api/productos.js'
import { useCart } from '../../context/cartContext.js'
import ProductCard from '../../components/common/ProductCard.jsx'
import Loader from '../../components/common/Loader.jsx'
import MensajeError from '../../components/common/MensajeError.jsx'

export default function Home() {
  const { agregarAlCarrito } = useCart()
  const [categorias, setCategorias] = useState([])
  const [destacados, setDestacados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    let vigente = true
    Promise.all([productosApi.listarCategorias(), productosApi.listar({ size: 8 })])
      .then(([cats, pagina]) => {
        if (!vigente) return
        setCategorias(cats || [])
        setDestacados(pagina?.content || [])
        setError(null)
        setCargando(false)
      })
      .catch((err) => {
        if (!vigente) return
        setError(err.message)
        setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [recargar])

  function reintentar() {
    setError(null)
    setCargando(true)
    setRecargar((n) => n + 1)
  }

  return (
    <>
      <section className="seccion-pro text-center">
        <h1 className="ti-pro" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
          Ferretería Los Maestros
        </h1>
        <p className="lead">Bienvenido a tu tienda de materiales de construcción y herramientas.</p>
        <Link to="/productos" className="btn-pro text-decoration-none">Ver todos los productos</Link>
      </section>

      {cargando && <Loader mensaje="Cargando catálogo..." />}

      {!cargando && error && (
        <div className="seccion-pro">
          <MensajeError mensaje={error} onReintentar={reintentar} />
        </div>
      )}

      {!cargando && !error && (
        <>
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
      )}
    </>
  )
}
