/**
 * AdminReportes — Reportes del negocio.
 *
 * Administrador: consume /api/reportes/resumen, /mas-vendidos, /top-clientes y /stock.
 * Vendedor: consume solo endpoints permitidos (/mas-vendidos, /stock, pedidos y productos)
 * y evita /resumen y /top-clientes para no recibir 403.
 */
import { useEffect, useState } from 'react'
import Loader from '../components/common/Loader.jsx'
import MensajeError from '../components/common/MensajeError.jsx'
import { useAuth } from '../context/authContext.js'
import * as reportesApi from '../api/reportes.js'
import * as pedidosApi from '../api/pedidos.js'
import * as productosApi from '../api/productos.js'
import { formatearPrecioCLP } from '../utils/formato.js'

const ESTADOS = ['PENDIENTE', 'APROBADA', 'DESPACHADA', 'ENTREGADA', 'PAGADA', 'RECHAZADA']
const ETIQUETA_ESTADO = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  DESPACHADA: 'Despachada',
  ENTREGADA: 'Entregada',
  PAGADA: 'Pagada',
  RECHAZADA: 'Rechazada',
}

export default function AdminReportes() {
  const { usuarioActivo } = useAuth()
  const esAdmin = usuarioActivo?.tipoUsuario === 'Administrador'
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    let vigente = true

    const cargas = esAdmin
      ? [
          reportesApi.resumen(),
          reportesApi.masVendidos({ limite: 5 }),
          reportesApi.topClientes({ limite: 5 }),
          reportesApi.stock(),
        ]
      : [
          pedidosApi.listarPagina({ page: 0, size: 1 }),
          productosApi.listar({ page: 0, size: 1 }),
          reportesApi.masVendidos({ limite: 5 }),
          reportesApi.stock(),
        ]

    Promise.allSettled(cargas)
      .then((resultados) => {
        if (!vigente) return
        const todasFallaron = resultados.every((r) => r.status === 'rejected')
        if (todasFallaron) {
          setError('No se pudieron cargar los reportes.')
          setCargando(false)
          return
        }

        if (esAdmin) {
          const [resumenRes, masVendidosRes, topClientesRes, stockRes] = resultados
          setDatos({
            resumen: resumenRes.status === 'fulfilled' ? resumenRes.value : null,
            masVendidos: masVendidosRes.status === 'fulfilled' ? masVendidosRes.value : [],
            topClientes: topClientesRes.status === 'fulfilled' ? topClientesRes.value : [],
            stock: stockRes.status === 'fulfilled' ? stockRes.value : null,
          })
        } else {
          const [pedidosRes, productosRes, masVendidosRes, stockRes] = resultados
          setDatos({
            totalPedidos: pedidosRes.status === 'fulfilled' ? pedidosRes.value.totalElements : null,
            totalProductos: productosRes.status === 'fulfilled' ? productosRes.value.totalElements : null,
            masVendidos: masVendidosRes.status === 'fulfilled' ? masVendidosRes.value : [],
            stock: stockRes.status === 'fulfilled' ? stockRes.value : null,
          })
        }

        setError(null)
        setCargando(false)
      })
      .catch((err) => {
        if (!vigente) return
        setError(err.message || 'No se pudieron cargar los reportes.')
        setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [esAdmin, recargar])

  function reintentar() {
    setCargando(true)
    setError(null)
    setRecargar((n) => n + 1)
  }

  if (cargando) {
    return (
      <main className="admin-contenido">
        <h1>Reportes</h1>
        <Loader mensaje="Cargando reportes..." />
      </main>
    )
  }

  if (error) {
    return (
      <main className="admin-contenido">
        <h1>Reportes</h1>
        <MensajeError mensaje={error} onReintentar={reintentar} />
      </main>
    )
  }

  const resumen = datos?.resumen
  const stock = datos?.stock
  const masVendidos = datos?.masVendidos || []
  const topClientes = datos?.topClientes || []
  const pedidosPorEstado = resumen?.pedidosPorEstado || {}

  return (
    <main className="admin-contenido">
      <h1>Reportes</h1>
      <p className="admin-saludo">
        {esAdmin ? 'Vista completa del negocio.' : 'Vista de ventas y stock para el rol Vendedor.'}
      </p>

      <section className="tarjetas-resumen">
        {esAdmin ? (
          <>
            <article className="tarjeta-resumen">
              <h2>Total recaudado</h2>
              <p>{formatearPrecioCLP(resumen?.recaudado ?? 0)}</p>
            </article>
            <article className="tarjeta-resumen">
              <h2>Pedidos</h2>
              <p>{resumen?.totalPedidos ?? '—'}</p>
            </article>
            <article className="tarjeta-resumen">
              <h2>Productos</h2>
              <p>{resumen?.totalProductos ?? '—'}</p>
            </article>
            <article className="tarjeta-resumen">
              <h2>Usuarios</h2>
              <p>{resumen?.totalUsuarios ?? '—'}</p>
            </article>
          </>
        ) : (
          <>
            <article className="tarjeta-resumen">
              <h2>Pedidos</h2>
              <p>{datos?.totalPedidos ?? '—'}</p>
            </article>
            <article className="tarjeta-resumen">
              <h2>Productos</h2>
              <p>{datos?.totalProductos ?? '—'}</p>
            </article>
            <article className="tarjeta-resumen">
              <h2>Mayor stock</h2>
              <p>{stock?.mayorStock ? `${stock.mayorStock.nombre} (${stock.mayorStock.stock})` : '—'}</p>
            </article>
            <article className="tarjeta-resumen">
              <h2>Menor stock</h2>
              <p>{stock?.menorStock ? `${stock.menorStock.nombre} (${stock.menorStock.stock})` : '—'}</p>
            </article>
          </>
        )}
      </section>

      <section className="seccion-tabla">
        <h2>Productos más vendidos</h2>
        <table className="tabla-admin">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Unidades</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {masVendidos.length === 0 ? (
              <tr>
                <td colSpan="3">Sin ventas registradas.</td>
              </tr>
            ) : (
              masVendidos.map((item) => (
                <tr key={item.productoId ?? item.nombre}>
                  <td>{item.nombre}</td>
                  <td>{item.cantidad}</td>
                  <td>{formatearPrecioCLP(item.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {esAdmin && (
        <section className="seccion-tabla">
          <h2>Top clientes</h2>
          <table className="tabla-admin">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Pedidos</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {topClientes.length === 0 ? (
                <tr>
                  <td colSpan="3">Sin clientes con compras.</td>
                </tr>
              ) : (
                topClientes.map((cliente) => (
                  <tr key={cliente.usuarioId ?? cliente.correo ?? cliente.nombre}>
                    <td>{cliente.nombre ?? cliente.correo ?? '—'}</td>
                    <td>{cliente.cantidadPedidos ?? '—'}</td>
                    <td>{formatearPrecioCLP(cliente.total ?? 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      )}

      {esAdmin && (
        <section className="seccion-tabla">
          <h2>Pedidos por estado</h2>
          <table className="tabla-admin">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {ESTADOS.map((estado) => (
                <tr key={estado}>
                  <td>
                    <span className={`badge badge-${estado.toLowerCase()}`}>
                      {ETIQUETA_ESTADO[estado]}
                    </span>
                  </td>
                  <td>{pedidosPorEstado[estado] ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="seccion-tabla">
        <h2>Stock crítico</h2>
        <table className="tabla-admin">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Stock</th>
              <th>Stock crítico</th>
            </tr>
          </thead>
          <tbody>
            {(stock?.criticos || []).length === 0 ? (
              <tr>
                <td colSpan="3">Sin productos críticos.</td>
              </tr>
            ) : (
              stock.criticos.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.nombre}</td>
                  <td>{producto.stock}</td>
                  <td>{producto.stockCritico}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  )
}
