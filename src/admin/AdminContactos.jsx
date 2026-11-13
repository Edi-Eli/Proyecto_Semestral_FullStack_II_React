import { useCallback, useEffect, useState } from "react";
import { listarMensajes, marcarLeido, marcarResuelto } from "../api/contacto";

/**
 * AdminContactos — CR de mensajes de contacto (EP3).
 * ------------------------------------------------------------------
 * Responsable: Edi (área G del documento 01_Mejoras_Frontend.md).
 *
 * Lista los mensajes recibidos y permite marcarlos como LEIDO o RESUELTO.
 * Los datos vienen de `GET /api/contactos`; el cambio de estado usa
 * `PATCH /api/contactos/{id}/estado`.
 */

const ETIQUETAS_ESTADO = {
    PENDIENTE: "Pendiente",
    LEIDO: "Leído",
    RESUELTO: "Resuelto",
};

function normalizarEstado(estado) {
    const valor = String(estado || "").toUpperCase();
    return ETIQUETAS_ESTADO[valor] ? valor : "PENDIENTE";
}

function formatearFecha(fecha) {
    if (!fecha) return "";
    const d = new Date(fecha);
    return Number.isNaN(d.getTime()) ? String(fecha) : d.toLocaleString("es-CL");
}

export default function AdminContactos() {
    const [mensajes, setMensajes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [procesandoId, setProcesandoId] = useState(null);

    const cargarMensajes = useCallback(async () => {
        try {
            const lista = await listarMensajes();
            setMensajes(Array.isArray(lista) ? lista : []);
            setError("");
        } catch (e) {
            setError(e.message || "No se pudieron cargar los mensajes.");
        } finally {
            setCargando(false);
        }
    }, []);

    const recargar = useCallback(() => {
        setCargando(true);
        return cargarMensajes();
    }, [cargarMensajes]);

    useEffect(() => {
        // Carga inicial desde la API al montar (evento externo). El setState
        // ocurre tras el `await`; la regla no distingue el caso asíncrono.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarMensajes();
    }, [cargarMensajes]);

    const cambiarEstadoMensaje = async (mensaje, nuevoEstado) => {
        const id = mensaje.id ?? mensaje._id;
        setProcesandoId(id);
        setError("");
        try {
            await (nuevoEstado === "RESUELTO" ? marcarResuelto(id) : marcarLeido(id));
            await recargar();
        } catch (e) {
            setError(e.message || "No se pudo actualizar el mensaje.");
        } finally {
            setProcesandoId(null);
        }
    };

    return (
        <main className="admin-contenido">
            <h1>Mensajes de contacto</h1>

            {error && (
                <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
                    <span>{error}</span>
                    <button type="button" className="btn-admin btn-limpiar" onClick={recargar}>
                        Reintentar
                    </button>
                </div>
            )}

            <section className="seccion-tabla">
                <h2>Bandeja de entrada</h2>
                <div className="table-responsive">
                    <table className="tabla-admin">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Mensaje</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargando ? (
                                <tr>
                                    <td colSpan="6">Cargando mensajes…</td>
                                </tr>
                            ) : mensajes.length === 0 ? (
                                <tr>
                                    <td colSpan="6">No hay mensajes recibidos.</td>
                                </tr>
                            ) : (
                                mensajes.map((mensaje) => {
                                    const id = mensaje.id ?? mensaje._id;
                                    const estado = normalizarEstado(mensaje.estado);
                                    const ocupado = String(procesandoId) === String(id);
                                    return (
                                        <tr key={id}>
                                            <td>{formatearFecha(mensaje.fecha || mensaje.fechaEnvio || mensaje.creadoEn)}</td>
                                            <td>{mensaje.nombre}</td>
                                            <td>{mensaje.correo}</td>
                                            <td className="mensaje-contacto">{mensaje.mensaje}</td>
                                            <td>{ETIQUETAS_ESTADO[estado]}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn-admin btn-editar"
                                                    onClick={() => cambiarEstadoMensaje(mensaje, "LEIDO")}
                                                    disabled={ocupado || estado === "LEIDO"}
                                                >
                                                    Marcar leído
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-admin btn-editar"
                                                    onClick={() => cambiarEstadoMensaje(mensaje, "RESUELTO")}
                                                    disabled={ocupado || estado === "RESUELTO"}
                                                >
                                                    Marcar resuelto
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}
