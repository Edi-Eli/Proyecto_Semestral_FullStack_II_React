import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as productosApi from '../api/productos.js'
import { formatearPrecioCLP } from '../utils/formato.js'
import { nombreCategoria } from '../utils/productoHelpers.js'
import Loader from '../components/common/Loader.jsx'
import MensajeError from '../components/common/MensajeError.jsx'
import { useAuth } from '../context/authContext.js'
import { requerido, maxCaracteres, soloEnteros, soloDecimales } from '../utils/validaciones.js'

const TAMANO_LISTA = 200

const FORM_VACIO = {
  codigo: '',
  nombre: '',
  descripcion: '',
  marca: '',
  unidad: '',
  precioCompra: '',
  precio: '',
  enOferta: false,
  precioOferta: '',
  stock: '',
  stockCritico: '',
  categoriaId: '',
  subcategoriaId: '',
  imagen: '',
  activo: true,
}

function soloDecimalPositivo(valor) {
  if (!soloDecimales(valor)) return false
  return Number(String(valor).replace(',', '.')) >= 0
}

function validarCampo(campo, valor, form = {}) {
  const v = String(valor ?? '').trim()
  switch (campo) {
    case 'codigo':
      if (!requerido(v)) return 'El código es requerido.'
      if (v.length < 3) return 'El código debe tener al menos 3 caracteres.'
      if (!maxCaracteres(v, 20)) return 'El código no puede superar los 20 caracteres.'
      return ''
    case 'nombre':
      if (!requerido(v)) return 'El nombre es requerido.'
      if (!maxCaracteres(v, 150)) return 'El nombre no puede superar los 150 caracteres.'
      return ''
    case 'descripcion':
      if (v !== '' && !maxCaracteres(v, 500))
        return 'La descripción no puede superar los 500 caracteres.'
      return ''
    case 'marca':
      if (v !== '' && !maxCaracteres(v, 80)) return 'La marca no puede superar los 80 caracteres.'
      return ''
    case 'unidad':
      if (v !== '' && !maxCaracteres(v, 30)) return 'La unidad no puede superar los 30 caracteres.'
      return ''
    case 'precioCompra':
      if (!requerido(v)) return 'El precio de compra es requerido.'
      if (!soloDecimalPositivo(v)) return 'El precio de compra debe ser un número mayor o igual a 0.'
      return ''
    case 'precio':
      if (!requerido(v)) return 'El precio es requerido.'
      if (!soloDecimalPositivo(v)) return 'El precio debe ser un número mayor o igual a 0.'
      return ''
    case 'precioOferta':
      if (form.enOferta) {
        if (!requerido(v)) return 'El precio de oferta es requerido cuando el producto está en oferta.'
        if (!soloDecimalPositivo(v)) return 'El precio de oferta debe ser un número mayor o igual a 0.'
        if (Number(String(v).replace(',', '.')) <= 0) return 'El precio de oferta debe ser mayor que 0.'
      }
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
    case 'subcategoriaId':
      if (!requerido(v)) return 'Debe seleccionar una subcategoría.'
      return ''
    default:
      return ''
  }
}

