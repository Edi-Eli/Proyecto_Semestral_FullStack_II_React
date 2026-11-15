import { useEffect, useState } from 'react'
import * as productosApi from '../../api/productos.js'
import { useCart } from '../../context/cartContext.js'
import ProductCard from '../../components/common/ProductCard.jsx'
import Loader from '../../components/common/Loader.jsx'
import MensajeError from '../../components/common/MensajeError.jsx'
import Paginador from '../../components/common/Paginador.jsx'

const TAMANO_PAGINA = 12

export default function Ofertas() {
  const { agregarAlCarrito } = useCart()
  const [page, setPage] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [datos, setDatos] = useState(null)
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    let vigente = true
    productosApi
      .listarOfertas({ page, size: TAMANO_PAGINA })
      .then((respuesta) => {
        if (!vigente) return
        setDatos(respuesta)
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
  }, [page, recargar])

  function cambiarPagina(nueva) {
    setCargando(true)
    setPage(nueva)
  }

  function reintentar() {
    setCargando(true)
    setError(null)
    setRecargar((n) => n + 1)
  }

  const ofertas = datos?.content || []
  const totalPages = datos?.totalPages || 1

  return (
    <section className="seccion-pro">
      <h1 className="ti-pro">Ofertas</h1>

      {cargando && <Loader mensaje="Cargando ofertas..." />}

      {!cargando && error && <MensajeError mensaje={error} onReintentar={reintentar} />}

      {!cargando && !error && (
        ofertas.length === 0 ? (
          <p className="text-center">No hay ofertas disponibles por ahora.</p>
        ) : (
          <>
            <div className="conte-tar-pro">
              {ofertas.map((producto) => (
                <ProductCard key={producto.id} producto={producto} onAdd={agregarAlCarrito} />
              ))}
            </div>
            <Paginador page={page} totalPages={totalPages} onCambiar={cambiarPagina} />
          </>
        )
      )}
    </section>
  )
}
