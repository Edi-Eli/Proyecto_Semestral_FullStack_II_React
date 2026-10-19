import { useState } from "react";
import { crudService } from "../services/crudService";
import { requerido, maxCaracteres } from "../js/validaciones";

export default function AdminPerfil() {
    const [sesion, setSesion] = useState(() => crudService.getSesion());
    const [form, setForm] = useState(() => {
        const actual = crudService.getSesion();
        return {
            nombre: actual ? actual.nombre : "",
            direccion: actual ? actual.direccion : "",
            password: actual && actual.password ? actual.password : "",
            confirmar: actual && actual.password ? actual.password : ""
        };
    });
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

    if (sesion === null) {
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
            setMensaje({ tipo: "error", texto: "La direccion es requerida." });
            return;
        }
        if (!maxCaracteres(form.direccion, 300)) {
            setMensaje({ tipo: "error", texto: "La direccion no puede superar los 300 caracteres." });
            return;
        }
        if (form.password.length < 6) {
            setMensaje({ tipo: "error", texto: "La contraseña debe tener al menos 6 caracteres." });
            return;
        }
        if (form.password !== form.confirmar) {
            setMensaje({ tipo: "error", texto: "Las contraseñas no coinciden." });
            return;
        }

        const actualizada = crudService.actualizarPerfil({
            nombre: form.nombre.trim(),
            direccion: form.direccion.trim(),
            password: form.password
        });
        setSesion(actualizada);
        setMensaje({ tipo: "ok", texto: "Perfil actualizado correctamente." });
    };

    return (
        <main className="admin-contenido">
            <h1>Perfil</h1>
            <p className="admin-saludo">
                Administrador: {sesion.nombre} — {sesion.correo}
            </p>

            <section className="seccion-formulario">
                <form onSubmit={guardar} noValidate>
                    <div className="form-admin">
                        <div className="campo-form">
                            <label htmlFor="run-perfil">Run</label>
                            <input type="text" id="run-perfil" value={sesion.run} disabled />
                            <p className="mensaje-error"></p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="correo-perfil">Correo</label>
                            <input type="email" id="correo-perfil" value={sesion.correo} disabled />
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
                            <label htmlFor="direccion-perfil">Direccion</label>
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