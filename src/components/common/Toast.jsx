/**
 * Toast — aviso flotante (Bootstrap)
 * Se usa para el feedback "Producto agregado al carrito".
 */
export default function Toast({ mensaje, tipo = 'exito', onCerrar }) {
  if (!mensaje) return null

  const clase = tipo === 'error' ? 'alert-danger' : 'alert-success'

  return (
    <div
      className={`alert ${clase} shadow`}
      role="alert"
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 1080,
        minWidth: 260,
        maxWidth: '90vw',
      }}
    >
      <div className="d-flex align-items-center justify-content-between gap-3">
        <span>{mensaje}</span>
        <button
          type="button"
          className="btn-close btn-sm"
          aria-label="Cerrar"
          onClick={onCerrar}
        />
      </div>
    </div>
  )
}