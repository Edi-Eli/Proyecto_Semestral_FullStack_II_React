import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminOrdenes from "./admin/AdminOrdenes";
import AdminProductos from "./admin/AdminProductos";
import AdminCriticos from "./admin/AdminCriticos";
import AdminCategorias from "./admin/AdminCategorias";
import AdminUsuarios from "./admin/AdminUsuarios";
import AdminHistorial from "./admin/AdminHistorial";
import AdminReportes from "./admin/AdminReportes";
import AdminPerfil from "./admin/AdminPerfil";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Ferretería Los Maestros</h1>} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;