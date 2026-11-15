import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as productosApi from '../../api/productos.js'
import { useCart } from '../../context/cartContext.js'
import Loader from '../../components/common/Loader.jsx'
import MensajeError from '../../components/common/MensajeError.jsx'
import { formatearPrecioCLP, precioFinal, esGratis, imagenProducto } from '../../utils/productoHelpers.js'

export default function ProductoDetalle() {
  const { id } = useParams()
  const { agregarAlCarrito } = useCart()
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [producto, setProducto] = useState(null)
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    let vigente = true
    productosApi
      .detalle(id)
      .then((respuesta) => {
        if (!vigente) return
        setProducto(respuesta)
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
  }, [id, recargar])

  function reintentar() {
    setCargando(true)
    setError(null)
    setRecargar((n) => n + 1)
  }

  const sinStock = producto ? Number(producto.stock) <= 0 : false
  const categoria = producto
    ? [producto.categoriaNombre, producto.subcategoriaNombre].filter(Boolean).join(' / ')
    : ''
  const meta = producto ? [producto.marca, producto.unidad].filter(Boolean).join(' · ') : ''

  if (cargando) {
    return (
      <section className="seccion-pro">
        <Loader mensaje="Cargando producto..." />
      </section>
    )
  }

  if (error) {
    return (
      <section className="seccion-pro">
        <MensajeError mensaje={error} onReintentar={reintentar} />
      </section>
    )
  }

  if (!producto) {
    return (
      <section className="seccion-pro text-center">
        <h1 className="ti-pro">Producto no encontrado</h1>
        <Link to="/productos" className="btn-pro text-decoration-none">
          Volver a Productos
        </Link>
      </section>
    )
  }

  return (
    <section className="det-contenedor">
      <img
        src={imagenProducto(producto)}
        alt={producto.nombre}
        onError={(evento) => {
          evento.currentTarget.src = imagenProducto(null)
        }}
      />
      <div>
        <h1 className="det-tit">{producto.nombre}</h1>
        <p className="det-cat">{categoria || 'Sin categoría'}</p>
        {meta && <p className="text-muted">{meta}</p>}
        <p className="det-precio">
          {esGratis(producto) ? 'FREE' : formatearPrecioCLP(precioFinal(producto))}
        </p>
        <p className={`det-stock ${sinStock ? 'text-danger' : ''}`}>
          {sinStock ? 'Sin stock' : `Stock disponible: ${producto.stock}`}
        </p>

        <h3>Descripción</h3>
        <p>{producto.descripcion}</p>

        <div className="acciones">
          <button
            type="button"
            className="btn-pro"
            onClick={() => agregarAlCarrito(producto)}
            disabled={sinStock}
          >
            Añadir al carrito
          </button>
          <Link to="/carrito" className="btn-pro text-decoration-none">
            Ir al carrito
          </Link>
        </div>
      </div>
    </section>
  )
}
