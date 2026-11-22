import { Navigate, Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar.jsx'
import { useAuth } from '../../context/authContext.js'

function AdminLayout() {
  const { usuarioActivo } = useAuth()
  const rol = usuarioActivo?.tipoUsuario
  const puedeEntrar = rol === 'Administrador' || rol === 'Vendedor'

  if (!usuarioActivo || !puedeEntrar) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <AdminSidebar />
      <main className="admin-contenido flex-grow-1 p-4">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout