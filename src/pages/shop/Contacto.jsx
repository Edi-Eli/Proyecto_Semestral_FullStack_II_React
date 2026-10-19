import { useState } from 'react'
import { requisitosCorreo, requisitosRequerido } from '../../utils/camposFormulario.js'

function Contacto() {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [comentario, setComentario] = useState('')
  const [enviado, setEnviado] = useState(false)

  const erroresNombre = requisitosRequerido(nombre, 'El nombre es requerido.', 100)
  const erroresCorreo = requisitosCorreo(correo)
  const erroresComentario = requisitosRequerido(comentario, 'El comentario es requerido.', 500)

  function manejarSubmit(evento) {
    evento.preventDefault()
    if (erroresNombre.length || erroresCorreo.length || erroresComentario.length) return
    setEnviado(true)
  }

  function claseCampo(errores, valor) {
    if (errores.length) return 'form-control input-invalid'
    if (String(valor).length > 0) return 'form-control input-valid'
    return 'form-control'
  }

  return (
    <main>
      <h2 className="titulo-pagina">Contáctanos</h2>

      <div className="contacto-info">
        <p>
          ¿Tienes dudas sobre nuestros productos, cotizaciones o despachos?
          Escríbenos y te responderemos a la brevedad.
        </p>
      </div>

      {enviado ? (
        <div className="login-card text-center">
          <div className="alert alert-success" role="alert">
            ¡Mensaje enviado! Te responderemos pronto.
          </div>
          <button type="button" className="btn-form" onClick={() => { setEnviado(false); setNombre(''); setCorreo(''); setComentario('') }}>
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form className="contacto-card" onSubmit={manejarSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="nombre-contacto">
              Nombre <span className="obligatorio">*</span>
            </label>
            <input
              type="text" id="nombre-contacto" className={claseCampo(erroresNombre, nombre)}
              placeholder="Ej: María González" maxLength="100"
              value={nombre} onChange={(e) => setNombre(e.target.value)}
            />
            {erroresNombre.map((mensaje) => <small key={mensaje} className="error-msg">{mensaje}</small>)}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="correo-contacto">
              Correo <span className="obligatorio">*</span>
            </label>
            <input
              type="email" id="correo-contacto" className={claseCampo(erroresCorreo, correo)}
              placeholder="Ej: nombre@duoc.cl" maxLength="100"
              value={correo} onChange={(e) => setCorreo(e.target.value)}
            />
            {erroresCorreo.map((mensaje) => <small key={mensaje} className="error-msg">{mensaje}</small>)}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="comentario">
              Comentario <span className="obligatorio">*</span>
            </label>
            <textarea
              id="comentario" className={claseCampo(erroresComentario, comentario)} rows="5"
              placeholder="Escribe tu mensaje..." maxLength="500"
              value={comentario} onChange={(e) => setComentario(e.target.value)}
            ></textarea>
            <small className="text-muted">{comentario.length}/500</small>
            {erroresComentario.map((mensaje) => <small key={mensaje} className="error-msg">{mensaje}</small>)}
          </div>

          <div className="form-group">
            <button type="submit" className="btn-form">Enviar mensaje</button>
          </div>
        </form>
      )}
    </main>
  )
}

export default Contacto