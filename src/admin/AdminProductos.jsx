import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as productosApi from '../api/productos.js'
import { formatearPrecioCLP } from '../utils/productoHelpers.js'
import Loader from '../components/common/Loader.jsx'
import MensajeError from '../components/common/MensajeError.jsx'
import { requerido, maxCaracteres, soloEnteros, soloDecimales } from '../utils/validaciones.js'

const TAMANO_LISTA = 200

const FORM_VACIO = {
  codigo: '',
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  stockCritico: '',
  categoriaId: '',
  imagen: '',
}

function soloDecimalPositivo(valor) {
  if (!soloDecimales(valor)) return false
  return Number(String(valor).replace(',', '.')) >= 0
}

function validarCampo(campo, valor) {
  const v = String(valor).trim()
  switch (campo) {
    case 'codigo':
      if (!requerido(v)) return 'El código es requerido.'
      if (v.length < 3) return 'El código debe tener al menos 3 caracteres.'
      return ''
    case 'nombre':
      if (!requerido(v)) return 'El nombre es requerido.'
      if (!maxCaracteres(v, 100)) return 'El nombre no puede superar los 100 caracteres.'
      return ''
    case 'descripcion':
      if (v !== '' && !maxCaracteres(v, 500))
        return 'La descripción no puede superar los 500 caracteres.'
      return ''
    case 'precio':
      if (!requerido(v)) return 'El precio es requerido.'
      if (!soloDecimalPositivo(v)) return 'El precio debe ser un número mayor o igual a 0.'
      return ''
    case 'stock':
      if (!requerido(v)) return 'El stock es requerido.'
      if (!soloEnteros(v)) return 'El stock debe ser un número entero.'
      if (Number(v) < 0) return 'El stock mínimo es 0.'
      return ''
    case 'stockCritico':
      if (v !== '' && !soloEnteros(v)) return 'El stock crítico debe ser un número entero.'
      if (v !== '' && Number(v) < 0) return 'El stock crítico mínimo es 0.'
      return ''
    case 'categoriaId':
      if (!requerido(v)) return 'Debe seleccionar una categoría.'
      return ''
    default:
      return ''
  }
}

