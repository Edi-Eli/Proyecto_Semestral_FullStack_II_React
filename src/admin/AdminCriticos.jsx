import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as productosApi from '../api/productos.js'
import { formatearPrecioCLP } from '../utils/productoHelpers.js'
import Loader from '../components/common/Loader.jsx'
import MensajeError from '../components/common/MensajeError.jsx'

export default function AdminCriticos() {
  const [criticos, setCriticos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    let vigente = true
    Promise.all([productosApi.listarCriticos(), productosApi.listarCategorias()])
      .then(([lista, cats]) => {
        if (!vigente) return
        setCriticos(lista)
        setCategorias(cats)
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

  function nombreCategoria(id) {
    const cat = categorias.find((c) => Number(c.id) === Number(id))
    return cat ? cat.nombre : '-'
  }

  return (
    <main className="admin-contenido">
      <h1>Productos Críticos</h1>

      {cargando && <Loader mensaje="Cargando productos críticos..." />}

      {!cargando && error && <MensajeError mensaje={error} onReintentar={reintentar} />}

      {!cargando && !error && (
        <>
          <p className="alerta-stock">
            {criticos.length > 0
              ? `Hay ${criticos.length} producto(s) con stock igual o bajo el stock crítico.`
              : 'No hay productos con stock crítico.'}
          </p>

          <section className="seccion-tabla">
            <table className="tabla-admin">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Stock</th>
                  <th>Stock crítico</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {criticos.length === 0 ? (
                  <tr>
                    <td colSpan="6">No hay productos críticos.</td>
                  </tr>
                ) : (
                  criticos.map((producto) => (
                    <tr key={producto.id}>
                      <td>{producto.codigo}</td>
                      <td>{producto.nombre}</td>
                      <td>{producto.categoriaNombre || nombreCategoria(producto.categoriaId)}</td>
                      <td className="stock-bajo">{producto.stock}</td>
                      <td>{producto.stockCritico}</td>
                      <td>{formatearPrecioCLP(producto.precio)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </>
      )}

      <Link className="btn-admin btn-editar" to="/admin/productos">
        Volver a Productos
      </Link>
    </main>
  )
}
