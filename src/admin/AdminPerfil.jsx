import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import * as usuariosApi from "../api/usuarios.js";
import Loader from "../components/common/Loader.jsx";
import { requerido, maxCaracteres, esCorreoValido } from "../utils/validaciones";

const FORM_VACIO = {
    nombre: "",
    apellidos: "",
    correo: "",
    direccion: "",
    password: "",
    confirmar: "",
};

export default function AdminPerfil() {
    const { usuarioActivo, actualizarPerfil } = useAuth();
    const [form, setForm] = useState(FORM_VACIO);
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        let vigente = true;

        if (!usuarioActivo?.run) {
            // Sin RUN no hay nada que cargar; se corta el estado de carga inicial.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCargando(false);
            return () => {
                vigente = false;
            };
        }

        setCargando(true);
        usuariosApi
            .obtenerUsuario(usuarioActivo.run)
            .then((usuario) => {
                if (!vigente) return;
                setForm({
                    nombre: usuario.nombre ?? "",
                    apellidos: usuario.apellidos ?? "",
                    correo: usuario.correo ?? "",
                    direccion: usuario.direccion ?? "",
                    password: "",
                    confirmar: "",
                });
            })
            .catch((error) => {
                if (!vigente) return;
                setForm((anterior) => ({
                    ...anterior,
                    nombre: usuarioActivo.nombre ?? "",
                    correo: usuarioActivo.correo ?? "",
                }));
                setMensaje({
                    tipo: "error",
                    texto: error.message || "No se pudo cargar el perfil.",
                });
            })
            .finally(() => {
                if (vigente) setCargando(false);
            });

        return () => {
            vigente = false;
        };
    }, [usuarioActivo?.run, usuarioActivo?.nombre, usuarioActivo?.correo]);

    if (!usuarioActivo) {
        return (
            <main className="admin-contenido">
                <h1>Perfil</h1>
                <p className="alerta-stock">No hay sesión activa.</p>
            </main>
        );
    }

    const handleChange = (campo) => (evento) => {
        setForm((anterior) => ({ ...anterior, [campo]: evento.target.value }));
    };

    const guardar = async (evento) => {
        evento.preventDefault();
        setMensaje({ tipo: "", texto: "" });

        if (!requerido(form.nombre)) {
            setMensaje({ tipo: "error", texto: "El nombre es requerido." });
            return;
        }
        if (!maxCaracteres(form.nombre, 50)) {
            setMensaje({ tipo: "error", texto: "El nombre no puede superar los 50 caracteres." });
            return;
        }
        if (!requerido(form.apellidos)) {
            setMensaje({ tipo: "error", texto: "Los apellidos son requeridos." });
            return;
        }
        if (!maxCaracteres(form.apellidos, 100)) {
            setMensaje({ tipo: "error", texto: "Los apellidos no pueden superar los 100 caracteres." });
            return;
        }
        if (!requerido(form.correo)) {
            setMensaje({ tipo: "error", texto: "El correo es requerido." });
            return;
        }
        if (!esCorreoValido(form.correo)) {
            setMensaje({
                tipo: "error",
                texto: "El correo debe pertenecer a @duoc.cl, @profesor.duoc.cl o @gmail.com.",
            });
            return;
        }
        if (!requerido(form.direccion)) {
            setMensaje({ tipo: "error", texto: "La dirección es requerida." });
            return;
        }
        if (!maxCaracteres(form.direccion, 300)) {
            setMensaje({ tipo: "error", texto: "La dirección no puede superar los 300 caracteres." });
            return;
        }
        if (form.password !== "") {
            if (form.password.length < 4 || form.password.length > 10) {
                setMensaje({ tipo: "error", texto: "La contraseña debe tener entre 4 y 10 caracteres." });
                return;
            }
            if (form.password !== form.confirmar) {
                setMensaje({ tipo: "error", texto: "Las contraseñas no coinciden." });
                return;
            }
        }

        const datos = {
            nombre: form.nombre.trim(),
            apellidos: form.apellidos.trim(),
            correo: form.correo.trim(),
            direccion: form.direccion.trim(),
        };
        if (form.password !== "") {
            datos.password = form.password;
        }

        setGuardando(true);
        try {
            await actualizarPerfil(datos);
            setMensaje({ tipo: "ok", texto: "Perfil actualizado correctamente." });
            setForm((anterior) => ({ ...anterior, password: "", confirmar: "" }));
        } catch (error) {
            setMensaje({
                tipo: "error",
                texto: error.message || "No se pudo actualizar el perfil.",
            });
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) {
        return (
            <main className="admin-contenido">
                <h1>Perfil</h1>
                <Loader mensaje="Cargando perfil..." />
            </main>
        );
    }

    return (
        <main className="admin-contenido">
            <h1>Perfil</h1>
            <p className="admin-saludo">
                {usuarioActivo.tipoUsuario ?? "Usuario"}: {usuarioActivo.nombre} ({usuarioActivo.correo})
            </p>

            <section className="seccion-formulario">
                <form onSubmit={guardar} noValidate>
                    <div className="form-admin">
                        <div className="campo-form">
                            <label htmlFor="run-perfil">RUN</label>
                            <input type="text" id="run-perfil" value={usuarioActivo.run ?? ""} disabled />
                        </div>

                        <div className="campo-form">
                            <label htmlFor="correo-perfil">Correo</label>
                            <input
                                type="email"
                                id="correo-perfil"
                                value={form.correo}
                                disabled
                            />
                        </div>

                        <div className="campo-form">
                            <label htmlFor="nombre-perfil">Nombre</label>
                            <input
                                type="text"
                                id="nombre-perfil"
                                maxLength="50"
                                value={form.nombre}
                                onChange={handleChange("nombre")}
                            />
                        </div>

                        <div className="campo-form">
                            <label htmlFor="apellidos-perfil">Apellidos</label>
                            <input
                                type="text"
                                id="apellidos-perfil"
                                maxLength="100"
                                value={form.apellidos}
                                onChange={handleChange("apellidos")}
                            />
                        </div>

                        <div className="campo-form">
                            <label htmlFor="direccion-perfil">Dirección</label>
                            <input
                                type="text"
                                id="direccion-perfil"
                                maxLength="300"
                                value={form.direccion}
                                onChange={handleChange("direccion")}
                            />
                        </div>

                        <div className="campo-form">
                            <label htmlFor="password-perfil">Nueva contraseña (opcional)</label>
                            <input
                                type="password"
                                id="password-perfil"
                                maxLength="10"
                                value={form.password}
                                onChange={handleChange("password")}
                            />
                        </div>

                        <div className="campo-form">
                            <label htmlFor="confirmar-perfil">Confirmar contraseña</label>
                            <input
                                type="password"
                                id="confirmar-perfil"
                                maxLength="10"
                                value={form.confirmar}
                                onChange={handleChange("confirmar")}
                            />
                        </div>

                        {mensaje.texto && (
                            <p className={`mensaje-perfil ${mensaje.tipo}`}>{mensaje.texto}</p>
                        )}

                        <div className="botones-form">
                            <button type="submit" className="btn-admin btn-guardar" disabled={guardando}>
                                {guardando ? "Guardando..." : "Guardar cambios"}
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </main>
    );
}
