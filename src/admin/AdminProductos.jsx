import { useState } from "react";
import { Link } from "react-router-dom";
import { crudService, formatearPrecioCLP } from "../services/crudService";
import {
    requerido,
    maxCaracteres,
    minLength,
    soloEnteros,
    soloDecimales,
    minimoValor
} from "../js/validaciones";

const FORM_VACIO = {
    codigo: "",
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    stockCritico: "",
    categoria: "",
    imagen: ""
};

function validarCampo(campo, valor) {
    const v = String(valor).trim();
    switch (campo) {
        case "codigo":
            if (!requerido(v)) return "El codigo es requerido.";
            if (!minLength(v, 3)) return "El codigo debe tener al menos 3 caracteres.";
            return "";
        case "nombre":
            if (!requerido(v)) return "El nombre es requerido.";
            if (!maxCaracteres(v, 100)) return "El nombre no puede superar los 100 caracteres.";
            return "";
        case "descripcion":
            if (v !== "" && !maxCaracteres(v, 500)) return "La descripcion no puede superar los 500 caracteres.";
            return "";
        case "precio":
            if (!requerido(v)) return "El precio es requerido.";
            if (!soloDecimales(v)) return "El precio debe ser un numero valido.";
            if (!minimoValor(v, 0)) return "El precio minimo es 0 (producto FREE).";
            return "";
        case "stock":
            if (!requerido(v)) return "El stock es requerido.";
            if (!soloEnteros(v)) return "El stock debe ser un numero entero.";
            if (!minimoValor(v, 0)) return "El stock minimo es 0.";
            return "";
        case "stockCritico":
            if (v !== "" && !soloEnteros(v)) return "El stock critico debe ser un numero entero.";
            if (v !== "" && !minimoValor(v, 0)) return "El stock critico minimo es 0.";
            return "";
        case "categoria":
            if (!requerido(v)) return "Debe seleccionar una categoria.";
            return "";
        default:
            return "";
    }
}

