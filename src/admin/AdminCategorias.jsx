import { useState } from "react";
import { crudService } from "../services/crudService";
import { requerido, maxCaracteres } from "../js/validaciones";

const FORM_VACIO = { nombre: "", descripcion: "" };

function validarCategoria(campo, valor) {
    const v = String(valor).trim();
    if (campo === "nombre") {
        if (!requerido(v)) return "El nombre de la categoria es requerido.";
        if (!maxCaracteres(v, 50)) return "El nombre no puede superar los 50 caracteres.";
        return "";
    }
    if (campo === "descripcion") {
        if (v !== "" && !maxCaracteres(v, 200)) return "La descripcion no puede superar los 200 caracteres.";
        return "";
    }
    return "";
}

export default function AdminCategorias() {
    const [categorias, setCategorias] = useState(() => crudService.listCategorias());
    const [form, setForm] = useState(FORM_VACIO);
    const [idEditar, setIdEditar] = useState(null);
    const [errores, setErrores] = useState({});
    const [tocado, setTocado] = useState({});
    const [enviado, setEnviado] = useState(false);

    const mostrarError = (campo) => ((tocado[campo] || enviado) && errores[campo] ? errores[campo] : "");

    const handleChange = (campo) => (evento) => {
        const valor = evento.target.value;
        setForm((anterior) => ({ ...anterior, [campo]: valor }));
        setErrores((anterior) => ({ ...anterior, [campo]: validarCategoria(campo, valor) }));
    };

    const handleBlur = (campo) => () => {
        setTocado((anterior) => ({ ...anterior, [campo]: true }));
    };

    const limpiarFormulario = () => {
        setForm(FORM_VACIO);
        setIdEditar(null);
        setErrores({});
        setTocado({});
        setEnviado(false);
    };

    const editarCategoria = (categoria) => {
        setForm({ nombre: categoria.nombre, descripcion: categoria.descripcion });
        setIdEditar(categoria.id);
        setErrores({});
        setTocado({});
        setEnviado(false);
    };

    const eliminarCategoria = (categoria) => {
        const enUso = crudService.listProductos().some((p) => p.categoria === categoria.nombre);
        const mensaje = enUso
            ? `La categoria ${categoria.nombre} esta en uso por productos. Desea eliminarla igual?`
            : `Desea eliminar la categoria ${categoria.nombre}?`;
        if (!window.confirm(mensaje)) return;
        crudService.deleteCategoria(categoria.id);
        setCategorias(crudService.listCategorias());
    };

    const guardarCategoria = (evento) => {
        evento.preventDefault();
        setEnviado(true);

        const nuevosErrores = {
            nombre: validarCategoria("nombre", form.nombre),
            descripcion: validarCategoria("descripcion", form.descripcion)
        };
        setErrores(nuevosErrores);
        if (Object.values(nuevosErrores).some((m) => m !== "")) return;

        const duplicada = categorias.some(
            (c) => c.nombre.toLowerCase() === form.nombre.trim().toLowerCase() && c.id !== idEditar
        );
        if (duplicada) {
            setErrores((anterior) => ({ ...anterior, nombre: "Ya existe una categoria con ese nombre." }));
            return;
        }

        const datos = { nombre: form.nombre.trim(), descripcion: form.descripcion.trim() };
        if (idEditar !== null) {
            crudService.updateCategoria(idEditar, datos);
        } else {
            crudService.createCategoria(datos);
        }
        setCategorias(crudService.listCategorias());
        limpiarFormulario();
    };

    return (
        <main className="admin-contenido">
            <h1>Mantenedor de Categorías</h1>

            <section className="seccion-tabla">
                <h2>Listado de categorías</h2>
                <table className="tabla-admin">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categorias.length === 0 ? (
                            <tr>
                                <td colSpan="4">No hay categorías registradas.</td>
                            </tr>
                        ) : (
                            categorias.map((categoria) => (
                                <tr key={categoria.id}>
                                    <td>{categoria.id}</td>
                                    <td>{categoria.nombre}</td>
                                    <td>{categoria.descripcion}</td>
                                    <td>
                                        <button type="button" className="btn-admin btn-editar" onClick={() => editarCategoria(categoria)}>
                                            Editar
                                        </button>
                                        <button type="button" className="btn-admin btn-eliminar" onClick={() => eliminarCategoria(categoria)}>
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </section>

            <section className="seccion-formulario">
                <h2>{idEditar === null ? "Nueva Categoría" : "Editar Categoría"}</h2>

                <form onSubmit={guardarCategoria} noValidate>
                    <div className="form-admin">
                        <div className="campo-form">
                            <label htmlFor="nombre-categoria">Nombre</label>
                            <input
                                type="text"
                                id="nombre-categoria"
                                maxLength="50"
                                value={form.nombre}
                                onChange={handleChange("nombre")}
                                onBlur={handleBlur("nombre")}
                                className={mostrarError("nombre") ? "input-error" : ""}
                            />
                            <p className="mensaje-error">{mostrarError("nombre")}</p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="descripcion-categoria">Descripción (opcional)</label>
                            <input
                                type="text"
                                id="descripcion-categoria"
                                maxLength="200"
                                value={form.descripcion}
                                onChange={handleChange("descripcion")}
                                onBlur={handleBlur("descripcion")}
                                className={mostrarError("descripcion") ? "input-error" : ""}
                            />
                            <p className="mensaje-error">{mostrarError("descripcion")}</p>
                        </div>

                        <div className="botones-form">
                            <button type="submit" className="btn-admin btn-guardar">
                                Guardar categoría
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