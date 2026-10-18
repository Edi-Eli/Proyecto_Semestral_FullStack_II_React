import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import "../assets/admin.css";

export default function AdminLayout() {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <Outlet />
        </div>
    );
}