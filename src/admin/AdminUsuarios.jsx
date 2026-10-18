import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { TIPOS_USUARIO } from "../js/semillas";
import { REGIONES, getComunasPorNombre } from "../js/regiones";
import { crudService } from "../services/crudService";
import { requerido, maxCaracteres, minLength, esCorreoValido, validarRun } from "../js/validaciones";

const FORM_VACIO = {
    run: "",
    nombre: "",
    apellidos: "",
    correo: "",
    fechaNacimiento: "",
    tipoUsuario: "",
    region: "",
    comuna: "",
    direccion: ""
};

function validarCampo(campo, valor) {
    const v = String(valor).trim();
    switch (campo) {
        case "run":
            if (!requerido(v)) return "El run es requerido.";
            if (!minLength(v, 7) || !maxCaracteres(v, 9)) return "El run debe tener entre 7 y 9 caracteres.";
            if (!validarRun(v)) return "El run no es valido, revise el digito verificador.";
            return "";
        case "nombre":
            if (!requerido(v)) return "El nombre es requerido.";
            if (!maxCaracteres(v, 50)) return "El nombre no puede superar los 50 caracteres.";
            return "";
        case "apellidos":
            if (!requerido(v)) return "Los apellidos son requeridos.";
            if (!maxCaracteres(v, 100)) return "Los apellidos no pueden superar los 100 caracteres.";
            return "";
        case "correo":
            if (!requerido(v)) return "El correo es requerido.";
            if (!maxCaracteres(v, 100)) return "El correo no puede superar los 100 caracteres.";
            if (!esCorreoValido(v)) return "Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.";
            return "";
        case "tipoUsuario":
            if (!requerido(v)) return "Debe seleccionar un tipo de usuario.";
            return "";
        case "region":
            if (!requerido(v)) return "Debe seleccionar una region.";
            return "";
        case "comuna":
            if (!requerido(v)) return "Debe seleccionar una comuna.";
            return "";
        case "direccion":
            if (!requerido(v)) return "La direccion es requerida.";
            if (!maxCaracteres(v, 300)) return "La direccion no puede superar los 300 caracteres.";
            return "";
        default:
            return "";
    }
}

