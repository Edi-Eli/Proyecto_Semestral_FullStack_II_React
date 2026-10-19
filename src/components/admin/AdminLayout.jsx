import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar.jsx'

function AdminLayout() {
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