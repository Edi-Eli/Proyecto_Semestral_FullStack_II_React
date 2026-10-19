import { Link } from "react-router-dom";
import { crudService, formatearPrecioCLP } from "../services/crudService";

export default function AdminCriticos() {
    const criticos = crudService.listProductos().filter((p) => p.stock <= p.stockCritico);

    return (
        <main className="admin-contenido">
            <h1>Productos Críticos</h1>

            <p className="alerta-stock">
                {criticos.length > 0
                    ? `Hay ${criticos.length} producto(s) con stock igual o bajo el stock crítico.`
                    : "No hay productos con stock crítico."}
            </p>

            <section className="seccion-tabla">
                <table className="tabla-admin">
                    <thead>
                        <tr>
                            <th>Codigo</th>
                            <th>Nombre</th>
                            <th>Categoria</th>
                            <th>Stock</th>
                            <th>Stock critico</th>
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
                                <tr key={producto.codigo}>
                                    <td>{producto.codigo}</td>
                                    <td>{producto.nombre}</td>
                                    <td>{producto.categoria}</td>
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
    );
}