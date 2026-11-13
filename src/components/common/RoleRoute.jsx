import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/authContext.js'
import ProtectedRoute from './ProtectedRoute.jsx'

/**
 * RoleRoute — exige sesión activa Y un rol permitido.
 * ------------------------------------------------------------------
 * Responsable: Edi.
 *
 * Se apoya en <ProtectedRoute> para la autenticación y agrega la verificación
 * del rol con `tieneRol()`. Si hay sesión pero el rol no está permitido,
 * redirige a `sinAccesoA` (por defecto "/").
 *
 * Uso:
 *   <Route path="/admin" element={<RoleRoute roles={['Administrador']}><AdminLayout /></RoleRoute>}>
 */
export default function RoleRoute({ roles = [], children, sinAccesoA = '/' }) {
  const { tieneRol } = useAuth()

  return (
    <ProtectedRoute>
      {tieneRol(roles) ? children ?? <Outlet /> : <Navigate to={sinAccesoA} replace />}
    </ProtectedRoute>
  )
}
