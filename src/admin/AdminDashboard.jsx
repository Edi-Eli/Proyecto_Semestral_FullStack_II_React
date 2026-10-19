import { Link } from 'react-router-dom'
import MetricCard from '../components/admin/MetricCard.jsx'
import { getOrdenes, getProductos, getUsuarios } from '../data/crudService.js'

const ACCESOS = [
  { to: '/admin', icono: 'bi-speedometer2', etiqueta: 'Dashboard', descripcion: 'Resumen general del sistema' },
  { to: '/admin/ordenes', icono: 'bi-receipt', etiqueta: 'Órdenes', descripcion: 'Boletas y compras realizadas' },
  { to: '/admin/productos', icono: 'bi-box-seam', etiqueta: 'Productos', descripcion: 'CRUD de productos' },
  { to: '/admin/productos/criticos', icono: 'bi-exclamation-triangle', etiqueta: 'Productos Críticos', descripcion: 'Stock igual o bajo el crítico' },
  { to: '/admin/categorias', icono: 'bi-tags', etiqueta: 'Categorías', descripcion: 'Nueva o editar categorías' },
  { to: '/admin/usuarios', icono: 'bi-people', etiqueta: 'Usuarios', descripcion: 'CRUD de usuarios y roles' },
  { to: '/admin/reportes', icono: 'bi-graph-up', etiqueta: 'Reportes', descripcion: 'Ventas, stock y estadísticas' },
  { to: '/admin/perfil', icono: 'bi-person-circle', etiqueta: 'Perfil', descripcion: 'Actualizar datos del admin' },
]

export default function AdminDashboard() {
  const compras = getOrdenes().length
  const productos = getProductos().length
  const usuarios = getUsuarios().length

  return (
    <main className="admin-contenido">
      <h1>Dashboard</h1>
      <p className="admin-saludo">Resumen general de Ferretería Los Maestros.</p>

      <section className="tarjetas-resumen">
        <MetricCard titulo="Compras" valor={compras} color="azul" />
        <MetricCard titulo="Productos" valor={productos} color="verde" />
        <MetricCard titulo="Usuarios" valor={usuarios} color="amarillo" />
      </section>

      <section className="accesos-grid">
        {ACCESOS.map((acceso) => (
          <Link key={acceso.to} to={acceso.to} className="acceso-rapido">
            <i className={`bi ${acceso.icono} acceso-icono`}></i>
            <h3>{acceso.etiqueta}</h3>
            <p>{acceso.descripcion}</p>
          </Link>
        ))}
      </section>
    </main>
  )
}