import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { crudService } from "../../services/crudService";

const ENLACES = [
    { to: "/admin", etiqueta: "Dashboard", exacto: true },
    { to: "/admin/ordenes", etiqueta: "Órdenes" },
    { to: "/admin/productos", etiqueta: "Productos" },
    { to: "/admin/categorias", etiqueta: "Categorías" },
    { to: "/admin/usuarios", etiqueta: "Usuarios" },
    { to: "/admin/reportes", etiqueta: "Reportes" },
    { to: "/admin/perfil", etiqueta: "Perfil" }
];

export default function AdminSidebar() {
    const [abierto, setAbierto] = useState(false);
    const navigate = useNavigate();

    const cerrarSesion = () => {
        crudService.cerrarSesion();
        navigate("/");
    };

    return (
        <aside className={`admin-sidebar ${abierto ? "admin-sidebar-abierto" : ""}`}>
            <div className="admin-logo">
                <img src="/assets/images/image.png" alt="Logo" />
                <p>Ferreteria Los Maestros</p>
            </div>

            <button type="button" className="admin-toggle" onClick={() => setAbierto((valor) => !valor)}>
                {abierto ? "Cerrar menú" : "Menú"}
            </button>

            <nav className="admin-menu">
                <ul>
                    {ENLACES.map((enlace) => (
                        <li key={enlace.to}>
                            <NavLink to={enlace.to} end={enlace.exacto} onClick={() => setAbierto(false)}>
                                {enlace.etiqueta}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <Link className="admin-tienda" to="/">Tienda</Link>
            <button type="button" className="admin-logout" onClick={cerrarSesion}>Cerrar Sesión</button>
        </aside>
    );
}