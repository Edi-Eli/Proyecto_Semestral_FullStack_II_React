import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as productosApi from '../../api/productos.js'
import { useCart } from '../../context/cartContext.js'
import ProductCard from '../../components/common/ProductCard.jsx'
import Loader from '../../components/common/Loader.jsx'
import MensajeError from '../../components/common/MensajeError.jsx'
import Paginador from '../../components/common/Paginador.jsx'
import { IMAGEN_FALLBACK } from '../../utils/productoHelpers.js'

const TAMANO_PAGINA = 12

export default function Categorias() {
  const { id } = useParams()
  const { agregarAlCarrito } = useCart()

  const [categorias, setCategorias] = useState([])
  const [cargandoCategorias, setCargandoCategorias] = useState(true)
  const [errorCategorias, setErrorCategorias] = useState(null)

  const [page, setPage] = useState(0)
  const [productos, setProductos] = useState([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [cargandoProductos, setCargandoProductos] = useState(true)
  const [errorProductos, setErrorProductos] = useState(null)
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    let vigente = true
    productosApi
      .listarCategorias()
      .then((respuesta) => {
        if (!vigente) return
        setCategorias(respuesta)
        setErrorCategorias(null)
        setCargandoCategorias(false)
      })
      .catch((err) => {
        if (!vigente) return
        setErrorCategorias(err.message)
        setCargandoCategorias(false)
      })
    return () => {
      vigente = false
    }
  }, [recargar])

  useEffect(() => {
    if (!id) return undefined
    let vigente = true
    productosApi
      .listar({ page, size: TAMANO_PAGINA, categoriaId: id })
      .then((respuesta) => {
        if (!vigente) return
        setProductos(respuesta.content || [])
        setTotalElements(respuesta.totalElements || 0)
        setTotalPages(respuesta.totalPages || 1)
        setErrorProductos(null)
        setCargandoProductos(false)
      })
      .catch((err) => {
        if (!vigente) return
        setErrorProductos(err.message)
        setCargandoProductos(false)
      })
    return () => {
      vigente = false
    }
  }, [id, page, recargar])

  function reintentarCategorias() {
    setCargandoCategorias(true)
    setErrorCategorias(null)
    setRecargar((n) => n + 1)
  }

  function reintentarProductos() {
    setCargandoProductos(true)
    setErrorProductos(null)
    setRecargar((n) => n + 1)
  }

  function irACategoria() {
    setCargandoProductos(true)
    setPage(0)
  }

  function cambiarPagina(nueva) {
    setCargandoProductos(true)
    setPage(nueva)
  }

  if (!id) {
    return (
      <section className="seccion-pro">
        <h1 className="ti-pro">Categorías</h1>

        {cargandoCategorias && <Loader mensaje="Cargando categorías..." />}

        {!cargandoCategorias && errorCategorias && (
          <MensajeError mensaje={errorCategorias} onReintentar={reintentarCategorias} />
        )}

        {!cargandoCategorias && !errorCategorias && (
          <div className="conte-tar-pro">
            {categorias.map((categoria) => (
              <article className="tarjeta-pro" key={categoria.id}>
                <img
                  src={categoria.imagenUrl || categoria.imagen}
                  alt={categoria.nombre}
                  onError={(evento) => {
                    evento.currentTarget.src = IMAGEN_FALLBACK
                  }}
                />
                <h3>{categoria.nombre}</h3>
                <Link
                  to={`/categorias/${categoria.id}`}
                  className="btn-pro text-decoration-none"
                  onClick={irACategoria}
                >
                  Ver productos
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    )
  }

  const categoria = categorias.find((c) => c.id === Number(id))

  return (
    <section className="seccion-pro">
      <h1 className="ti-pro">{categoria ? categoria.nombre : 'Categoría'}</h1>

      {cargandoProductos && <Loader mensaje="Cargando productos..." />}

      {!cargandoProductos && errorProductos && (
        <MensajeError mensaje={errorProductos} onReintentar={reintentarProductos} />
      )}

      {!cargandoProductos && !errorProductos && (
        productos.length === 0 ? (
          <p className="text-center">No hay productos en esta categoría.</p>
        ) : (
          <>
            <p className="text-center text-muted">{totalElements} productos</p>
            <div className="conte-tar-pro">
              {productos.map((producto) => (
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
