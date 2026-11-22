import { useEffect, useState } from 'react'
import * as productosApi from '../api/productos.js'
import Loader from '../components/common/Loader.jsx'
import MensajeError from '../components/common/MensajeError.jsx'
import { requerido, maxCaracteres } from '../utils/validaciones.js'

const FORM_VACIO = { nombre: '', imagenUrl: '' }

function validarCategoria(campo, valor) {
  const v = String(valor).trim()
  if (campo === 'nombre') {
    if (!requerido(v)) return 'El nombre de la categoría es requerido.'
    if (!maxCaracteres(v, 50)) return 'El nombre no puede superar los 50 caracteres.'
    return ''
  }
  if (campo === 'imagenUrl') {
    if (v !== '' && !maxCaracteres(v, 200)) return 'La ruta de imagen es muy larga.'
    return ''
  }
  return ''
}

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [errorAccion, setErrorAccion] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [recargar, setRecargar] = useState(0)

  const [form, setForm] = useState(FORM_VACIO)
  const [idEditar, setIdEditar] = useState(null)
  const [errores, setErrores] = useState({})
  const [tocado, setTocado] = useState({})
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    let vigente = true
    Promise.all([productosApi.listarCategorias(), productosApi.listar({ size: 200 })])
      .then(([cats, pagina]) => {
        if (!vigente) return
        setCategorias(cats || [])
        setProductos(pagina?.content || [])
        setError(null)
        setCargando(false)
      })
      .catch((err) => {
        if (!vigente) return
        setError(err.message)
        setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [recargar])

  function reintentar() {
    setError(null)
    setCargando(true)
    setRecargar((n) => n + 1)
  }

  const mostrarError = (campo) =>
    (tocado[campo] || enviado) && errores[campo] ? errores[campo] : ''

  const handleChange = (campo) => (evento) => {
    const valor = evento.target.value
    setForm((anterior) => ({ ...anterior, [campo]: valor }))
    setErrores((anterior) => ({ ...anterior, [campo]: validarCategoria(campo, valor) }))
  }

  const handleBlur = (campo) => () => setTocado((anterior) => ({ ...anterior, [campo]: true }))

  const limpiarFormulario = () => {
    setForm(FORM_VACIO)
    setIdEditar(null)
    setErrores({})
    setTocado({})
    setEnviado(false)
    setErrorAccion(null)
  }

  const editarCategoria = (categoria) => {
    setForm({
      nombre: categoria.nombre,
      imagenUrl: categoria.imagenUrl ?? categoria.imagen ?? '',
    })
    setIdEditar(categoria.id)
    setErrores({})
    setTocado({})
    setEnviado(false)
    setErrorAccion(null)
  }

  const eliminarCategoria = async (categoria) => {
    const enUso = productos.some((p) => Number(p.categoriaId) === Number(categoria.id))
    const mensaje = enUso
      ? `La categoría ${categoria.nombre} está en uso por productos. ¿Deseas eliminarla igual?`
      : `¿Deseas eliminar la categoría ${categoria.nombre}?`
    if (!window.confirm(mensaje)) return
    try {
      setErrorAccion(null)
      await productosApi.eliminarCategoria(categoria.id)
      setCargando(true)
      setRecargar((n) => n + 1)
    } catch (err) {
      setErrorAccion(err.message)
    }
  }

  const guardarCategoria = async (evento) => {
    evento.preventDefault()
    setEnviado(true)

    const nuevosErrores = {
      nombre: validarCategoria('nombre', form.nombre),
      imagenUrl: validarCategoria('imagenUrl', form.imagenUrl),
    }
    setErrores(nuevosErrores)
    if (Object.values(nuevosErrores).some((m) => m !== '')) return

    const duplicada = categorias.some(
      (c) => c.nombre.toLowerCase() === form.nombre.trim().toLowerCase() && c.id !== idEditar,
    )
    if (duplicada) {
      setErrores((anterior) => ({
        ...anterior,
        nombre: 'Ya existe una categoría con ese nombre.',
      }))
      return
    }

    const datos = { nombre: form.nombre.trim(), imagenUrl: form.imagenUrl.trim() }
    try {
      setGuardando(true)
      setErrorAccion(null)
      if (idEditar !== null) {
        await productosApi.actualizarCategoria(idEditar, datos)
      } else {
        await productosApi.crearCategoria(datos)
      }
      setCargando(true)
      setRecargar((n) => n + 1)
      limpiarFormulario()
    } catch (err) {
      setErrorAccion(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <main className="admin-contenido">
      <h1>Mantenedor de Categorías</h1>

      {errorAccion && <MensajeError mensaje={errorAccion} />}

      {cargando && <Loader mensaje="Cargando categorías..." />}

      {!cargando && error && <MensajeError mensaje={error} onReintentar={reintentar} />}

      {!cargando && !error && (
        <>
          <section className="seccion-tabla">
            <h2>Listado de categorías</h2>
            <table className="tabla-admin">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Imagen</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.length === 0 ? (
                  <tr>
                    <td colSpan="4">No hay categorías registradas.</td>
                  </tr>
                ) : (
                  categorias.map((categoria) => (
                    <tr key={categoria.id}>
                      <td>{categoria.id}</td>
                      <td>{categoria.nombre}</td>
                      <td>{categoria.imagenUrl ?? categoria.imagen ?? ''}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-admin btn-editar"
                          onClick={() => editarCategoria(categoria)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-admin btn-eliminar"
                          onClick={() => eliminarCategoria(categoria)}
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
            <h2>{idEditar === null ? 'Nueva Categoría' : 'Editar Categoría'}</h2>

            <form onSubmit={guardarCategoria} noValidate>
              <div className="form-admin">
                <div className="campo-form">
                  <label htmlFor="nombre-categoria">Nombre</label>
                  <input
                    type="text"
                    id="nombre-categoria"
                    maxLength="50"
                    value={form.nombre}
                    onChange={handleChange('nombre')}
                    onBlur={handleBlur('nombre')}
                    className={mostrarError('nombre') ? 'input-error' : ''}
                  />
                  <p className="mensaje-error">{mostrarError('nombre')}</p>
                </div>

                <div className="campo-form">
                  <label htmlFor="imagen-categoria">Imagen (opcional)</label>
                  <input
                    type="text"
                    id="imagen-categoria"
                    maxLength="200"
                    placeholder="/assets/images/..."
                    value={form.imagenUrl}
                    onChange={handleChange('imagenUrl')}
                    onBlur={handleBlur('imagenUrl')}
                    className={mostrarError('imagenUrl') ? 'input-error' : ''}
                  />
                  <p className="mensaje-error">{mostrarError('imagenUrl')}</p>
                </div>

                <div className="botones-form">
                  <button type="submit" className="btn-admin btn-guardar" disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Guardar categoría'}
                  </button>
                  <button
                    type="button"
                    className="btn-admin btn-limpiar"
                    onClick={limpiarFormulario}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </section>
        </>
      )}
    </main>
  )
}
