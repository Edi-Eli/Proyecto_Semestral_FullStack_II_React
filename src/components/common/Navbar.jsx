import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/authContext.js'
import { useCart } from '../../context/cartContext.js'
import { formatearPrecioCLP } from '../../data/crudService.js'

function Navbar() {
  const { usuarioActivo, logout } = useAuth()
  const { totalCarrito, cantidadTotalItems } = useCart()

  const claseActivo = ({ isActive }) =>
    isActive ? 'nav-link fw-bold text-warning' : 'nav-link text-white'

  return (
    <header>
      <Link to="/" className="d-flex align-items-center ms-3">
        <img src="/assets/images/logo.png" alt="Logo Ferretería Los Maestros" id="imagen-logo" />
      </Link>

      <nav className="navbar navbar-expand-lg w-100 py-0">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navTienda"
          aria-controls="navTienda"
          aria-expanded="false"
          aria-label="Abrir menú"
          style={{ filter: 'invert(1)' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navTienda">
          <ul className="nav-menu1">
            <li><NavLink to="/" className={claseActivo}>Home</NavLink></li>
            <li><NavLink to="/productos" className={claseActivo}>Productos</NavLink></li>
            <li><NavLink to="/categorias" className={claseActivo}>Categorías</NavLink></li>
            <li><NavLink to="/ofertas" className={claseActivo}>Ofertas</NavLink></li>
            <li><NavLink to="/nosotros" className={claseActivo}>Nosotros</NavLink></li>
            <li><NavLink to="/blogs" className={claseActivo}>Blog</NavLink></li>
            <li><NavLink to="/contacto" className={claseActivo}>Contacto</NavLink></li>
          </ul>

          <ul className="nav-menu2">
            <li>
              <Link to="/carrito" className="btn btn-success btn-sm text-white text-decoration-none">
                <i className="bi bi-cart3 me-1"></i>
                Carrito ${formatearPrecioCLP(totalCarrito)}
                {cantidadTotalItems > 0 && (
                  <span className="badge bg-light text-dark ms-1">{cantidadTotalItems}</span>
                )}
              </Link>
            </li>
            {usuarioActivo ? (
              <>
                <li>
                  <span className="text-white fw-bold">
                    Hola, {usuarioActivo.nombre}
                    {usuarioActivo.tipoUsuario === 'Administrador' && (
                      <Link to="/admin" className="btn btn-outline-light btn-sm ms-2 text-decoration-none">
                        Panel
                      </Link>
                    )}
                  </span>
                </li>
                <li>
                  <button type="button" className="btn btn-outline-light btn-sm" onClick={logout}>
                    Cerrar Sesión
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login" className="text-decoration-none">Iniciar Sesión</Link></li>
                <li><Link to="/registro" className="text-decoration-none">Crear Cuenta</Link></li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </header>
  )
}

export default Navbar