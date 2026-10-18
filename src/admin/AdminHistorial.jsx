import { Link, useParams } from "react-router-dom";
import { crudService, formatearPrecioCLP } from "../services/crudService";

export default function AdminHistorial() {
    const { id } = useParams();
    const usuario = crudService.listUsuarios().find((u) => u.run === id) || null;
    const ordenes = crudService.listOrdenesPorCliente(id);

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
                            ordenes.map((orden) => {
                                const { total } = crudService.calcularTotales(orden);
                                return (
                                    <tr key={orden.id}>
                                        <td>{orden.id}</td>
                                        <td>{orden.fecha}</td>
                                        <td>{orden.items.length}</td>
                                        <td>{formatearPrecioCLP(total)}</td>
                                        <td>
                                            <span className={`badge badge-${orden.estado.toLowerCase()}`}>
                                                {orden.estado}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </section>

            <Link className="btn-admin btn-editar" to="/admin/usuarios">
                Volver a Usuarios
            </Link>
        </main>
    );
}