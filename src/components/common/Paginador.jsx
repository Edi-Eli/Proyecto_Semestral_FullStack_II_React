export default function Paginador({ page, totalPages, onCambiar }) {
  if (totalPages <= 1) return null

  return (
    <nav className="d-flex justify-content-center align-items-center gap-3 mt-4" aria-label="Paginación">
      <button
        type="button"
        className="btn btn-outline-dark btn-sm"
        disabled={page <= 0}
        onClick={() => onCambiar(page - 1)}
      >
        Anterior
      </button>
      <span className="text-muted">
        Página {page + 1} de {totalPages}
      </span>
      <button
        type="button"
        className="btn btn-outline-dark btn-sm"
        disabled={page >= totalPages - 1}
        onClick={() => onCambiar(page + 1)}
      >
        Siguiente
      </button>
    </nav>
  )
}
