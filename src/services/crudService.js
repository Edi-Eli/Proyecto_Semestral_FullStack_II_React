import {
    PRODUCTOS_SEMILLA,
    USUARIOS_SEMILLA,
    CATEGORIAS_SEMILLA,
    ORDENES_SEMILLA
} from "../js/semillas";

const CLAVES = {
    productos: "productosAdmin",
    usuarios: "usuariosAdmin",
    categorias: "categoriasAdmin",
    ordenes: "ordenesAdmin",
    sesion: "sesionAdmin"
};

export function formatearPrecioCLP(precio) {
    return "$" + Number(precio).toLocaleString("es-CL");
}

function clonar(lista) {
    return lista.map((item) => ({ ...item }));
}

function leerLista(clave, semilla) {
    const guardados = localStorage.getItem(clave);
    if (guardados === null) {
        localStorage.setItem(clave, JSON.stringify(semilla));
        return clonar(semilla);
    }
    return JSON.parse(guardados);
}

function guardarLista(clave, lista) {
    localStorage.setItem(clave, JSON.stringify(lista));
    return lista;
}

function calcularTotales(orden) {
    const subtotal = orden.items.reduce((acc, item) => acc + item.cantidad * item.precio, 0);
    const iva = Math.round(subtotal * 0.19);
    return { subtotal, iva, total: subtotal + iva };
}

export const crudService = {
    listProductos() {
        return leerLista(CLAVES.productos, PRODUCTOS_SEMILLA);
    },
    createProducto(producto) {
        const lista = this.listProductos();
        lista.push(producto);
        return guardarLista(CLAVES.productos, lista);
    },
    updateProducto(indice, producto) {
        const lista = this.listProductos();
        lista[indice] = producto;
        return guardarLista(CLAVES.productos, lista);
    },
    deleteProducto(indice) {
        const lista = this.listProductos();
        lista.splice(indice, 1);
        return guardarLista(CLAVES.productos, lista);
    },

    listUsuarios() {
        return leerLista(CLAVES.usuarios, USUARIOS_SEMILLA);
    },
    createUsuario(usuario) {
        const lista = this.listUsuarios();
        lista.push(usuario);
        return guardarLista(CLAVES.usuarios, lista);
    },
    updateUsuario(indice, usuario) {
        const lista = this.listUsuarios();
        lista[indice] = usuario;
        return guardarLista(CLAVES.usuarios, lista);
    },
    deleteUsuario(indice) {
        const lista = this.listUsuarios();
        lista.splice(indice, 1);
        return guardarLista(CLAVES.usuarios, lista);
    },

    listCategorias() {
        return leerLista(CLAVES.categorias, CATEGORIAS_SEMILLA);
    },
    createCategoria(categoria) {
        const lista = this.listCategorias();
        const nuevoId = lista.length ? Math.max(...lista.map((c) => c.id)) + 1 : 1;
        lista.push({ id: nuevoId, ...categoria });
        return guardarLista(CLAVES.categorias, lista);
    },
    updateCategoria(id, categoria) {
        const lista = this.listCategorias();
        const indice = lista.findIndex((c) => c.id === id);
        if (indice !== -1) {
            lista[indice] = { ...lista[indice], ...categoria };
        }
        return guardarLista(CLAVES.categorias, lista);
    },
    deleteCategoria(id) {
        const lista = this.listCategorias().filter((c) => c.id !== id);
        return guardarLista(CLAVES.categorias, lista);
    },

    listOrdenes() {
        return leerLista(CLAVES.ordenes, ORDENES_SEMILLA);
    },
    listOrdenesPorCliente(run) {
        return this.listOrdenes().filter((orden) => orden.runCliente === run);
    },
    calcularTotales(orden) {
        return calcularTotales(orden);
    },

    getSesion() {
        const guardada = localStorage.getItem(CLAVES.sesion);
        if (guardada !== null) {
            return JSON.parse(guardada);
        }
        const admin = this.listUsuarios().find((u) => u.tipoUsuario === "Administrador") || null;
        if (admin === null) {
            return null;
        }
        const sesion = { ...admin, password: "admin123" };
        localStorage.setItem(CLAVES.sesion, JSON.stringify(sesion));
        return sesion;
    },
    actualizarPerfil(datos) {
        const sesion = this.getSesion();
        if (sesion === null) {
            return null;
        }
        const actualizada = { ...sesion, ...datos };
        localStorage.setItem(CLAVES.sesion, JSON.stringify(actualizada));

        const usuarios = this.listUsuarios();
        const indice = usuarios.findIndex((u) => u.run === actualizada.run);
        if (indice !== -1) {
            usuarios[indice] = {
                ...usuarios[indice],
                nombre: actualizada.nombre,
                direccion: actualizada.direccion
            };
            guardarLista(CLAVES.usuarios, usuarios);
        }
        return actualizada;
    },
    cerrarSesion() {
        localStorage.removeItem(CLAVES.sesion);
    }
};