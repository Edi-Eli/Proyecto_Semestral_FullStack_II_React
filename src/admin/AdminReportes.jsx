import { crudService, formatearPrecioCLP } from "../services/crudService";
import { TIPOS_USUARIO, ESTADOS_ORDEN } from "../js/semillas";

export default function AdminReportes() {
    const productos = crudService.listProductos();
    const usuarios = crudService.listUsuarios();
    const ordenes = crudService.listOrdenes();

    const totalRecaudado = ordenes
        .filter((orden) => orden.estado !== "Cancelado")
        .reduce((acc, orden) => acc + crudService.calcularTotales(orden).total, 0);

    const mayorStock = productos.length
        ? productos.reduce((a, b) => (b.stock > a.stock ? b : a))
        : null;
    const menorStock = productos.length
        ? productos.reduce((a, b) => (b.stock < a.stock ? b : a))
        : null;

    return (
        <main className="admin-contenido">
            <h1>Reportes</h1>

            <section className="tarjetas-resumen">
                <article className="tarjeta-resumen">
                    <h2>Total recaudado</h2>
                    <p>{formatearPrecioCLP(totalRecaudado)}</p>
                </article>
                <article className="tarjeta-resumen">
                    <h2>Mayor stock</h2>
                    <p>{mayorStock ? `${mayorStock.nombre} (${mayorStock.stock})` : "-"}</p>
                </article>
                <article className="tarjeta-resumen">
                    <h2>Menor stock</h2>
                    <p>{menorStock ? `${menorStock.nombre} (${menorStock.stock})` : "-"}</p>
                </article>
            </section>

            <section className="seccion-tabla">
                <h2>Usuarios por rol</h2>
                <table className="tabla-admin">
                    <thead>
                        <tr>
                            <th>Rol</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TIPOS_USUARIO.map((tipo) => (
                            <tr key={tipo}>
                                <td>{tipo}</td>
                                <td>{usuarios.filter((u) => u.tipoUsuario === tipo).length}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="seccion-tabla">
                <h2>Órdenes por estado</h2>
                <table className="tabla-admin">
                    <thead>
                        <tr>
                            <th>Estado</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ESTADOS_ORDEN.map((estado) => (
                            <tr key={estado}>
                                <td>
                                    <span className={`badge badge-${estado.toLowerCase()}`}>{estado}</span>
                                </td>
                                <td>{ordenes.filter((orden) => orden.estado === estado).length}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </main>
    );
}