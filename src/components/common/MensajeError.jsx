/**
 * Mensaje de error reutilizable — Ferretería Los Maestros
 * Responsable: Sebas
 */
export default function MensajeError({
  mensaje = 'Ocurrió un error al cargar la información.',
  onReintentar,
}) {
  return (
    <div className="alert alert-danger text-center" role="alert">
      <p className="mb-2">{mensaje}</p>
      {onReintentar && (
        <button type="button" className="btn btn-outline-danger btn-sm" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  )
}
