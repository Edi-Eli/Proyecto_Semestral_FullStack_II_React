import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppProviders from './context/AppProviders.jsx'
import PublicLayout from './components/common/PublicLayout.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'
import Home from './pages/shop/Home.jsx'
import Productos from './pages/shop/Productos.jsx'
import ProductoDetalle from './pages/shop/ProductoDetalle.jsx'
import Categorias from './pages/shop/Categorias.jsx'
import Ofertas from './pages/shop/Ofertas.jsx'
import Carrito from './pages/shop/Carrito.jsx'
import Checkout from './pages/shop/Checkout.jsx'
import PagoExitoso from './pages/shop/PagoExitoso.jsx'
import PagoError from './pages/shop/PagoError.jsx'
import Login from './pages/shop/Login.jsx'
import Registro from './pages/shop/Registro.jsx'
import Contacto from './pages/shop/Contacto.jsx'
import Nosotros from './pages/shop/Nosotros.jsx'
import Blogs from './pages/shop/Blogs.jsx'
import BlogDetalle from './pages/shop/BlogDetalle.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'
import AdminOrdenes from './admin/AdminOrdenes.jsx'
import AdminProductos from './admin/AdminProductos.jsx'
import AdminCriticos from './admin/AdminCriticos.jsx'
import AdminCategorias from './admin/AdminCategorias.jsx'
import AdminUsuarios from './admin/AdminUsuarios.jsx'
import AdminHistorial from './admin/AdminHistorial.jsx'
import AdminReportes from './admin/AdminReportes.jsx'
import AdminPerfil from './admin/AdminPerfil.jsx'

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/producto/:id" element={<ProductoDetalle />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/categorias/:id" element={<Categorias />} />
            <Route path="/ofertas" element={<Ofertas />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pago-exitoso" element={<PagoExitoso />} />
            <Route path="/pago-error" element={<PagoError />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:id" element={<BlogDetalle />} />
            <Route path="/contacto" element={<Contacto />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="ordenes" element={<AdminOrdenes />} />
            <Route path="productos" element={<AdminProductos />} />
            <Route path="productos/criticos" element={<AdminCriticos />} />
            <Route path="categorias" element={<AdminCategorias />} />
            <Route path="usuarios" element={<AdminUsuarios />} />
            <Route path="usuarios/:id/historial" element={<AdminHistorial />} />
            <Route path="reportes" element={<AdminReportes />} />
            <Route path="perfil" element={<AdminPerfil />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  )
}

export default App