/**
 * AdminDashboard — Resumen general
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MetricCard from '../components/admin/MetricCard.jsx'
import Loader from '../components/common/Loader.jsx'
import MensajeError from '../components/common/MensajeError.jsx'
import * as pedidosApi from '../api/pedidos.js'
import * as productosApi from '../api/productos.js'
import * as usuariosApiReal from '../api/usuarios.js'
import * as usuariosMock from '../utils/mocks/usuarios.mock.js'
import { formatearPrecioCLP } from '../utils/productoHelpers.js'

const USAR_MOCK = (import.meta.env.VITE_USAR_MOCK ?? 'true') !== 'false'
const usuariosApi = USAR_MOCK ? usuariosMock : usuariosApiReal

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
  const [metricas, setMetricas] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    let vigente = true
    Promise.all([
      pedidosApi.listar(),
      productosApi.listar({ page: 0, size: 1 }),
      usuariosApi.listarUsuarios(),
    ])
      .then(([pedidos, paginaProductos, usuarios]) => {
        if (!vigente) return
        const listaPedidos = Array.isArray(pedidos) ? pedidos : []
        const recaudado = listaPedidos
          .filter((p) => p.estado !== 'RECHAZADA')
          .reduce((suma, p) => suma + Number(p.total || 0), 0)
        setMetricas({
          compras: listaPedidos.length,
          productos: paginaProductos?.totalElements ?? 0,
          usuarios: Array.isArray(usuarios) ? usuarios.length : 0,
          recaudado,
        })
        setError(null)
        setCargando(false)
      })
      .catch((err) => {
        if (!vigente) return
        setError(err.message || 'No se pudo cargar el resumen.')
        setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [recargar])

  function reintentar() {
    setCargando(true)
    setError(null)
    setRecargar((n) => n + 1)
  }

  return (
    <main className="admin-contenido">
      <h1>Dashboard</h1>
      <p className="admin-saludo">Resumen general de Ferretería Los Maestros.</p>

      {cargando && <Loader mensaje="Cargando resumen..." />}
      {!cargando && error && <MensajeError mensaje={error} onReintentar={reintentar} />}

      {!cargando && !error && metricas && (
        <section className="tarjetas-resumen">
          <MetricCard titulo="Compras" valor={metricas.compras} color="azul" />
          <MetricCard titulo="Productos" valor={metricas.productos} color="verde" />
          <MetricCard titulo="Usuarios" valor={metricas.usuarios} color="amarillo" />
          <MetricCard titulo="Recaudado" valor={formatearPrecioCLP(metricas.recaudado)} color="azul" />
        </section>
      )}

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