export default function AdminProductos() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
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
    Promise.all([
      productosApi.listar({ size: TAMANO_LISTA }),
      productosApi.listarCategorias(),
    ])
      .then(([pagina, cats]) => {
        if (!vigente) return
        setProductos(pagina?.content || [])
        setCategorias(cats || [])
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
    setErrores((anterior) => ({ ...anterior, [campo]: validarCampo(campo, valor) }))
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

  const editarProducto = (id) => {
    const producto = productos.find((p) => p.id === Number(id))
    if (!producto) return
    setForm({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: String(producto.precio),
      stock: String(producto.stock),
      stockCritico: String(producto.stockCritico),
      categoriaId: String(producto.categoriaId),
      imagen: producto.imagen || '',
    })
    setIdEditar(producto.id)
    setErrores({})
    setTocado({})
    setEnviado(false)
    setErrorAccion(null)
  }

  const eliminarProducto = async (id) => {
    const producto = productos.find((p) => p.id === Number(id))
    if (!producto) return
    if (!window.confirm(`¿Desea eliminar el producto ${producto.nombre}?`)) return
    try {
      setErrorAccion(null)
      await productosApi.eliminarProducto(id)
      setCargando(true)
      setRecargar((n) => n + 1)
    } catch (err) {
      setErrorAccion(err.message)
    }
  }

  const guardarProducto = async (evento) => {
    evento.preventDefault()
    setEnviado(true)

    const nuevosErrores = {}
    Object.keys(FORM_VACIO).forEach((campo) => {
      if (campo === 'imagen') return
      nuevosErrores[campo] = validarCampo(campo, form[campo])
    })
    setErrores(nuevosErrores)

    if (Object.values(nuevosErrores).some((m) => m !== '')) return

    const producto = {
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio.replace(',', '.')),
      stock: Number(form.stock),
      stockCritico: form.stockCritico.trim() === '' ? 0 : Number(form.stockCritico),
      categoriaId: Number(form.categoriaId),
      imagen: form.imagen.trim(),
      enOferta: false,
      precioOferta: 0,
    }

    try {
      setGuardando(true)
      setErrorAccion(null)
      if (idEditar !== null) {
        await productosApi.actualizarProducto(idEditar, producto)
      } else {
        await productosApi.crearProducto(producto)
      }
      setCargando(true)
      setRecargar((n) => n + 1)

      if (producto.stock <= producto.stockCritico) {
        window.alert(
          `El producto ${producto.nombre} tiene stock bajo o crítico (${producto.stock} unidades).`,
        )
      }
      limpiarFormulario()
    } catch (err) {
      setErrorAccion(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const nombreCategoria = (id) => {
    const cat = categorias.find((c) => Number(c.id) === Number(id))
    return cat ? cat.nombre : '-'
  }

  return (
    <main className="admin-contenido">
      <h1>Mantenedor de Productos</h1>

      <section className="accesos-rapidos">
        <Link to="/admin/productos/criticos">Productos Críticos</Link>
        <Link to="/admin/reportes">Reportes</Link>
      </section>

      {errorAccion && <MensajeError mensaje={errorAccion} />}

      {cargando && <Loader mensaje="Cargando productos..." />}

      {!cargando && error && <MensajeError mensaje={error} onReintentar={reintentar} />}

      {!cargando && !error && (
        <>
          <section className="seccion-tabla">
            <h2>Listado de productos</h2>
            <table className="tabla-admin">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Stock crítico</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.length === 0 ? (
                  <tr>
                    <td colSpan="7">No hay productos registrados.</td>
                  </tr>
                ) : (
                  productos.map((producto) => (
                    <tr key={producto.id}>
                      <td>{producto.codigo}</td>
                      <td>{producto.nombre}</td>
                      <td>{producto.categoriaNombre || nombreCategoria(producto.categoriaId)}</td>
                      <td>{formatearPrecioCLP(producto.precio)}</td>
                      <td
                        className={producto.stock <= producto.stockCritico ? 'stock-bajo' : ''}
                      >
                        {producto.stock}
                      </td>
                      <td>{producto.stockCritico}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-admin btn-editar"
                          onClick={() => editarProducto(producto.id)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-admin btn-eliminar"
                          onClick={() => eliminarProducto(producto.id)}
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
            <h2>{idEditar === null ? 'Nuevo producto' : 'Editar producto'}</h2>

            <form onSubmit={guardarProducto} noValidate>
              <div className="form-admin">
                <div className="campo-form">
                  <label htmlFor="codigo-producto">Código producto</label>
                  <input
                    type="text"
                    id="codigo-producto"
                    value={form.codigo}
                    onChange={handleChange('codigo')}
                    onBlur={handleBlur('codigo')}
                    className={mostrarError('codigo') ? 'input-error' : ''}
                  />
                  <p className="mensaje-error">{mostrarError('codigo')}</p>
                </div>

                <div className="campo-form">
                  <label htmlFor="nombre-producto">Nombre</label>
                  <input
                    type="text"
                    id="nombre-producto"
                    maxLength="100"
                    value={form.nombre}
                    onChange={handleChange('nombre')}
                    onBlur={handleBlur('nombre')}
                    className={mostrarError('nombre') ? 'input-error' : ''}
                  />
                  <p className="mensaje-error">{mostrarError('nombre')}</p>
                </div>

                <div className="campo-form">
                  <label htmlFor="descripcion-producto">Descripción (opcional)</label>
                  <textarea
                    id="descripcion-producto"
                    rows="3"
                    maxLength="500"
                    value={form.descripcion}
                    onChange={handleChange('descripcion')}
                    onBlur={handleBlur('descripcion')}
                    className={mostrarError('descripcion') ? 'input-error' : ''}
                  />
                  <p className="mensaje-error">{mostrarError('descripcion')}</p>
                </div>

                <div className="campo-form">
                  <label htmlFor="precio-producto">Precio</label>
                  <input
                    type="text"
                    id="precio-producto"
                    inputMode="decimal"
                    placeholder="0"
                    value={form.precio}
                    onChange={handleChange('precio')}
                    onBlur={handleBlur('precio')}
                    className={mostrarError('precio') ? 'input-error' : ''}
                  />
                  <p className="mensaje-error">{mostrarError('precio')}</p>
                </div>

                <div className="campo-form">
                  <label htmlFor="stock-producto">Stock</label>
                  <input
                    type="text"
                    id="stock-producto"
                    inputMode="numeric"
                    placeholder="0"
                    value={form.stock}
                    onChange={handleChange('stock')}
                    onBlur={handleBlur('stock')}
                    className={mostrarError('stock') ? 'input-error' : ''}
                  />
                  <p className="mensaje-error">{mostrarError('stock')}</p>
                </div>

                <div className="campo-form">
                  <label htmlFor="stock-critico-producto">Stock crítico (opcional)</label>
                  <input
                    type="text"
                    id="stock-critico-producto"
                    inputMode="numeric"
                    placeholder="0"
                    value={form.stockCritico}
                    onChange={handleChange('stockCritico')}
                    onBlur={handleBlur('stockCritico')}
                    className={mostrarError('stockCritico') ? 'input-error' : ''}
                  />
                  <p className="mensaje-error">{mostrarError('stockCritico')}</p>
                </div>

                <div className="campo-form">
                  <label htmlFor="categoria-producto">Categoría</label>
                  <select
                    id="categoria-producto"
                    value={form.categoriaId}
                    onChange={handleChange('categoriaId')}
                    onBlur={handleBlur('categoriaId')}
                    className={mostrarError('categoriaId') ? 'input-error' : ''}
                  >
                    <option value="">Seleccione una categoría</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                  <p className="mensaje-error">{mostrarError('categoriaId')}</p>
                </div>

                <div className="campo-form">
                  <label htmlFor="imagen-producto">Imagen (opcional)</label>
                  <input
                    type="text"
                    id="imagen-producto"
                    placeholder="ruta o url de la imagen"
                    value={form.imagen}
                    onChange={handleChange('imagen')}
                  />
                  <p className="mensaje-error"></p>
                </div>

                <div className="botones-form">
                  <button type="submit" className="btn-admin btn-guardar" disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Guardar producto'}
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
