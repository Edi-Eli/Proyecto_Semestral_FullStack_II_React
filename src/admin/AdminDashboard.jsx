import { Link } from "react-router-dom";
import MetricCard from "../components/admin/MetricCard";
import { crudService } from "../services/crudService";

const ACCESOS = [
    { to: "/admin", etiqueta: "Dashboard" },
    { to: "/admin/ordenes", etiqueta: "Órdenes" },
    { to: "/admin/productos", etiqueta: "Productos" },
    { to: "/admin/productos/criticos", etiqueta: "Productos Críticos" },
    { to: "/admin/categorias", etiqueta: "Categorías" },
    { to: "/admin/usuarios", etiqueta: "Usuarios" },
    { to: "/admin/reportes", etiqueta: "Reportes" },
    { to: "/admin/perfil", etiqueta: "Perfil" }
];

export default function AdminDashboard() {
    const compras = crudService.listOrdenes().length;
    const productos = crudService.listProductos().length;
    const usuarios = crudService.listUsuarios().length;

    return (
        <main className="admin-contenido">
            <h1>Dashboard</h1>
            <p className="admin-saludo">Resumen general de Ferreteria Los Maestros.</p>

            <section className="tarjetas-resumen">
                <MetricCard titulo="Compras" valor={compras} color="azul" />
                <MetricCard titulo="Productos" valor={productos} color="verde" />
                <MetricCard titulo="Usuarios" valor={usuarios} color="amarillo" />
            </section>

            <section className="accesos-grid">
                {ACCESOS.map((acceso) => (
                    <Link key={acceso.to} to={acceso.to} className="acceso-rapido">
                        {acceso.etiqueta}
                    </Link>
                ))}
            </section>
        </main>
    );
}