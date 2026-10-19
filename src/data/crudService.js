import {
  productosIniciales,
  categoriasIniciales,
  usuariosIniciales,
  ordenesIniciales,
} from './db.js';

const CLAVES = {
  productos: 'productos',
  categorias: 'categorias',
  usuarios: 'usuarios',
  ordenes: 'ordenes',
};

function leer(clave, semilla) {
  try {
    const guardados = localStorage.getItem(clave);
    if (guardados === null) {
      localStorage.setItem(clave, JSON.stringify(semilla));
      return [...semilla];
    }
    return JSON.parse(guardados);
  } catch {
    return [...semilla];
  }
}

function guardar(clave, lista) {
  localStorage.setItem(clave, JSON.stringify(lista));
}

export function formatearPrecioCLP(precio) {
  return '$' + Number(precio).toLocaleString('es-CL');
}

/* ================= PRODUCTOS ================= */

export function getProductos() {
  return leer(CLAVES.productos, productosIniciales);
}

export function getProductoById(id) {
  const productos = getProductos();
  return productos.find((p) => p.id === Number(id)) || null;
}

export function createProducto(nuevo) {
  const productos = getProductos();
  const maxId = productos.reduce((max, p) => (p.id > max ? p.id : max), 0);
  const producto = { ...nuevo, id: maxId + 1 };
  productos.push(producto);
  guardar(CLAVES.productos, productos);
  return producto;
}

export function updateProducto(id, datos) {
  const productos = getProductos();
  const indice = productos.findIndex((p) => p.id === Number(id));
  if (indice === -1) return null;
  productos[indice] = { ...productos[indice], ...datos, id: Number(id) };
  guardar(CLAVES.productos, productos);
  return productos[indice];
}

export function deleteProducto(id) {
  let productos = getProductos();
  productos = productos.filter((p) => p.id !== Number(id));
  guardar(CLAVES.productos, productos);
}

export function descontarStock(itemsCarrito) {
  const productos = getProductos();
  itemsCarrito.forEach((item) => {
    const indice = productos.findIndex((p) => p.id === Number(item.productoId));
    if (indice !== -1) {
      const cantidad = Number(item.cantidad) || 1;
      productos[indice].stock = Math.max(0, productos[indice].stock - cantidad);
    }
  });
  guardar(CLAVES.productos, productos);
}

/* ================= CATEGORÍAS ================= */

export function getCategorias() {
  return leer(CLAVES.categorias, categoriasIniciales);
}

export function createCategoria(nueva) {
  const categorias = getCategorias();
  const maxId = categorias.reduce((max, c) => (c.id > max ? c.id : max), 0);
  const categoria = { ...nueva, id: maxId + 1 };
  categorias.push(categoria);
  guardar(CLAVES.categorias, categorias);
  return categoria;
}

export function updateCategoria(id, datos) {
  const categorias = getCategorias();
  const indice = categorias.findIndex((c) => c.id === Number(id));
  if (indice === -1) return null;
  categorias[indice] = { ...categorias[indice], ...datos, id: Number(id) };
  guardar(CLAVES.categorias, categorias);
  return categorias[indice];
}

export function deleteCategoria(id) {
  let categorias = getCategorias();
  categorias = categorias.filter((c) => c.id !== Number(id));
  guardar(CLAVES.categorias, categorias);
}

/* ================= USUARIOS ================= */

export function getUsuarios() {
  return leer(CLAVES.usuarios, usuariosIniciales);
}

export function getUsuarioByCorreo(correo) {
  const usuarios = getUsuarios();
  return usuarios.find((u) => u.correo.toLowerCase() === String(correo).toLowerCase()) || null;
}

export function createUsuario(nuevo) {
  const usuarios = getUsuarios();
  usuarios.push(nuevo);
  guardar(CLAVES.usuarios, usuarios);
  return nuevo;
}

export function updateUsuario(run, datos) {
  const usuarios = getUsuarios();
  const indice = usuarios.findIndex((u) => u.run === String(run));
  if (indice === -1) return null;
  usuarios[indice] = { ...usuarios[indice], ...datos, run: String(run) };
  guardar(CLAVES.usuarios, usuarios);
  return usuarios[indice];
}

export function deleteUsuario(run) {
  let usuarios = getUsuarios();
  usuarios = usuarios.filter((u) => u.run !== String(run));
  guardar(CLAVES.usuarios, usuarios);
}

/* ================= ÓRDENES / BOLETAS ================= */

export function getOrdenes() {
  return leer(CLAVES.ordenes, ordenesIniciales);
}

export function getOrdenesByUsuario(correoOrId) {
  const ordenes = getOrdenes();
  return ordenes.filter(
    (o) =>
      (o.usuarioId && String(o.usuarioId).toLowerCase() === String(correoOrId).toLowerCase()) ||
      (o.cliente && o.cliente.correo && o.cliente.correo.toLowerCase() === String(correoOrId).toLowerCase()),
  );
}

export function createOrden(orden) {
  const ordenes = getOrdenes();
  const maxId = ordenes.reduce((max, o) => (o.id > max ? o.id : max), 0);
  const nuevaOrden = { ...orden, id: maxId + 1 };
  ordenes.push(nuevaOrden);
  guardar(CLAVES.ordenes, ordenes);
  return nuevaOrden;
}

export function generarCodigoOrden() {
  return 'ORDER' + Date.now();
}

export function generarNroOrden() {
  const ahora = new Date();
  const yyyy = ahora.getFullYear();
  const mm = String(ahora.getMonth() + 1).padStart(2, '0');
  const dd = String(ahora.getDate()).padStart(2, '0');
  const ss = String(ahora.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}${ss}`;
}