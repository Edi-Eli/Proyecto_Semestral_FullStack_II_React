import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext.js'
import { requisitosCorreo, requisitosContrasena } from '../../utils/camposFormulario.js'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')

  const erroresCorreo = requisitosCorreo(correo)
  const erroresContrasena = requisitosContrasena(contrasena)

  async function manejarSubmit(evento) {
    evento.preventDefault()
    setErrorGeneral('')

    if (erroresCorreo.length > 0 || erroresContrasena.length > 0) {
      return
    }

    setEnviando(true)
    let resultado
    try {
      resultado = await login(correo, contrasena)
    } finally {
      setEnviando(false)
    }

    if (!resultado.ok) {
      setErrorGeneral(resultado.mensaje || 'Correo o contraseña incorrectos.')
      return
    }

    // Si se llegó aquí redirigido desde una ruta protegida, volver a ella.
    const destino = location.state?.desde
    if (destino) {
      navigate(destino, { replace: true })
    } else if (resultado.usuario?.tipoUsuario === 'Administrador') {
      navigate('/admin')
    } else {
      navigate('/')
    }
  }

  const claseCorreo = erroresCorreo.length ? 'form-control input-invalid' : correo ? 'form-control input-valid' : 'form-control'
  const claseContrasena = erroresContrasena.length ? 'form-control input-invalid' : contrasena ? 'form-control input-valid' : 'form-control'

  return (
    <main>
      <h2 className="titulo-pagina">Iniciar Sesión</h2>

      <form className="login-card" onSubmit={manejarSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="correo-login">
            Correo <span className="obligatorio">*</span>
          </label>
          <input
            type="email"
            id="correo-login"
            className={claseCorreo}
            placeholder="Ej: nombre@duoc.cl"
            maxLength="100"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          {erroresCorreo.map((mensaje) => (
            <small key={mensaje} className="error-msg">{mensaje}</small>
          ))}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="contrasena-login">
            Contraseña <span className="obligatorio">*</span>
          </label>
          <input
            type="password"
            id="contrasena-login"
            className={claseContrasena}
            placeholder="Entre 4 y 10 caracteres"
            maxLength="10"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
          {erroresContrasena.map((mensaje) => (
            <small key={mensaje} className="error-msg">{mensaje}</small>
          ))}
        </div>

        {errorGeneral && (
          <div className="alert alert-danger py-2" role="alert">
            {errorGeneral}
          </div>
        )}

        <div className="form-group">
          <button type="submit" className="btn-form" disabled={enviando}>
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>

        <p className="login-enlace">
          ¿Aún no tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </form>
    </main>
  )
}

export default Login