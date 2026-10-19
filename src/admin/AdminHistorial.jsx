import { Link, useParams } from 'react-router-dom'
import { getUsuarios, getOrdenesByUsuario, formatearPrecioCLP } from '../data/crudService.js'

export default function AdminHistorial() {
  const { id } = useParams()
  const usuario = getUsuarios().find((u) => u.run === id) || null
  const ordenes = getOrdenesByUsuario(usuario ? usuario.correo : id)

  return (
    <main className="admin-contenido">
      <h1>Historial de Compras</h1>

      {usuario ? (
        <p className="admin-saludo">
          {usuario.nombre} {usuario.apellidos} — {usuario.correo}
        </p>
      ) : (
        <p className="admin-saludo">Usuario no encontrado.</p>
      )}

      <section className="seccion-tabla">
        <table className="tabla-admin">
          <thead>
            <tr>
              <th>Boleta</th>
              <th>Fecha</th>
              <th>Items</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.length === 0 ? (
              <tr>
                <td colSpan="5">Este usuario no tiene compras registradas.</td>
              </tr>
            ) : (
              ordenes.map((orden) => (
                <tr key={orden.id}>
                  <td>{orden.codigo}</td>
                  <td>{orden.fecha}</td>
                  <td>{orden.items.length}</td>
                  <td>{formatearPrecioCLP(orden.total)}</td>
                  <td>
                    <span className={`badge badge-${orden.estado.toLowerCase()}`}>
                      {orden.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <Link className="btn-admin btn-editar" to="/admin/usuarios">
        Volver a Usuarios
      </Link>
    </main>
  )
}