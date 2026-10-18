import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MetricCard from "../components/admin/MetricCard";
import AdminCriticos from "../admin/AdminCriticos";
import AdminProductos from "../admin/AdminProductos";
import { crudService } from "../services/crudService";

describe("zeus", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it("MetricCard muestra las props titulo y valor", () => {
        render(<MetricCard titulo="Compras" valor={1234} />);
        expect(screen.getByText("Compras")).toBeInTheDocument();
        expect(screen.getByText("1234")).toBeInTheDocument();
    });

    it("AdminCriticos solo muestra productos con stock <= stockCritico", () => {
        localStorage.setItem(
            "productosAdmin",
            JSON.stringify([
                { codigo: "OK1", nombre: "Producto Sano", descripcion: "", precio: 1000, stock: 50, stockCritico: 5, categoria: "Accesorios", imagen: "" },
                { codigo: "CRI1", nombre: "Producto Critico", descripcion: "", precio: 2000, stock: 2, stockCritico: 5, categoria: "Accesorios", imagen: "" }
            ])
        );

        render(
            <MemoryRouter>
                <AdminCriticos />
            </MemoryRouter>
        );

        expect(screen.getByText("Producto Critico")).toBeInTheDocument();
        expect(screen.queryByText("Producto Sano")).not.toBeInTheDocument();
    });

    it("AdminProductos llama a crudService.createProducto al guardar", () => {
        const espia = vi.spyOn(crudService, "createProducto").mockReturnValue([]);

        render(
            <MemoryRouter>
                <AdminProductos />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText("Codigo producto"), { target: { value: "FER100" } });
        fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Producto Test" } });
        fireEvent.change(screen.getByLabelText("Precio"), { target: { value: "15000" } });
        fireEvent.change(screen.getByLabelText("Stock"), { target: { value: "10" } });
        fireEvent.change(screen.getByLabelText("Categoria"), { target: { value: "Accesorios" } });
        fireEvent.click(screen.getByText("Guardar producto"));

        expect(espia).toHaveBeenCalledTimes(1);
        expect(espia).toHaveBeenCalledWith(
            expect.objectContaining({ codigo: "FER100", nombre: "Producto Test" })
        );
    });
});