export default function AdminProductos() {
    const [productos, setProductos] = useState(() => crudService.listProductos());
    const [categorias] = useState(() => crudService.listCategorias());
    const [form, setForm] = useState(FORM_VACIO);
    const [indiceEditar, setIndiceEditar] = useState(null);
    const [errores, setErrores] = useState({});
    const [tocado, setTocado] = useState({});
    const [enviado, setEnviado] = useState(false);

    const mostrarError = (campo) => ((tocado[campo] || enviado) && errores[campo] ? errores[campo] : "");

    const handleChange = (campo) => (evento) => {
        const valor = evento.target.value;
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

    const editarProducto = (indice) => {
        const producto = productos[indice];
        setForm({
            codigo: producto.codigo,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: String(producto.precio),
            stock: String(producto.stock),
            stockCritico: String(producto.stockCritico),
            categoria: producto.categoria,
            imagen: producto.imagen
        });
        setIndiceEditar(indice);
        setErrores({});
        setTocado({});
        setEnviado(false);
    };

    const eliminarProducto = (indice) => {
        if (!window.confirm(`Desea eliminar el producto ${productos[indice].nombre}?`)) return;
        crudService.deleteProducto(indice);
        setProductos(crudService.listProductos());
    };

    const guardarProducto = (evento) => {
        evento.preventDefault();
        setEnviado(true);

        const nuevosErrores = {};
        Object.keys(FORM_VACIO).forEach((campo) => {
            if (campo === "imagen") return;
            nuevosErrores[campo] = validarCampo(campo, form[campo]);
        });
        setErrores(nuevosErrores);

        if (Object.values(nuevosErrores).some((m) => m !== "")) return;

        const producto = {
            codigo: form.codigo.trim(),
            nombre: form.nombre.trim(),
            descripcion: form.descripcion.trim(),
            precio: Number(form.precio.replace(",", ".")),
            stock: Number(form.stock),
            stockCritico: form.stockCritico.trim() === "" ? 0 : Number(form.stockCritico),
            categoria: form.categoria,
            imagen: form.imagen.trim()
        };

        if (indiceEditar !== null) {
            crudService.updateProducto(indiceEditar, producto);
        } else {
            crudService.createProducto(producto);
        }
        setProductos(crudService.listProductos());

        if (producto.stock <= producto.stockCritico) {
            window.alert(`El producto ${producto.nombre} tiene stock bajo o critico (${producto.stock} unidades).`);
        }
        limpiarFormulario();
    };

    return (
        <main className="admin-contenido">
            <h1>Mantenedor de Productos</h1>

            <section className="accesos-rapidos">
                <Link to="/admin/productos/criticos">Productos Críticos</Link>
                <Link to="/admin/reportes">Reportes</Link>
            </section>

            <section className="seccion-tabla">
                <h2>Listado de productos</h2>
                <table className="tabla-admin">
                    <thead>
                        <tr>
                            <th>Codigo</th>
                            <th>Nombre</th>
                            <th>Categoria</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Stock critico</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.length === 0 ? (
                            <tr>
                                <td colSpan="7">No hay productos registrados.</td>
                            </tr>
                        ) : (
                            productos.map((producto, indice) => (
                                <tr key={producto.codigo + indice}>
                                    <td>{producto.codigo}</td>
                                    <td>{producto.nombre}</td>
                                    <td>{producto.categoria}</td>
                                    <td>{formatearPrecioCLP(producto.precio)}</td>
                                    <td className={producto.stock <= producto.stockCritico ? "stock-bajo" : ""}>
                                        {producto.stock}
                                    </td>
                                    <td>{producto.stockCritico}</td>
                                    <td>
                                        <button type="button" className="btn-admin btn-editar" onClick={() => editarProducto(indice)}>
                                            Editar
                                        </button>
                                        <button type="button" className="btn-admin btn-eliminar" onClick={() => eliminarProducto(indice)}>
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
                <h2>{indiceEditar === null ? "Nuevo producto" : "Editar producto"}</h2>

                <form onSubmit={guardarProducto} noValidate>
                    <div className="form-admin">
                        <div className="campo-form">
                            <label htmlFor="codigo-producto">Codigo producto</label>
                            <input
                                type="text"
                                id="codigo-producto"
                                value={form.codigo}
                                onChange={handleChange("codigo")}
                                onBlur={handleBlur("codigo")}
                                className={mostrarError("codigo") ? "input-error" : ""}
                            />
                            <p className="mensaje-error">{mostrarError("codigo")}</p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="nombre-producto">Nombre</label>
                            <input
                                type="text"
                                id="nombre-producto"
                                maxLength="100"
                                value={form.nombre}
                                onChange={handleChange("nombre")}
                                onBlur={handleBlur("nombre")}
                                className={mostrarError("nombre") ? "input-error" : ""}
                            />
                            <p className="mensaje-error">{mostrarError("nombre")}</p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="descripcion-producto">Descripcion (opcional)</label>
                            <textarea
                                id="descripcion-producto"
                                rows="3"
                                maxLength="500"
                                value={form.descripcion}
                                onChange={handleChange("descripcion")}
                                onBlur={handleBlur("descripcion")}
                                className={mostrarError("descripcion") ? "input-error" : ""}
                            />
                            <p className="mensaje-error">{mostrarError("descripcion")}</p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="precio-producto">Precio</label>
                            <input
                                type="text"
                                id="precio-producto"
                                inputMode="decimal"
                                placeholder="0"
                                value={form.precio}
                                onChange={handleChange("precio")}
                                onBlur={handleBlur("precio")}
                                className={mostrarError("precio") ? "input-error" : ""}
                            />
                            <p className="mensaje-error">{mostrarError("precio")}</p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="stock-producto">Stock</label>
                            <input
                                type="text"
                                id="stock-producto"
                                inputMode="numeric"
                                placeholder="0"
                                value={form.stock}
                                onChange={handleChange("stock")}
                                onBlur={handleBlur("stock")}
                                className={mostrarError("stock") ? "input-error" : ""}
                            />
                            <p className="mensaje-error">{mostrarError("stock")}</p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="stock-critico-producto">Stock critico (opcional)</label>
                            <input
                                type="text"
                                id="stock-critico-producto"
                                inputMode="numeric"
                                placeholder="0"
                                value={form.stockCritico}
                                onChange={handleChange("stockCritico")}
                                onBlur={handleBlur("stockCritico")}
                                className={mostrarError("stockCritico") ? "input-error" : ""}
                            />
                            <p className="mensaje-error">{mostrarError("stockCritico")}</p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="categoria-producto">Categoria</label>
                            <select
                                id="categoria-producto"
                                value={form.categoria}
                                onChange={handleChange("categoria")}
                                onBlur={handleBlur("categoria")}
                                className={mostrarError("categoria") ? "input-error" : ""}
                            >
                                <option value="">Seleccione una categoria</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria.id} value={categoria.nombre}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </select>
                            <p className="mensaje-error">{mostrarError("categoria")}</p>
                        </div>

                        <div className="campo-form">
                            <label htmlFor="imagen-producto">Imagen (opcional)</label>
                            <input
                                type="text"
                                id="imagen-producto"
                                placeholder="ruta o url de la imagen"
                                value={form.imagen}
                                onChange={handleChange("imagen")}
                            />
                            <p className="mensaje-error"></p>
                        </div>

                        <div className="botones-form">
                            <button type="submit" className="btn-admin btn-guardar">
                                Guardar producto
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