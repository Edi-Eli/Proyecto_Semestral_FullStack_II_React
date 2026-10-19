import { useState } from "react";
import { useAuth } from "../context/authContext";
import { requerido, maxCaracteres } from "../utils/validaciones";

export default function AdminPerfil() {
    const { usuarioActivo, actualizarPerfil } = useAuth();
    const [form, setForm] = useState(usuarioActivo ? {
        nombre: usuarioActivo.nombre,
        direccion: usuarioActivo.direccion || "",
        password: "",
        confirmar: "",
    } : { nombre: "", direccion: "", password: "", confirmar: "" });
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

    if (!usuarioActivo) {
        return (
            <main className="admin-contenido">
                <h1>Perfil</h1>
                <p className="alerta-stock">No hay sesión activa. Inicie sesión para ver su perfil.</p>
            </main>
        );
    }

    const handleChange = (campo) => (evento) => {
        setForm((anterior) => ({ ...anterior, [campo]: evento.target.value }));
    };

    const guardar = (evento) => {
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
        if (!requerido(form.direccion)) {
            setMensaje({ tipo: "error", texto: "La dirección es requerida." });
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

        actualizarPerfil({
            nombre: form.nombre.trim(),
            direccion: form.direccion.trim(),
            password: form.password,
        });
        setMensaje({ tipo: "ok", texto: "Perfil actualizado correctamente." });
        setForm((anterior) => ({ ...anterior, password: "", confirmar: "" }));
    };

    return (
        <main className="admin-contenido">
            <h1>Perfil</h1>
            <p className="admin-saludo">
                Administrador: {usuarioActivo.nombre} — {usuarioActivo.correo}
            </p>

            <section className="seccion-formulario">
                <form onSubmit={guardar} noValidate>
                    <div className="form-admin">
                        <div className="campo-form">
                            <label htmlFor="run-perfil">RUN</label>
                            <input type="text" id="run-perfil" value={usuarioActivo.run} disabled />
                            <p className="mensaje-error"></p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="correo-perfil">Correo</label>
                            <input type="email" id="correo-perfil" value={usuarioActivo.correo} disabled />
                            <p className="mensaje-error"></p>
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
                            <p className="mensaje-error"></p>
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
                            <p className="mensaje-error"></p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="password-perfil">Nueva contraseña</label>
                            <input
                                type="password"
                                id="password-perfil"
                                value={form.password}
                                onChange={handleChange("password")}
                            />
                            <p className="mensaje-error"></p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="confirmar-perfil">Confirmar contraseña</label>
                            <input
                                type="password"
                                id="confirmar-perfil"
                                value={form.confirmar}
                                onChange={handleChange("confirmar")}
                            />
                            <p className="mensaje-error"></p>
                        </div>

                        {mensaje.texto !== "" && (
                            <p className={`mensaje-perfil ${mensaje.tipo}`}>{mensaje.texto}</p>
                        )}

                        <div className="botones-form">
                            <button type="submit" className="btn-admin btn-guardar">
                                Guardar cambios
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </main>
    );
}