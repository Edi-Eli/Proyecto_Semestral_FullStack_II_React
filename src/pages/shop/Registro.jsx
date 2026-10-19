import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext.js'
import { regiones, getComunas } from '../../data/regiones.js'
import {
  requisitosCorreo,
  requisitosContrasena,
  requisitosRun,
  requisitosRequerido,
} from '../../utils/camposFormulario.js'

function Registro() {
  const { registrar } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    run: '',
    nombre: '',
    apellidos: '',
    correo: '',
    password: '',
    fechaNacimiento: '',
    region: '',
    comuna: '',
    direccion: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
      ...(campo === 'region' ? { comuna: '' } : {}),
    }))
  }

  const comunas = form.region ? getComunas(form.region) : []

  const erroresRun = requisitosRun(form.run)
  const erroresNombre = requisitosRequerido(form.nombre, 'El nombre es requerido.', 50)
  const erroresApellidos = requisitosRequerido(form.apellidos, 'Los apellidos son requeridos.', 100)
  const erroresCorreo = requisitosCorreo(form.correo)
  const erroresPassword = requisitosContrasena(form.password)
  const erroresComuna = requisitosRequerido(form.comuna, 'Debes seleccionar una comuna.')
  const erroresDireccion = requisitosRequerido(form.direccion, 'La dirección es requerida.', 300)

  function manejarSubmit(evento) {
    evento.preventDefault()
    setErrorGeneral('')

    const hayErrores =
      erroresRun.length ||
      erroresNombre.length ||
      erroresApellidos.length ||
      erroresCorreo.length ||
      erroresPassword.length ||
      erroresComuna.length ||
      erroresDireccion.length ||
      !form.region

    if (hayErrores) return

    setEnviando(true)
    const region = regiones.find((r) => r.id === Number(form.region))
    const datos = {
      ...form,
      run: form.run.trim().toUpperCase(),
      region: region ? region.nombre : '',
      tipoUsuario: 'Cliente',
    }
    const resultado = registrar(datos)
    setEnviando(false)

    if (!resultado.ok) {
      setErrorGeneral(resultado.mensaje || 'No se pudo registrar el usuario.')
      return
    }

    navigate('/')
  }

  function claseCampo(errores, valor) {
    if (errores.length) return 'form-control input-invalid'
    if (String(valor).length > 0) return 'form-control input-valid'
    return 'form-control'
  }

  return (
    <main>
      <h2 className="titulo-pagina">Registro de Usuario</h2>

      <form className="form-card formulario-registro" onSubmit={manejarSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="run">RUN <span className="obligatorio">*</span></label>
          <input
            type="text" id="run" className={claseCampo(erroresRun, form.run)}
            placeholder="Ej: 19011022k" maxLength="9"
            value={form.run} onChange={(e) => actualizarCampo('run', e.target.value)}
          />
          {erroresRun.map((mensaje) => <small key={mensaje} className="error-msg">{mensaje}</small>)}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="nombre">Nombre <span className="obligatorio">*</span></label>
          <input
            type="text" id="nombre" className={claseCampo(erroresNombre, form.nombre)}
            placeholder="Ej: Juan" maxLength="50"
            value={form.nombre} onChange={(e) => actualizarCampo('nombre', e.target.value)}
          />
          {erroresNombre.map((mensaje) => <small key={mensaje} className="error-msg">{mensaje}</small>)}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="apellidos">Apellidos <span className="obligatorio">*</span></label>
          <input
            type="text" id="apellidos" className={claseCampo(erroresApellidos, form.apellidos)}
            placeholder="Ej: Pérez Soto" maxLength="100"
            value={form.apellidos} onChange={(e) => actualizarCampo('apellidos', e.target.value)}
          />
          {erroresApellidos.map((mensaje) => <small key={mensaje} className="error-msg">{mensaje}</small>)}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="correo">Correo <span className="obligatorio">*</span></label>
          <input
            type="email" id="correo" className={claseCampo(erroresCorreo, form.correo)}
            placeholder="Ej: nombre@duoc.cl" maxLength="100"
            value={form.correo} onChange={(e) => actualizarCampo('correo', e.target.value)}
          />
          {erroresCorreo.map((mensaje) => <small key={mensaje} className="error-msg">{mensaje}</small>)}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Contraseña <span className="obligatorio">*</span></label>
          <input
            type="password" id="password" className={claseCampo(erroresPassword, form.password)}
            placeholder="Entre 4 y 10 caracteres" maxLength="10"
            value={form.password} onChange={(e) => actualizarCampo('password', e.target.value)}
          />
          {erroresPassword.map((mensaje) => <small key={mensaje} className="error-msg">{mensaje}</small>)}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="fecha-nacimiento">Fecha de nacimiento</label>
          <input
            type="date" id="fecha-nacimiento" className="form-control"
            value={form.fechaNacimiento} onChange={(e) => actualizarCampo('fechaNacimiento', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="region">Región <span className="obligatorio">*</span></label>
          <select
            id="region"
            className={claseCampo([], form.region)}
            value={form.region}
            onChange={(e) => actualizarCampo('region', e.target.value)}
          >
            <option value="">Seleccione una región</option>
            {regiones.map((region) => (
              <option key={region.id} value={region.id}>{region.nombre}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="comuna">Comuna <span className="obligatorio">*</span></label>
          <select
            id="comuna"
            className={claseCampo(erroresComuna, form.comuna)}
            value={form.comuna}
            disabled={!form.region}
            onChange={(e) => actualizarCampo('comuna', e.target.value)}
          >
            <option value="">{form.region ? 'Seleccione una comuna' : 'Primero seleccione una región'}</option>
            {comunas.map((comuna) => (
              <option key={comuna} value={comuna}>{comuna}</option>
            ))}
          </select>
          {erroresComuna.map((mensaje) => <small key={mensaje} className="error-msg">{mensaje}</small>)}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="direccion">Dirección <span className="obligatorio">*</span></label>
          <textarea
            id="direccion" className={claseCampo(erroresDireccion, form.direccion)} rows="2"
            placeholder="Ej: Antonio Varas 666" maxLength="300"
            value={form.direccion} onChange={(e) => actualizarCampo('direccion', e.target.value)}
          ></textarea>
          {erroresDireccion.map((mensaje) => <small key={mensaje} className="error-msg">{mensaje}</small>)}
        </div>

        {errorGeneral && (
          <div className="alert alert-danger py-2" role="alert">
            {errorGeneral}
          </div>
        )}

        <div className="form-group">
          <button type="submit" className="btn-form" disabled={enviando}>
            {enviando ? 'Registrando...' : 'Registrarme'}
          </button>
        </div>

        <p className="login-enlace">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </main>
  )
}

export default Registro