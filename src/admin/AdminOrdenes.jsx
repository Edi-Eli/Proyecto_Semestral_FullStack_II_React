import { useState } from 'react'
import BoletaModal from '../components/admin/BoletaModal.jsx'
import { getOrdenes, formatearPrecioCLP } from '../data/crudService.js'

export default function AdminOrdenes() {
  const [ordenes] = useState(() => getOrdenes())
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null)

  return (
    <main className="admin-contenido">
      <h1>Órdenes</h1>

      <section className="seccion-tabla">
        <h2>Listado de órdenes</h2>
        <table className="tabla-admin">
          <thead>
            <tr>
              <th>Boleta</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Items</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.length === 0 ? (
              <tr>
                <td colSpan="7">No hay órdenes registradas.</td>
              </tr>
            ) : (
              ordenes.map((orden) => (
                <tr key={orden.id}>
                  <td>{orden.codigo}</td>
                  <td>{orden.fecha}</td>
                  <td>{orden.cliente.nombre} {orden.cliente.apellidos}</td>
                  <td>{orden.items.length}</td>
                  <td>{formatearPrecioCLP(orden.total)}</td>
                  <td>
                    <span className={`badge badge-${orden.estado.toLowerCase()}`}>
                      {orden.estado}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-admin btn-editar"
                      onClick={() => setOrdenSeleccionada(orden)}
                    >
                      Mostrar Boleta
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <BoletaModal orden={ordenSeleccionada} onCerrar={() => setOrdenSeleccionada(null)} />
    </main>
  )
}