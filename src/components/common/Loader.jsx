export default function Loader({ mensaje = 'Cargando...' }) {
  return (
    <div className="text-center my-4" role="status">
      <div className="spinner-border text-secondary" aria-hidden="true"></div>
      <p className="mt-2 text-muted mb-0">{mensaje}</p>
    </div>
  )
}