export default function AdminProductos() {
  const { usuarioActivo } = useAuth()
  const esAdmin = usuarioActivo?.tipoUsuario === 'Administrador'
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
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
      productosApi.listarSubcategorias(),
    ])
      .then(([pagina, cats, subs]) => {
        if (!vigente) return
        setProductos(pagina?.content || [])
        setCategorias(cats || [])
        setSubcategorias(subs || [])
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

  const subcategoriasFiltradas = subcategorias.filter(
    (subcategoria) => String(subcategoria.categoriaId) === String(form.categoriaId),
  )

  const handleChange = (campo) => (evento) => {
    const valor = evento.target.value
    const siguiente = { ...form, [campo]: valor }
    if (campo === 'categoriaId') {
      siguiente.subcategoriaId = ''
    }
    setForm(siguiente)
    setErrores((anterior) => ({
      ...anterior,
      [campo]: validarCampo(campo, valor, siguiente),
      ...(campo === 'categoriaId' ? { subcategoriaId: '' } : {}),
    }))
  }

  const handleCheckboxChange = (campo) => (evento) => {
    const valor = evento.target.checked
    const siguiente = { ...form, [campo]: valor }
    setForm(siguiente)
    setErrores((anterior) => ({
      ...anterior,
      [campo]: validarCampo(campo, valor, siguiente),
      ...(campo === 'enOferta' ? { precioOferta: validarCampo('precioOferta', form.precioOferta, siguiente) } : {}),
    }))
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
      codigo: producto.codigo ?? '',
      nombre: producto.nombre ?? '',
      descripcion: producto.descripcion ?? '',
      marca: producto.marca ?? '',
      unidad: producto.unidad ?? '',
      precioCompra: producto.precioCompra != null ? String(producto.precioCompra) : '',
      precio: producto.precio != null ? String(producto.precio) : '',
      enOferta: Boolean(producto.enOferta),
      precioOferta: producto.precioOferta != null ? String(producto.precioOferta) : '',
      stock: producto.stock != null ? String(producto.stock) : '',
      stockCritico: producto.stockCritico != null ? String(producto.stockCritico) : '',
      categoriaId: producto.categoriaId != null ? String(producto.categoriaId) : '',
      subcategoriaId: producto.subcategoriaId != null ? String(producto.subcategoriaId) : '',
      imagen: producto.imagen ?? '',
      activo: producto.activo !== false,
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
      if (campo === 'imagen' || campo === 'activo' || campo === 'enOferta') return
      nuevosErrores[campo] = validarCampo(campo, form[campo], form)
    })
    if (!form.enOferta) {
      nuevosErrores.precioOferta = ''
    }
    setErrores(nuevosErrores)

    if (Object.values(nuevosErrores).some((m) => m !== '')) return

    const producto = {
      codigo: form.codigo.trim().toUpperCase(),
      subcategoriaId: Number(form.subcategoriaId),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      marca: form.marca.trim() || null,
      unidad: form.unidad.trim() || null,
      precioCompra: Number(String(form.precioCompra).replace(',', '.')),
      precio: Number(String(form.precio).replace(',', '.')),
      enOferta: Boolean(form.enOferta),
      precioOferta: form.enOferta ? Number(String(form.precioOferta).replace(',', '.')) : null,
      stock: Number(form.stock),
      stockCritico: form.stockCritico.trim() === '' ? 0 : Number(form.stockCritico),
      imagen: form.imagen.trim() || null,
      activo: Boolean(form.activo),
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
                      <td>{producto.categoriaNombre || nombreCategoria(categorias, producto.categoriaId)}</td>
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
                        {esAdmin && (
                          <button
                            type="button"
                            className="btn-admin btn-eliminar"
                            onClick={() => eliminarProducto(producto.id)}
                          >
                            Eliminar
                          </button>
                        )}
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
                  <label htmlFor="marca-producto">Marca (opcional)</label>
                  <input
                    type="text"
                    id="marca-producto"
                    maxLength="80"
                    value={form.marca}
                    onChange={handleChange('marca')}
                    onBlur={handleBlur('marca')}
                    className={mostrarError('marca') ? 'input-error' : ''}
                  />
                  <p className="mensaje-error">{mostrarError('marca')}</p>
                </div>

                <div className="campo-form">
                  <label htmlFor="unidad-producto">Unidad (opcional)</label>
                  <input
                    type="text"
                    id="unidad-producto"
                    maxLength="30"
                    placeholder="Ej: saco, caja, unidad"
                    value={form.unidad}
                    onChange={handleChange('unidad')}
                    onBlur={handleBlur('unidad')}
                    className={mostrarError('unidad') ? 'input-error' : ''}
                  />
                  <p className="mensaje-error">{mostrarError('unidad')}</p>
                </div>

                <div className="campo-form">
                  <label htmlFor="precio-compra-producto">Precio compra</label>
                  <input
                    type="text"
                    id="precio-compra-producto"
                    inputMode="decimal"
                    placeholder="0"
                    value={form.precioCompra}
                    onChange={handleChange('precioCompra')}
                    onBlur={handleBlur('precioCompra')}
                    className={mostrarError('precioCompra') ? 'input-error' : ''}
                  />
                  <p className="mensaje-error">{mostrarError('precioCompra')}</p>
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
                  <label htmlFor="en-oferta-producto" className="form-check-label">
                    <input
                      type="checkbox"
                      id="en-oferta-producto"
                      className="form-check-input me-2"
                      checked={form.enOferta}
                      onChange={handleCheckboxChange('enOferta')}
                    />
                    En oferta
                  </label>
                </div>

                <div className="campo-form">
                  <label htmlFor="precio-oferta-producto">Precio oferta</label>
                  <input
                    type="text"
                    id="precio-oferta-producto"
                    inputMode="decimal"
                    placeholder="0"
                    disabled={!form.enOferta}
                    value={form.precioOferta}
                    onChange={handleChange('precioOferta')}
                    onBlur={handleBlur('precioOferta')}
                    className={mostrarError('precioOferta') ? 'input-error' : ''}
                  />
                  <p className="mensaje-error">{mostrarError('precioOferta')}</p>
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
                  <label htmlFor="subcategoria-producto">Subcategoría</label>
                  <select
                    id="subcategoria-producto"
                    value={form.subcategoriaId}
                    onChange={handleChange('subcategoriaId')}
                    onBlur={handleBlur('subcategoriaId')}
                    disabled={!form.categoriaId}
                    className={mostrarError('subcategoriaId') ? 'input-error' : ''}
                  >
                    <option value="">Seleccione una subcategoría</option>
                    {subcategoriasFiltradas.map((subcategoria) => (
                      <option key={subcategoria.id} value={subcategoria.id}>
                        {subcategoria.nombre}
                      </option>
                    ))}
                  </select>
                  <p className="mensaje-error">{mostrarError('subcategoriaId')}</p>
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

                <div className="campo-form">
                  <label htmlFor="activo-producto" className="form-check-label">
                    <input
                      type="checkbox"
                      id="activo-producto"
                      className="form-check-input me-2"
                      checked={form.activo}
                      onChange={handleCheckboxChange('activo')}
                    />
                    Activo
                  </label>
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
