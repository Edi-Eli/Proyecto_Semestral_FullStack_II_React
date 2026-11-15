import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as productosApi from '../../api/productos.js'
import { useCart } from '../../context/cartContext.js'
import ProductCard from '../../components/common/ProductCard.jsx'
import Loader from '../../components/common/Loader.jsx'
import MensajeError from '../../components/common/MensajeError.jsx'
import Paginador from '../../components/common/Paginador.jsx'

const TAMANO_PAGINA = 12

export default function Productos() {
  const { agregarAlCarrito } = useCart()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const page = Number(params.get('page') || 0)

  const inputBusqueda = useRef(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [datos, setDatos] = useState(null)
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    let vigente = true
    productosApi
      .listar({ page, size: TAMANO_PAGINA, q })
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
  }, [page, q, recargar])

  function buscar(evento) {
    evento.preventDefault()
    const texto = inputBusqueda.current?.value.trim() || ''
    setCargando(true)
    setParams(texto ? { q: texto } : {})
  }

  function cambiarPagina(nueva) {
    const siguientes = new URLSearchParams(params)
    if (nueva > 0) siguientes.set('page', String(nueva))
    else siguientes.delete('page')
    setCargando(true)
    setParams(siguientes)
  }

  function reintentar() {
    setCargando(true)
    setError(null)
    setRecargar((n) => n + 1)
  }

  const productos = datos?.content || []
  const totalElements = datos?.totalElements || 0
  const totalPages = datos?.totalPages || 1

  return (
    <section className="seccion-pro">
      <h1 className="ti-pro">Nuestros Productos</h1>

      <form className="d-flex justify-content-center mb-4" role="search" onSubmit={buscar}>
        <input
          key={q}
          ref={inputBusqueda}
          type="search"
          className="form-control w-auto me-2"
          placeholder="Buscar producto..."
          aria-label="Buscar producto"
          defaultValue={q}
        />
        <button type="submit" className="btn btn-dark">
          Buscar
        </button>
      </form>

      {cargando && <Loader mensaje="Cargando productos..." />}

      {!cargando && error && <MensajeError mensaje={error} onReintentar={reintentar} />}

      {!cargando && !error && (
        <>
          <p className="text-center text-muted">{totalElements} productos</p>

          {productos.length === 0 ? (
            <p className="text-center">
              No se encontraron productos{q ? ` para "${q}"` : ''}.
            </p>
          ) : (
            <>
              <div className="conte-tar-pro">
                {productos.map((producto) => (
                  <ProductCard key={producto.id} producto={producto} onAdd={agregarAlCarrito} />
                ))}
              </div>
              <Paginador page={page} totalPages={totalPages} onCambiar={cambiarPagina} />
            </>
          )}
        </>
      )}
    </section>
  )
}
