import { useState } from "react";
import {
    getCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    getProductos,
} from "../data/crudService";
import { requerido, maxCaracteres } from "../utils/validaciones";

const FORM_VACIO = { nombre: "", imagen: "" };

function validarCategoria(campo, valor) {
    const v = String(valor).trim();
    if (campo === "nombre") {
        if (!requerido(v)) return "El nombre de la categoría es requerido.";
        if (!maxCaracteres(v, 50)) return "El nombre no puede superar los 50 caracteres.";
        return "";
    }
    if (campo === "imagen") {
        if (v !== "" && !maxCaracteres(v, 200)) return "La ruta de imagen es muy larga.";
        return "";
    }
    return "";
}

export default function AdminCategorias() {
    const [categorias, setCategorias] = useState(() => getCategorias());
    const [form, setForm] = useState(FORM_VACIO);
    const [idEditar, setIdEditar] = useState(null);
    const [errores, setErrores] = useState({});
    const [tocado, setTocado] = useState({});
    const [enviado, setEnviado] = useState(false);

    const mostrarError = (campo) =>
        (tocado[campo] || enviado) && errores[campo] ? errores[campo] : "";

    const handleChange = (campo) => (evento) => {
        const valor = evento.target.value;
        setForm((anterior) => ({ ...anterior, [campo]: valor }));
        setErrores((anterior) => ({ ...anterior, [campo]: validarCategoria(campo, valor) }));
    };

    const handleBlur = (campo) => () => setTocado((anterior) => ({ ...anterior, [campo]: true }));

    const limpiarFormulario = () => {
        setForm(FORM_VACIO);
        setIdEditar(null);
        setErrores({});
        setTocado({});
        setEnviado(false);
    };

    const editarCategoria = (categoria) => {
        setForm({ nombre: categoria.nombre, imagen: categoria.imagen || "" });
        setIdEditar(categoria.id);
        setErrores({});
        setTocado({});
        setEnviado(false);
    };

    const eliminarCategoria = (categoria) => {
        const enUso = getProductos().some((p) => Number(p.categoriaId) === Number(categoria.id));
        const mensaje = enUso
            ? `La categoría ${categoria.nombre} está en uso por productos. ¿Deseas eliminarla igual?`
            : `¿Deseas eliminar la categoría ${categoria.nombre}?`;
        if (!window.confirm(mensaje)) return;
        deleteCategoria(categoria.id);
        setCategorias(getCategorias());
    };

    const guardarCategoria = (evento) => {
        evento.preventDefault();
        setEnviado(true);

        const nuevosErrores = {
            nombre: validarCategoria("nombre", form.nombre),
            imagen: validarCategoria("imagen", form.imagen),
        };
        setErrores(nuevosErrores);
        if (Object.values(nuevosErrores).some((m) => m !== "")) return;

        const duplicada = categorias.some(
            (c) => c.nombre.toLowerCase() === form.nombre.trim().toLowerCase() && c.id !== idEditar,
        );
        if (duplicada) {
            setErrores((anterior) => ({
                ...anterior,
                nombre: "Ya existe una categoría con ese nombre.",
            }));
            return;
        }

        const datos = { nombre: form.nombre.trim(), imagen: form.imagen.trim() };
        if (idEditar !== null) {
            updateCategoria(idEditar, datos);
        } else {
            createCategoria(datos);
        }
        setCategorias(getCategorias());
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
                            <th>Imagen</th>
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
                                    <td>{categoria.imagen}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn-admin btn-editar"
                                            onClick={() => editarCategoria(categoria)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-admin btn-eliminar"
                                            onClick={() => eliminarCategoria(categoria)}
                                        >
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
                            <label htmlFor="imagen-categoria">Imagen (opcional)</label>
                            <input
                                type="text"
                                id="imagen-categoria"
                                maxLength="200"
                                placeholder="/assets/images/..."
                                value={form.imagen}
                                onChange={handleChange("imagen")}
                                onBlur={handleBlur("imagen")}
                                className={mostrarError("imagen") ? "input-error" : ""}
                            />
                            <p className="mensaje-error">{mostrarError("imagen")}</p>
                        </div>

                        <div className="botones-form">
                            <button type="submit" className="btn-admin btn-guardar">
                                Guardar categoría
                            </button>
                            <button
                                type="button"
                                className="btn-admin btn-limpiar"
                                onClick={limpiarFormulario}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </main>
    );
}