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
import PlaceholderPage from './pages/PlaceholderPage.jsx'

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
            <Route path="/login" element={<PlaceholderPage titulo="Iniciar Sesión" />} />
            <Route path="/registro" element={<PlaceholderPage titulo="Registro" />} />
            <Route path="/nosotros" element={<PlaceholderPage titulo="Nosotros" />} />
            <Route path="/blogs" element={<PlaceholderPage titulo="Blogs" />} />
            <Route path="/blogs/:id" element={<PlaceholderPage titulo="Detalle Blog" />} />
            <Route path="/contacto" element={<PlaceholderPage titulo="Contacto" />} />
            <Route path="/productos" element={<PlaceholderPage titulo="Productos" />} />
            <Route path="/producto/:id" element={<PlaceholderPage titulo="Detalle Producto" />} />
            <Route path="/categorias" element={<PlaceholderPage titulo="Categorías" />} />
            <Route path="/categorias/:id" element={<PlaceholderPage titulo="Categoría" />} />
            <Route path="/ofertas" element={<PlaceholderPage titulo="Ofertas" />} />
            <Route path="/carrito" element={<PlaceholderPage titulo="Carrito de Compras" />} />
            <Route path="/checkout" element={<PlaceholderPage titulo="Checkout" />} />
            <Route path="/pago-exitoso" element={<PlaceholderPage titulo="Pago Exitoso" />} />
            <Route path="/pago-error" element={<PlaceholderPage titulo="Error de Pago" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:id" element={<BlogDetalle />} />
            <Route path="/contacto" element={<Contacto />} />
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
