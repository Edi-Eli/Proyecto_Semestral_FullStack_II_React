/**
 * AdminSubcategorias — CRUD de subcategorías.
 *
 * El backend expone /api/subcategorias con filtro opcional por categoría.
 * Solo el rol Administrador puede crear, editar o eliminar.
 */
import { useEffect, useState } from 'react'
import * as productosApi from '../api/productos.js'
import Loader from '../components/common/Loader.jsx'
import MensajeError from '../components/common/MensajeError.jsx'
import { requerido, maxCaracteres } from '../utils/validaciones.js'

const FORM_VACIO = { categoriaId: '', nombre: '' }

export default function AdminSubcategorias() {
  const [subcategorias, setSubcategorias] = useState([])
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState(FORM_VACIO)
  const [idEditar, setIdEditar] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    let vigente = true
    Promise.allSettled([
      productosApi.listarSubcategorias(),
      productosApi.listarCategorias(),
    ])
      .then(([subsRes, catsRes]) => {
        if (!vigente) return
        if (subsRes.status === 'rejected' && catsRes.status === 'rejected') {
          setError('No se pudieron cargar las subcategorías.')
          setCargando(false)
          return
        }
        setSubcategorias(subsRes.status === 'fulfilled' ? subsRes.value || [] : [])
        setCategorias(catsRes.status === 'fulfilled' ? catsRes.value || [] : [])
        setError(null)
        setCargando(false)
      })
      .catch((err) => {
        if (!vigente) return
        setError(err.message || 'No se pudieron cargar las subcategorías.')
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

  function limpiar() {
    setForm(FORM_VACIO)
    setIdEditar(null)
    setMensaje('')
  }

  function editar(subcategoria) {
    setForm({
      categoriaId: String(subcategoria.categoriaId ?? ''),
      nombre: subcategoria.nombre ?? '',
    })
    setIdEditar(subcategoria.id)
    setMensaje('')
  }

  async function guardar(evento) {
    evento.preventDefault()
    setMensaje('')

    if (!requerido(form.categoriaId)) {
      setMensaje('Debe seleccionar una categoría.')
      return
    }
    if (!requerido(form.nombre)) {
      setMensaje('El nombre de la subcategoría es requerido.')
      return
    }
    if (!maxCaracteres(form.nombre, 80)) {
      setMensaje('El nombre no puede superar los 80 caracteres.')
      return
    }

    const datos = {
      categoriaId: Number(form.categoriaId),
      nombre: form.nombre.trim(),
    }

    setGuardando(true)
    try {
      if (idEditar !== null) {
        await productosApi.actualizarSubcategoria(idEditar, datos)
        setMensaje('Subcategoría actualizada correctamente.')
      } else {
        await productosApi.crearSubcategoria(datos)
        setMensaje('Subcategoría creada correctamente.')
      }
      limpiar()
      setRecargar((n) => n + 1)
    } catch (err) {
      setMensaje(err.message || 'No se pudo guardar la subcategoría.')
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(subcategoria) {
    if (!window.confirm(`¿Eliminar la subcategoría "${subcategoria.nombre}"?`)) return
    setGuardando(true)
    setMensaje('')
    try {
      await productosApi.eliminarSubcategoria(subcategoria.id)
      setMensaje('Subcategoría eliminada correctamente.')
      if (idEditar === subcategoria.id) limpiar()
      setRecargar((n) => n + 1)
    } catch (err) {
      setMensaje(err.message || 'No se pudo eliminar la subcategoría.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <main className="admin-contenido">
        <h1>Subcategorías</h1>
        <Loader mensaje="Cargando subcategorías..." />
      </main>
    )
  }

  if (error) {
    return (
      <main className="admin-contenido">
        <h1>Subcategorías</h1>
        <MensajeError mensaje={error} onReintentar={reintentar} />
      </main>
    )
  }

  return (
    <main className="admin-contenido">
      <h1>Subcategorías</h1>
      <p className="admin-saludo">Cada subcategoría pertenece a una categoría del catálogo.</p>

      {mensaje && <div className="alert alert-info py-2">{mensaje}</div>}

      <section className="seccion-tabla">
        <h2>Listado de subcategorías</h2>
        <table className="tabla-admin">
          <thead>
            <tr>
              <th>ID</th>
              <th>Categoría</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {subcategorias.length === 0 ? (
              <tr>
                <td colSpan="4">No hay subcategorías registradas.</td>
              </tr>
            ) : (
              subcategorias.map((subcategoria) => (
                <tr key={subcategoria.id}>
                  <td>{subcategoria.id}</td>
                  <td>{subcategoria.categoriaNombre ?? '—'}</td>
                  <td>{subcategoria.nombre}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-admin btn-editar"
                      onClick={() => editar(subcategoria)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn-admin btn-eliminar"
                      disabled={guardando}
                      onClick={() => eliminar(subcategoria)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="seccion-formulario">
        <h2>{idEditar !== null ? 'Editar subcategoría' : 'Nueva subcategoría'}</h2>
        <form onSubmit={guardar} noValidate>
          <div className="form-admin">
            <div className="campo-form">
              <label htmlFor="categoria-subcategoria">Categoría</label>
              <select
                id="categoria-subcategoria"
                value={form.categoriaId}
                onChange={(evento) =>
                  setForm((anterior) => ({ ...anterior, categoriaId: evento.target.value }))
                }
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo-form">
              <label htmlFor="nombre-subcategoria">Nombre</label>
              <input
                type="text"
                id="nombre-subcategoria"
                maxLength="80"
                value={form.nombre}
                onChange={(evento) =>
                  setForm((anterior) => ({ ...anterior, nombre: evento.target.value }))
                }
              />
            </div>

            <div className="botones-form">
              <button type="submit" className="btn-admin btn-guardar" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar subcategoría'}
              </button>
              <button type="button" className="btn-admin btn-limpiar" onClick={limpiar}>
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}
