# Ferretería Los Maestros — Frontend (React + Vite)

Aplicación web de la ferretería **Los Maestros** (La Serena) para la asignatura
*DSY1104 · Desarrollo FullStack II*. Es el **frontend** del proyecto semestral y consume
la API REST/JSON de un **backend Spring Boot (monolito)**.

> Regla del proyecto: no hay comunicación directa entre el frontend y la base de datos;
> **todo el tráfico viaja por API REST/JSON** y la sesión se autentica con **JWT**.

---

## 1. Tecnologías

| Capa | Herramienta |
|---|---|
| UI | React 19 + React Router 7 |
| Build / dev server | Vite 8 |
| Estilos | Bootstrap 5 + Bootstrap Icons |
| HTTP | `fetch` (capa propia en `src/api/client.js`) |
| Tests | Vitest + Testing Library (jsdom) |
| Lint | ESLint 10 |

---

## 2. Requisitos

- Node.js 18 o superior y npm.
- El **backend Spring Boot** corriendo (por defecto en `http://localhost:8080`).

---

## 3. Variables de entorno

El proyecto usa la variable `VITE_API_BASE_URL`. Hay una plantilla versionada:

```bash
cp .env.example .env
```

| Archivo | Contenido | ¿Se versiona? |
|---|---|---|
| `.env.example` | plantilla con la URL base | Sí |
| `.env` | valores locales de desarrollo | No (`.gitignore`) |

```env
# Local (backend en el equipo)
VITE_API_BASE_URL=http://localhost:8080

# Producción (backend en AWS detrás de un ALB con HTTPS)
# VITE_API_BASE_URL=https://api.tudominio.cl
```

Al cambiar de entorno solo se edita `VITE_API_BASE_URL`; el código no cambia.
Recuerde que el backend debe **permitir el CORS** del origen del front (con JWT en
cabecera no se usan cookies ni `credentials`).

---

## 4. Cómo levantar el proyecto

```bash
# 1) Instalar dependencias
npm install

# 2) (Opcional) configurar el entorno
cp .env.example .env

# 3) Levantar el frontend en modo desarrollo
npm run dev
```

El backend debe estar disponible en la URL de `VITE_API_BASE_URL` (por defecto
`http://localhost:8080`) para que el login, el catálogo, los pedidos y el contacto funcionen.

### Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | servidor de desarrollo (Vite) |
| `npm run build` | build de producción en `dist/` |
| `npm run preview` | sirve localmente el build de producción |
| `npm run lint` | análisis estático (ESLint) |
| `npm test` | tests en modo watch (Vitest) |
| `npm run coverage` | tests con reporte de cobertura |

---

## 5. Estructura del proyecto

```text
src/
├── api/                    # Capa de red (todo pasa por client.js)
│   ├── client.js           # fetch, BASE_URL, token Bearer, manejo de errores
│   ├── auth.js             # login, registro, validarSesion, logout
│   ├── usuarios.js         # CRUD de usuarios + cambiar estado
│   └── contacto.js         # mensajes de contacto
├── admin/                  # Vistas del panel (AdminUsuarios, AdminContactos, …)
├── components/             # common (Navbar, ProtectedRoute, RoleRoute, …) y admin
├── context/                # AuthProvider (JWT), CartProvider
├── pages/shop/             # Vistas públicas (Productos, Login, Contacto, …)
├── tests/                  # Tests por componente (ver §6)
└── utils/                  # validaciones y helpers
```

---

## 6. Tests

Los tests se organizan **por componente/feature** (no por integrante). Cada archivo lleva en su
encabezado un comentario con el responsable.

| Archivo | Cubre |
|---|---|
| `src/tests/auth.test.jsx` | `Login`, `Registro` (mockeando `api/auth.js`) |
| `src/tests/contacto.test.jsx` | `Contacto` (mockeando `api/contacto.js`) |
| `src/tests/sebas.test.jsx` | Catálogo (`Productos`, `ProductCard`, …) |
| `src/tests/zeus.test.jsx` | Carrito y administración |

```bash
npx vitest run        # ejecuta los tests una vez
npm test              # modo watch
```

---

## 7. Autores y aportes

Proyecto desarrollado por tres integrantes. La distribución de responsabilidades del frontend:

| Integrante | Ámbito | Aportes principales |
|---|---|---|
| **Sebas** | Catálogo y productos | `Productos`, `ProductoDetalle`, `ProductCard`, `Ofertas`, `Categorías`, paginación/búsqueda/filtros del catálogo |
| **Edi** | Autenticación, usuarios y contacto | Capa de red (`api/client.js`, `api/auth.js`, `api/usuarios.js`, `api/contacto.js`), `AuthProvider` con JWT, `ProtectedRoute`/`RoleRoute`, `Login`, `Registro`, `AdminUsuarios`, `AdminContactos`, tests de auth/contacto, README |
| **Zeus** | Carrito, checkout y pedidos | `CartProvider`, `Carrito`, `Checkout`, `AdminOrdenes`, panel de administración y reportes |

> Documentación detallada de los cambios del frontend de **Edi**: ver el archivo
> `05_Documentacion_Edi_Frontend.md` en la raíz del proyecto.
