/**
 * AdminDashboard — Resumen por rol.
 *
 * Administrador: usa /api/reportes/resumen (totales reales, sin paginación).
 * Vendedor: usa endpoints permitidos (pedidos, productos, ofertas y stock) y
 * no llama a /resumen ni a usuarios para evitar 403.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MetricCard from '../components/admin/MetricCard.jsx'
import Loader from '../components/common/Loader.jsx'
import MensajeError from '../components/common/MensajeError.jsx'
import { useAuth } from '../context/authContext.js'
import * as reportesApi from '../api/reportes.js'
import * as pedidosApi from '../api/pedidos.js'
import * as productosApi from '../api/productos.js'
import { formatearPrecioCLP } from '../utils/formato.js'

const ACCESOS_BASE = [
  { to: '/admin/ordenes', icono: 'bi-receipt', etiqueta: 'Órdenes' },
  { to: '/admin/productos', icono: 'bi-box-seam', etiqueta: 'Productos' },
  { to: '/admin/productos/criticos', icono: 'bi-exclamation-triangle', etiqueta: 'Productos Críticos' },
  { to: '/admin/ofertas', icono: 'bi-percent', etiqueta: 'Ofertas' },
  { to: '/admin/cuentas', icono: 'bi-credit-card', etiqueta: 'Cuentas Corrientes' },
  { to: '/admin/reportes', icono: 'bi-graph-up', etiqueta: 'Reportes' },
  { to: '/admin/contacto', icono: 'bi-envelope', etiqueta: 'Contactos' },
  { to: '/admin/perfil', icono: 'bi-person-circle', etiqueta: 'Perfil' },
]

const ACCESOS_ADMIN = [
  { to: '/admin/categorias', icono: 'bi-tags', etiqueta: 'Categorías' },
  { to: '/admin/subcategorias', icono: 'bi-tags-fill', etiqueta: 'Subcategorías' },
  { to: '/admin/usuarios', icono: 'bi-people', etiqueta: 'Usuarios' },
]

export default function AdminDashboard() {
  const { usuarioActivo } = useAuth()
  const esAdmin = usuarioActivo?.tipoUsuario === 'Administrador'
  const [metricas, setMetricas] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    let vigente = true

    const cargas = esAdmin
      ? [reportesApi.resumen(), reportesApi.stock()]
      : [
          pedidosApi.listarPagina({ page: 0, size: 1 }),
          productosApi.listar({ page: 0, size: 1 }),
          productosApi.listarOfertas({ page: 0, size: 1 }),
          reportesApi.stock(),
        ]

    Promise.allSettled(cargas)
      .then((resultados) => {
        if (!vigente) return

        if (esAdmin) {
          const [resumenRes, stockRes] = resultados
          if (resumenRes.status === 'rejected') {
            setError(resumenRes.reason?.message || 'No se pudo cargar el resumen.')
            setCargando(false)
            return
          }
          const resumen = resumenRes.value
          setMetricas({
            compras: resumen.totalPedidos,
            recaudado: resumen.recaudado,
            productos: resumen.totalProductos,
            usuarios: resumen.totalUsuarios,
            criticos: stockRes.status === 'fulfilled' ? stockRes.value?.criticos?.length : null,
          })
        } else {
          const [pedidosRes, productosRes, ofertasRes, stockRes] = resultados
          const todasFallaron = resultados.every((r) => r.status === 'rejected')
          if (todasFallaron) {
            setError('No se pudieron cargar las métricas del panel.')
            setCargando(false)
            return
          }
          setMetricas({
            compras: pedidosRes.status === 'fulfilled' ? pedidosRes.value.totalElements : null,
            productos: productosRes.status === 'fulfilled' ? productosRes.value.totalElements : null,
            ofertas: ofertasRes.status === 'fulfilled' ? ofertasRes.value.totalElements : null,
            criticos: stockRes.status === 'fulfilled' ? stockRes.value?.criticos?.length : null,
          })
        }

        setError(null)
        setCargando(false)
      })
      .catch((err) => {
        if (!vigente) return
        setError(err.message || 'No se pudieron cargar las métricas.')
        setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [esAdmin, recargar])

  function reintentar() {
    setError(null)
    setCargando(true)
    setRecargar((n) => n + 1)
  }

  const accesos = esAdmin ? [...ACCESOS_BASE, ...ACCESOS_ADMIN] : ACCESOS_BASE

  return (
    <main className="admin-contenido">
      <h1>Dashboard</h1>
      <p className="admin-saludo">
        {esAdmin ? 'Vista general de la tienda.' : 'Vista de gestión para el rol Vendedor.'}
      </p>

      {cargando && <Loader mensaje="Cargando métricas..." />}

      {!cargando && error && <MensajeError mensaje={error} onReintentar={reintentar} />}

      {!cargando && !error && metricas && (
        <section className="tarjetas-metricas">
          {esAdmin ? (
            <>
              <MetricCard titulo="Compras" valor={metricas.compras} />
              <MetricCard titulo="Recaudado" valor={formatearPrecioCLP(metricas.recaudado)} />
              <MetricCard titulo="Productos" valor={metricas.productos} />
              <MetricCard titulo="Usuarios" valor={metricas.usuarios} />
              <MetricCard titulo="Stock crítico" valor={metricas.criticos ?? '—'} />
            </>
          ) : (
            <>
              <MetricCard titulo="Pedidos" valor={metricas.compras ?? '—'} />
              <MetricCard titulo="Productos" valor={metricas.productos ?? '—'} />
              <MetricCard titulo="Ofertas" valor={metricas.ofertas ?? '—'} />
              <MetricCard titulo="Stock crítico" valor={metricas.criticos ?? '—'} />
            </>
          )}
        </section>
      )}

      <section className="seccion-tabla">
        <h2>Accesos rápidos</h2>
        <div className="accesos-rapidos">
          {accesos.map((acceso) => (
            <Link key={acceso.to} to={acceso.to}>
              <i className={`bi ${acceso.icono}`} aria-hidden="true"></i> {acceso.etiqueta}
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
