import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/authContext.js'

/**
 * ProtectedRoute — exige una sesión activa (token JWT presente).
 * ------------------------------------------------------------------
 * Responsable: Edi.
 *
 * - Si el usuario está autenticado: renderiza `children` o el `<Outlet />`
 *   de las rutas anidadas.
 * - Si no hay sesión: redirige a `/login` guardando el origen en el state
 *   para poder volver tras iniciar sesión.
 *
 * Uso como ruta contenedora:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/mis-pedidos" element={<MisPedidos />} />
 *   </Route>
 */
export default function ProtectedRoute({ children, redirigirA = '/login' }) {
  const { estaAutenticado } = useAuth()
  const ubicacion = useLocation()

  if (!estaAutenticado) {
    return <Navigate to={redirigirA} replace state={{ desde: ubicacion.pathname }} />
  }

  return children ?? <Outlet />
}
