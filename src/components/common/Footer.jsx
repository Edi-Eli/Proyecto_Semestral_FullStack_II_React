import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer>
      <div className="footer-col">
        <h4>Ferretería Los Maestros</h4>
        <p>Todo para tu construcción y mejoramiento del hogar.</p>
      </div>
      <div className="footer-col">
        <h4>Enlaces</h4>
        <ul>
          <li><Link to="/productos">Productos</Link></li>
          <li><Link to="/categorias">Categorías</Link></li>
          <li><Link to="/ofertas">Ofertas</Link></li>
          <li><Link to="/blogs">Blog</Link></li>
          <li><Link to="/nosotros">Nosotros</Link></li>
          <li><Link to="/contacto">Contacto</Link></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Contacto</h4>
        <p>Av. Los Maestros 1234, Santiago</p>
        <p>+56 9 1234 5678</p>
        <p>contacto@ferreterialosmaestros.cl</p>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Ferretería Los Maestros. Todos los derechos reservados.
      </div>
    </footer>
  )
}

export default Footer
