import { crudService, formatearPrecioCLP } from "../../services/crudService";

export default function BoletaModal({ orden, onCerrar }) {
    if (orden === null) {
        return null;
    }
    const { subtotal, iva, total } = crudService.calcularTotales(orden);

    return (
        <div className="modal-overlay" onClick={onCerrar}>
            <div className="modal-boleta" onClick={(evento) => evento.stopPropagation()}>
                <div className="boleta-header">
                    <h2>Boleta {orden.id}</h2>
                    <button type="button" className="btn-admin btn-limpiar" onClick={onCerrar}>
                        Cerrar
                    </button>
                </div>

                <p><strong>Fecha:</strong> {orden.fecha}</p>
                <p><strong>Cliente:</strong> {orden.cliente} ({orden.runCliente})</p>
                <p>
                    <strong>Estado:</strong>{" "}
                    <span className={`badge badge-${orden.estado.toLowerCase()}`}>{orden.estado}</span>
                </p>

                <table className="tabla-admin">
                    <thead>
                        <tr>
                            <th>Codigo</th>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orden.items.map((item) => (
                            <tr key={item.codigo}>
                                <td>{item.codigo}</td>
                                <td>{item.nombre}</td>
                                <td>{item.cantidad}</td>
                                <td>{formatearPrecioCLP(item.precio)}</td>
                                <td>{formatearPrecioCLP(item.cantidad * item.precio)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="boleta-totales">
                    <p>Subtotal: {formatearPrecioCLP(subtotal)}</p>
                    <p>IVA (19%): {formatearPrecioCLP(iva)}</p>
                    <p className="boleta-total">Total: {formatearPrecioCLP(total)}</p>
                </div>
            </div>
        </div>
    );
}