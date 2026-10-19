import { formatearPrecioCLP } from "../../data/crudService";

export default function BoletaModal({ orden, onCerrar }) {
    if (orden === null) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onCerrar}>
            <div className="modal-boleta" onClick={(evento) => evento.stopPropagation()}>
                <div className="boleta-header">
                    <h2>Boleta {orden.codigo}</h2>
                    <button type="button" className="btn-admin btn-limpiar" onClick={onCerrar}>
                        Cerrar
                    </button>
                </div>

                <p><strong>Nro:</strong> #{orden.nro}</p>
                <p><strong>Fecha:</strong> {orden.fecha}</p>
                <p>
                    <strong>Cliente:</strong> {orden.cliente.nombre} {orden.cliente.apellidos} (
                    {orden.cliente.correo})
                </p>
                <p>
                    <strong>Dirección:</strong> {orden.direccion.calle}
                    {orden.direccion.depto ? `, Depto ${orden.direccion.depto}` : ""},{" "}
                    {orden.direccion.comuna}, {orden.direccion.region}
                </p>
                <p>
                    <strong>Estado:</strong>{" "}
                    <span className={`badge badge-${orden.estado.toLowerCase()}`}>{orden.estado}</span>
                </p>

                <table className="tabla-admin">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orden.items.map((item) => (
                            <tr key={item.productoId}>
                                <td>{item.nombre}</td>
                                <td>{item.cantidad}</td>
                                <td>{formatearPrecioCLP(item.precio)}</td>
                                <td>{formatearPrecioCLP(item.subtotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="boleta-totales">
                    <p className="boleta-total">Total: {formatearPrecioCLP(orden.total)}</p>
                </div>
            </div>
        </div>
    );
}