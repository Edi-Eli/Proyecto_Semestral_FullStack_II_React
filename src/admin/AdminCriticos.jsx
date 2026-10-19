import { Link } from 'react-router-dom'
import { getProductos, getCategorias, formatearPrecioCLP } from '../data/crudService.js'

export default function AdminCriticos() {
  const categorias = getCategorias()
  const criticos = getProductos().filter((p) => p.stock <= p.stockCritico)

  function nombreCategoria(id) {
    const cat = categorias.find((c) => c.id === id)
    return cat ? cat.nombre : '-'
  }

  return (
    <main className="admin-contenido">
      <h1>Productos Críticos</h1>

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
                  <td>{nombreCategoria(producto.categoriaId)}</td>
                  <td className="stock-bajo">{producto.stock}</td>
                  <td>{producto.stockCritico}</td>
                  <td>{formatearPrecioCLP(producto.precio)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <Link className="btn-admin btn-editar" to="/admin/productos">
        Volver a Productos
      </Link>
    </main>
  )
}