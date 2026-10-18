import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppProviders from './context/AppProviders.jsx'
import PublicLayout from './components/common/PublicLayout.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'
import Home from './pages/shop/Home.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<PlaceholderPage titulo="Productos" />} />
            <Route path="/producto/:id" element={<PlaceholderPage titulo="Detalle Producto" />} />
            <Route path="/categorias" element={<PlaceholderPage titulo="Categorías" />} />
            <Route path="/categorias/:id" element={<PlaceholderPage titulo="Categoría" />} />
            <Route path="/ofertas" element={<PlaceholderPage titulo="Ofertas" />} />
            <Route path="/carrito" element={<PlaceholderPage titulo="Carrito de Compras" />} />
            <Route path="/checkout" element={<PlaceholderPage titulo="Checkout" />} />
            <Route path="/pago-exitoso" element={<PlaceholderPage titulo="Pago Exitoso" />} />
            <Route path="/pago-error" element={<PlaceholderPage titulo="Error de Pago" />} />
            <Route path="/login" element={<PlaceholderPage titulo="Iniciar Sesión" />} />
            <Route path="/registro" element={<PlaceholderPage titulo="Registro" />} />
            <Route path="/nosotros" element={<PlaceholderPage titulo="Nosotros" />} />
            <Route path="/blogs" element={<PlaceholderPage titulo="Blogs" />} />
            <Route path="/blogs/:id" element={<PlaceholderPage titulo="Detalle Blog" />} />
            <Route path="/contacto" element={<PlaceholderPage titulo="Contacto" />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<PlaceholderPage titulo="Dashboard Admin" />} />
            <Route path="ordenes" element={<PlaceholderPage titulo="Órdenes" />} />
            <Route path="productos" element={<PlaceholderPage titulo="Productos Admin" />} />
            <Route path="productos/criticos" element={<PlaceholderPage titulo="Productos Críticos" />} />
            <Route path="categorias" element={<PlaceholderPage titulo="Categorías Admin" />} />
            <Route path="usuarios" element={<PlaceholderPage titulo="Usuarios Admin" />} />
            <Route path="usuarios/:id/historial" element={<PlaceholderPage titulo="Historial de Compras" />} />
            <Route path="reportes" element={<PlaceholderPage titulo="Reportes" />} />
            <Route path="perfil" element={<PlaceholderPage titulo="Perfil" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  )
}

export default App