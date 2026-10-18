export const TIPOS_USUARIO = ["Administrador", "Cliente", "Vendedor"];

export const PRODUCTOS_SEMILLA = [
    { codigo: "FER001", nombre: "Caja De Herramientas", descripcion: "Caja de herramientas con 20 piezas", precio: 8990, stock: 15, stockCritico: 4, categoria: "Herramientas Manuales", imagen: "/assets/images/images.jpeg" },
    { codigo: "FER002", nombre: "Esmeril Angular Electrico", descripcion: "Esmeril angular para metal y concreto", precio: 50000, stock: 9, stockCritico: 3, categoria: "Herramientas Electricas", imagen: "/assets/images/8739196_01.jpg" },
    { codigo: "FER003", nombre: "Pack Taladro Inalambrico", descripcion: "Taladro inalambrico con bateria y cargador", precio: 95000, stock: 3, stockCritico: 5, categoria: "Herramientas Electricas", imagen: "/assets/images/w=1500,h=1500,fit=cover.png" },
    { codigo: "FER004", nombre: "Cepillo Electrico", descripcion: "Cepillo electrico multiuso", precio: 117290, stock: 6, stockCritico: 2, categoria: "Herramientas Electricas", imagen: "/assets/images/images_(1).jpeg" },
    { codigo: "FER005", nombre: "13 En 1 Destornillador", descripcion: "Set destornillador 13 en 1", precio: 23900, stock: 20, stockCritico: 5, categoria: "Herramientas Manuales", imagen: "/assets/images/images_(3).jpeg" },
    { codigo: "FER006", nombre: "Mazo 16", descripcion: "Mazo de 16 onzas", precio: 20000, stock: 12, stockCritico: 4, categoria: "Herramientas Manuales", imagen: "/assets/images/images_(2).jpeg" },
    { codigo: "FER007", nombre: "Martillo Carpintero Madera", descripcion: "Martillo de carpintero con mango de madera", precio: 14500, stock: 2, stockCritico: 3, categoria: "Herramientas Manuales", imagen: "/assets/images/descargar.jpeg" },
    { codigo: "FER008", nombre: "Set de Alicates Universal", descripcion: "Set de alicates universales", precio: 30000, stock: 10, stockCritico: 3, categoria: "Herramientas Manuales", imagen: "/assets/images/alicate.png" }
];

export const USUARIOS_SEMILLA = [
    { run: "195436789", nombre: "Sebastian", apellidos: "Perez Gonzalez", correo: "sebas@duoc.cl", fechaNacimiento: "2000-05-15", tipoUsuario: "Administrador", region: "Región Metropolitana de Santiago", comuna: "Santiago", direccion: "Av. Siempre Viva 123" },
    { run: "123456785", nombre: "Eduardo", apellidos: "Lopez Muñoz", correo: "edi@profesor.duoc.cl", fechaNacimiento: "1995-03-20", tipoUsuario: "Vendedor", region: "Región de Valparaíso", comuna: "Viña del Mar", direccion: "Calle Los Pinos 45" },
    { run: "204567891", nombre: "Maria", apellidos: "Torres Silva", correo: "maria.torres@gmail.com", fechaNacimiento: "1998-11-02", tipoUsuario: "Cliente", region: "Región Metropolitana de Santiago", comuna: "Providencia", direccion: "Pasaje Las Flores 8" },
    { run: "167895433", nombre: "Carlos", apellidos: "Rojas Diaz", correo: "carlos.rojas@duoc.cl", fechaNacimiento: "1990-07-12", tipoUsuario: "Cliente", region: "Región del Biobío", comuna: "Concepción", direccion: "Av. Collao 1550" },
    { run: "111111111", nombre: "Jose", apellidos: "Fernandez Soto", correo: "jose.fernandez@gmail.com", fechaNacimiento: "1987-01-30", tipoUsuario: "Vendedor", region: "Región Metropolitana de Santiago", comuna: "Maipú", direccion: "Villa Los Volcanes 210" }
];

export const ESTADOS_ORDEN = ["Pendiente", "Enviado", "Entregado", "Cancelado"];

export const CATEGORIAS_SEMILLA = [
    { id: 1, nombre: "Herramientas Manuales", descripcion: "Herramientas de uso manual" },
    { id: 2, nombre: "Herramientas Electricas", descripcion: "Herramientas con motor electrico" },
    { id: 3, nombre: "Jardineria", descripcion: "Articulos para jardin y exterior" },
    { id: 4, nombre: "Accesorios", descripcion: "Accesorios y complementos" },
    { id: 5, nombre: "Seguridad", descripcion: "Equipos de proteccion personal" }
];

export const ORDENES_SEMILLA = [
    {
        id: "ORD-0001", fecha: "2026-04-02", runCliente: "204567891", cliente: "Maria Torres Silva", estado: "Entregado",
        items: [
            { codigo: "FER001", nombre: "Caja De Herramientas", cantidad: 1, precio: 8990 },
            { codigo: "FER005", nombre: "13 En 1 Destornillador", cantidad: 2, precio: 23900 }
        ]
    },
    {
        id: "ORD-0002", fecha: "2026-04-08", runCliente: "167895433", cliente: "Carlos Rojas Diaz", estado: "Enviado",
        items: [
            { codigo: "FER002", nombre: "Esmeril Angular Electrico", cantidad: 1, precio: 50000 },
            { codigo: "FER008", nombre: "Set de Alicates Universal", cantidad: 1, precio: 30000 }
        ]
    },
    {
        id: "ORD-0003", fecha: "2026-04-12", runCliente: "204567891", cliente: "Maria Torres Silva", estado: "Pendiente",
        items: [
            { codigo: "FER003", nombre: "Pack Taladro Inalambrico", cantidad: 1, precio: 95000 }
        ]
    },
    {
        id: "ORD-0004", fecha: "2026-04-15", runCliente: "111111111", cliente: "Jose Fernandez Soto", estado: "Cancelado",
        items: [
            { codigo: "FER004", nombre: "Cepillo Electrico", cantidad: 1, precio: 117290 }
        ]
    },
    {
        id: "ORD-0005", fecha: "2026-04-19", runCliente: "123456785", cliente: "Eduardo Lopez Muñoz", estado: "Entregado",
        items: [
            { codigo: "FER006", nombre: "Mazo 16", cantidad: 1, precio: 20000 },
            { codigo: "FER007", nombre: "Martillo Carpintero Madera", cantidad: 2, precio: 14500 }
        ]
    }
];