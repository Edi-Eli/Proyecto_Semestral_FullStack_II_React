/**
 * AdminReportes — Métricas del negocio
 */
import { useEffect, useState } from 'react'
import Loader from '../components/common/Loader.jsx'
import MensajeError from '../components/common/MensajeError.jsx'
import * as pedidosApi from '../api/pedidos.js'
import * as productosApi from '../api/productos.js'
import * as usuariosApiReal from '../api/usuarios.js'
import * as usuariosMock from '../utils/mocks/usuarios.mock.js'
import { formatearPrecioCLP } from '../utils/productoHelpers.js'

const USAR_MOCK = (import.meta.env.VITE_USAR_MOCK ?? 'true') !== 'false'
const usuariosApi = USAR_MOCK ? usuariosMock : usuariosApiReal

const TIPOS_USUARIO = ['Administrador', 'Vendedor', 'Cliente']
const ESTADOS = ['PENDIENTE', 'APROBADA', 'DESPACHADA', 'ENTREGADA', 'PAGADA', 'RECHAZADA']
const ETIQUETA_ESTADO = {
  PENDIENTE: 'Pendiente', APROBADA: 'Aprobada', DESPACHADA: 'Despachada',
  ENTREGADA: 'Entregada', PAGADA: 'Pagada', RECHAZADA: 'Rechazada',
}

export default function AdminReportes() {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    let vigente = true
    Promise.all([
      pedidosApi.listar(),
      productosApi.listar({ page: 0, size: 1000 }),
      usuariosApi.listarUsuarios(),
    ])
      .then(([pedidos, paginaProductos, usuarios]) => {
        if (!vigente) return
        const listaPedidos = Array.isArray(pedidos) ? pedidos : []
        const productos = paginaProductos?.content || []
        const validos = listaPedidos.filter((p) => p.estado !== 'RECHAZADA')
        const totalRecaudado = validos.reduce((suma, p) => suma + Number(p.total || 0), 0)
        const mayorStock = productos.length ? productos.reduce((a, b) => (b.stock > a.stock ? b : a)) : null
        const menorStock = productos.length ? productos.reduce((a, b) => (b.stock < a.stock ? b : a)) : null

        const conteo = {}
        validos.forEach((p) => p.items.forEach((it) => {
          if (!conteo[it.productoId]) conteo[it.productoId] = { productoId: it.productoId, nombre: it.nombre, cantidad: 0, total: 0 }
          conteo[it.productoId].cantidad += it.cantidad
          conteo[it.productoId].total += Number(it.subtotal || 0)
        }))
        const masVendidos = Object.values(conteo).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5)

        setDatos({
          totalRecaudado,
          mayorStock,
          menorStock,
          masVendidos,
          pedidos: listaPedidos,
          usuarios: Array.isArray(usuarios) ? usuarios : [],
        })
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
  }, [recargar])

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

  return (
    <main className="admin-contenido">
      <h1>Reportes</h1>

      <section className="tarjetas-resumen">
        <article className="tarjeta-resumen">
          <h2>Total recaudado</h2>
          <p>{formatearPrecioCLP(datos.totalRecaudado)}</p>
        </article>
        <article className="tarjeta-resumen">
          <h2>Mayor stock</h2>
          <p>{datos.mayorStock ? `${datos.mayorStock.nombre} (${datos.mayorStock.stock})` : '-'}</p>
        </article>
        <article className="tarjeta-resumen">
          <h2>Menor stock</h2>
          <p>{datos.menorStock ? `${datos.menorStock.nombre} (${datos.menorStock.stock})` : '-'}</p>
        </article>
      </section>

      <section className="seccion-tabla">
        <h2>Productos más vendidos</h2>
        <table className="tabla-admin">
          <thead>
            <tr><th>Producto</th><th>Unidades</th><th>Total</th></tr>
          </thead>
          <tbody>
            {datos.masVendidos.length === 0 ? (
              <tr><td colSpan="3">Sin ventas registradas.</td></tr>
            ) : (
              datos.masVendidos.map((item) => (
                <tr key={item.productoId}>
                  <td>{item.nombre}</td>
                  <td>{item.cantidad}</td>
                  <td>{formatearPrecioCLP(item.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="seccion-tabla">
        <h2>Usuarios por rol</h2>
        <table className="tabla-admin">
          <thead>
            <tr><th>Rol</th><th>Cantidad</th></tr>
          </thead>
          <tbody>
            {TIPOS_USUARIO.map((tipo) => (
              <tr key={tipo}>
                <td>{tipo}</td>
                <td>{datos.usuarios.filter((u) => u.tipoUsuario === tipo).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="seccion-tabla">
        <h2>Pedidos por estado</h2>
        <table className="tabla-admin">
          <thead>
            <tr><th>Estado</th><th>Cantidad</th></tr>
          </thead>
          <tbody>
            {ESTADOS.map((estado) => (
              <tr key={estado}>
                <td>
                  <span className={`badge badge-${estado.toLowerCase()}`}>{ETIQUETA_ESTADO[estado]}</span>
                </td>
                <td>{datos.pedidos.filter((p) => p.estado === estado).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}