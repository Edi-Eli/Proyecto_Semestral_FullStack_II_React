import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../context/authContext.js'

function AdminSidebar() {
  const { usuarioActivo, logout } = useAuth()

  const linkClase = ({ isActive }) =>
    'd-flex align-items-center gap-2 px-3 py-2 text-decoration-none rounded text-white' +
    (isActive ? ' bg-primary' : ' sidebar-link')

  return (
    <aside className="admin-sidebar d-flex flex-column">
      <div className="admin-logo">
        <img src="/assets/images/logo.png" alt="Logo" />
        <p>Panel Administrador</p>
      </div>
      <nav className="admin-menu d-flex flex-column flex-grow-1">
        <NavLink to="/admin" end className={linkClase}>
          <i className="bi bi-speedometer2"></i> Dashboard
        </NavLink>
        <NavLink to="/admin/ordenes" className={linkClase}>
          <i className="bi bi-receipt"></i> Órdenes
        </NavLink>
        <NavLink to="/admin/productos" className={linkClase}>
          <i className="bi bi-box-seam"></i> Productos
        </NavLink>
        <NavLink to="/admin/categorias" className={linkClase}>
          <i className="bi bi-tags"></i> Categorías
        </NavLink>
        <NavLink to="/admin/usuarios" className={linkClase}>
          <i className="bi bi-people"></i> Usuarios
        </NavLink>
        <NavLink to="/admin/reportes" className={linkClase}>
          <i className="bi bi-graph-up"></i> Reportes
        </NavLink>
        <NavLink to="/admin/perfil" className={linkClase}>
          <i className="bi bi-person-circle"></i> Perfil
        </NavLink>
      </nav>

      <div className="mt-auto p-3 d-flex flex-column gap-2">
        <Link to="/" className="admin-volver text-center">
          <i className="bi bi-shop me-1"></i> Tienda
        </Link>
        <button
          type="button"
          className="btn btn-danger text-white w-100"
          onClick={logout}
        >
          <i className="bi bi-box-arrow-left me-1"></i> Cerrar Sesión
        </button>
        {usuarioActivo && (
          <small className="text-center text-white-50">{usuarioActivo.nombre}</small>
        )}
      </div>
    </aside>
  )
}

export default AdminSidebar