export default function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState(() => crudService.listUsuarios());
    const [form, setForm] = useState(FORM_VACIO);
    const [indiceEditar, setIndiceEditar] = useState(null);
    const [errores, setErrores] = useState({});
    const [tocado, setTocado] = useState({});
    const [enviado, setEnviado] = useState(false);

    const comunas = useMemo(() => getComunasPorNombre(form.region), [form.region]);

    const mostrarError = (campo) => ((tocado[campo] || enviado) && errores[campo] ? errores[campo] : "");

    const handleChange = (campo) => (evento) => {
        const valor = evento.target.value;
        if (campo === "region") {
            setForm((anterior) => ({ ...anterior, region: valor, comuna: "" }));
            setErrores((anterior) => ({
                ...anterior,
                region: validarCampo("region", valor),
                comuna: ""
            }));
            return;
        }
        setForm((anterior) => ({ ...anterior, [campo]: valor }));
        setErrores((anterior) => ({ ...anterior, [campo]: validarCampo(campo, valor) }));
    };

    const handleBlur = (campo) => () => {
        setTocado((anterior) => ({ ...anterior, [campo]: true }));
    };

    const limpiarFormulario = () => {
        setForm(FORM_VACIO);
        setIndiceEditar(null);
        setErrores({});
        setTocado({});
        setEnviado(false);
    };

    const editarUsuario = (indice) => {
        const usuario = usuarios[indice];
        setForm({
            run: usuario.run,
            nombre: usuario.nombre,
            apellidos: usuario.apellidos,
            correo: usuario.correo,
            fechaNacimiento: usuario.fechaNacimiento,
            tipoUsuario: usuario.tipoUsuario,
            region: usuario.region,
            comuna: usuario.comuna,
            direccion: usuario.direccion
        });
        setIndiceEditar(indice);
        setErrores({});
        setTocado({});
        setEnviado(false);
    };

    const eliminarUsuario = (indice) => {
        const usuario = usuarios[indice];
        if (!window.confirm(`Desea eliminar al usuario ${usuario.nombre} ${usuario.apellidos}?`)) return;
        crudService.deleteUsuario(indice);
        setUsuarios(crudService.listUsuarios());
    };

    const guardarUsuario = (evento) => {
        evento.preventDefault();
        setEnviado(true);

        const nuevosErrores = {};
        Object.keys(FORM_VACIO).forEach((campo) => {
            if (campo === "fechaNacimiento") return;
            nuevosErrores[campo] = validarCampo(campo, form[campo]);
        });
        setErrores(nuevosErrores);

        if (Object.values(nuevosErrores).some((m) => m !== "")) return;

        const usuario = {
            run: form.run.trim(),
            nombre: form.nombre.trim(),
            apellidos: form.apellidos.trim(),
            correo: form.correo.trim(),
            fechaNacimiento: form.fechaNacimiento,
            tipoUsuario: form.tipoUsuario,
            region: form.region,
            comuna: form.comuna,
            direccion: form.direccion.trim()
        };

        if (indiceEditar !== null) {
            crudService.updateUsuario(indiceEditar, usuario);
        } else {
            crudService.createUsuario(usuario);
        }
        setUsuarios(crudService.listUsuarios());
        limpiarFormulario();
    };

    return (
        <main className="admin-contenido">
            <h1>Mantenedor de Usuarios</h1>

            <section className="seccion-tabla">
                <h2>Listado de usuarios</h2>
                <table className="tabla-admin">
                    <thead>
                        <tr>
                            <th>Run</th>
                            <th>Nombre</th>
                            <th>Apellidos</th>
                            <th>Correo</th>
                            <th>Tipo de usuario</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.length === 0 ? (
                            <tr>
                                <td colSpan="6">No hay usuarios registrados.</td>
                            </tr>
                        ) : (
                            usuarios.map((usuario, indice) => (
                                <tr key={usuario.run + indice}>
                                    <td>{usuario.run}</td>
                                    <td>{usuario.nombre}</td>
                                    <td>{usuario.apellidos}</td>
                                    <td>{usuario.correo}</td>
                                    <td>{usuario.tipoUsuario}</td>
                                    <td>
                                        <button type="button" className="btn-admin btn-editar" onClick={() => editarUsuario(indice)}>
                                            Editar
                                        </button>
                                        <button type="button" className="btn-admin btn-eliminar" onClick={() => eliminarUsuario(indice)}>
                                            Eliminar
                                        </button>
                                        <Link
                                            className="btn-admin btn-editar"
                                            to={`/admin/usuarios/${usuario.run}/historial`}
                                        >
                                            Historial de Compras
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </section>

            <section className="seccion-formulario">
                <h2>{indiceEditar === null ? "Nuevo usuario" : "Editar usuario"}</h2>

                <form onSubmit={guardarUsuario} noValidate>
                    <div className="form-admin">
                        <div className="campo-form">
                            <label htmlFor="run-usuario">Run</label>
                            <input
                                type="text"
                                id="run-usuario"
                                placeholder="sin puntos ni guion, ej: 190110222"
                                value={form.run}
                                onChange={handleChange("run")}
                                onBlur={handleBlur("run")}
                                className={mostrarError("run") ? "input-error" : ""}
                            />
                            <p className="mensaje-error">{mostrarError("run")}</p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="nombre-usuario">Nombre</label>
                            <input
                                type="text"
                                id="nombre-usuario"
                                maxLength="50"
                                value={form.nombre}
                                onChange={handleChange("nombre")}
                                onBlur={handleBlur("nombre")}
                                className={mostrarError("nombre") ? "input-error" : ""}
                            />
                            <p className="mensaje-error">{mostrarError("nombre")}</p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="apellidos-usuario">Apellidos</label>
                            <input
                                type="text"
                                id="apellidos-usuario"
                                maxLength="100"
                                value={form.apellidos}
                                onChange={handleChange("apellidos")}
                                onBlur={handleBlur("apellidos")}
                                className={mostrarError("apellidos") ? "input-error" : ""}
                            />
                            <p className="mensaje-error">{mostrarError("apellidos")}</p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="correo-usuario">Correo</label>
                            <input
                                type="email"
                                id="correo-usuario"
                                maxLength="100"
                                placeholder="usuario@duoc.cl"
                                value={form.correo}
                                onChange={handleChange("correo")}
                                onBlur={handleBlur("correo")}
                                className={mostrarError("correo") ? "input-error" : ""}
                            />
                            <p className="mensaje-error">{mostrarError("correo")}</p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="fecha-nacimiento-usuario">Fecha de nacimiento (opcional)</label>
                            <input
                                type="date"
                                id="fecha-nacimiento-usuario"
                                value={form.fechaNacimiento}
                                onChange={handleChange("fechaNacimiento")}
                            />
                            <p className="mensaje-error"></p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="tipo-usuario">Tipo de usuario</label>
                            <select
                                id="tipo-usuario"
                                value={form.tipoUsuario}
                                onChange={handleChange("tipoUsuario")}
                                onBlur={handleBlur("tipoUsuario")}
                                className={mostrarError("tipoUsuario") ? "input-error" : ""}
                            >
                                <option value="">Seleccione un tipo de usuario</option>
                                {TIPOS_USUARIO.map((tipo) => (
                                    <option key={tipo} value={tipo}>
                                        {tipo}
                                    </option>
                                ))}
                            </select>
                            <p className="mensaje-error">{mostrarError("tipoUsuario")}</p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="region-usuario">Region</label>
                            <select
                                id="region-usuario"
                                value={form.region}
                                onChange={handleChange("region")}
                                onBlur={handleBlur("region")}
                                className={mostrarError("region") ? "input-error" : ""}
                            >
                                <option value="">Seleccione una region</option>
                                {REGIONES.map((region) => (
                                    <option key={region.id} value={region.nombre}>
                                        {region.nombre}
                                    </option>
                                ))}
                            </select>
                            <p className="mensaje-error">{mostrarError("region")}</p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="comuna-usuario">Comuna</label>
                            <select
                                id="comuna-usuario"
                                value={form.comuna}
                                onChange={handleChange("comuna")}
                                onBlur={handleBlur("comuna")}
                                disabled={form.region === ""}
                                className={mostrarError("comuna") ? "input-error" : ""}
                            >
                                <option value="">
                                    {form.region === "" ? "Seleccione una region primero" : "Seleccione una comuna"}
                                </option>
                                {comunas.map((comuna) => (
                                    <option key={comuna} value={comuna}>
                                        {comuna}
                                    </option>
                                ))}
                            </select>
                            <p className="mensaje-error">{mostrarError("comuna")}</p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="direccion-usuario">Direccion</label>
                            <input
                                type="text"
                                id="direccion-usuario"
                                maxLength="300"
                                value={form.direccion}
                                onChange={handleChange("direccion")}
                                onBlur={handleBlur("direccion")}
                                className={mostrarError("direccion") ? "input-error" : ""}
                            />
                            <p className="mensaje-error">{mostrarError("direccion")}</p>
                        </div>

                        <div className="botones-form">
                            <button type="submit" className="btn-admin btn-guardar">
                                Guardar usuario
                            </button>
                            <button type="button" className="btn-admin btn-limpiar" onClick={limpiarFormulario}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </main>
    );
}