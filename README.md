# NobleStep 👟

Sistema completo de gestión de inventario y ventas de calzado con e-commerce integrado.

## 🚀 Stack Tecnológico

```
Backend:    .NET 8 + MySQL + Entity Framework Core
Admin:      Angular 18 + Bootstrap 5
E-commerce: Angular 18 + CSS Moderno
Deploy:     Railway + Vercel
```

## ✨ Características

### 🎯 Sistema Administrativo
- Dashboard con métricas en tiempo real
- Gestión de productos, clientes, proveedores
- Control de ventas y compras
- Reportes exportables (PDF/Excel)
- Gestión de usuarios y roles
- Tema claro/oscuro

### 🛍️ E-commerce
- Catálogo con filtros avanzados
- Carrito de compras
- Autenticación de clientes
- Diseño responsive moderno
- Proceso de checkout completo
- Historial de pedidos

## 📋 Requisitos

- Node.js 18+
- .NET 8.0 SDK
- MySQL 8.0+
- Git

## 🚀 Instalación Local

### 1. Clonar Repositorio
```bash
git clone https://github.com/tu-usuario/noblestep.git
cd noblestep
```

### 2. Base de Datos
```bash
mysql -u root -p < database/BASE-DATOS-DEFINITIVA.sql
```

### 3. Backend
```bash
cd backend
# Configurar appsettings.json con tu cadena de conexión
dotnet restore
dotnet run
# API en http://localhost:5000
# Swagger en http://localhost:5000/swagger
```

### 4. Frontend Admin
```bash
cd frontend
npm install
npm start
# Admin en http://localhost:4200
```

### 5. Frontend E-commerce
```bash
cd frontend
npm run start:ecommerce
# E-commerce en http://localhost:4201
```

## 👤 Credenciales por Defecto

**Admin:**
- Usuario: `admin`
- Contraseña: `admin123`

⚠️ Cambiar en producción

## 🌐 Despliegue (Railway + Vercel)

### Arquitectura
```
Railway  → Backend API + MySQL Database
Vercel   → Admin + E-commerce
```

### Guías Completas
📖 [DESPLIEGUE-RAILWAY-VERCEL.md](./DESPLIEGUE-RAILWAY-VERCEL.md)  
✅ [CHECKLIST-RAILWAY-VERCEL.md](./CHECKLIST-RAILWAY-VERCEL.md)

### Resumen Rápido

**Paso 1: Railway - Base de Datos (5 min)**
- Crear proyecto en Railway
- Provision MySQL
- Cargar script SQL

**Paso 2: Railway - Backend (10 min)**
- Agregar servicio desde GitHub
- Configurar variables de entorno
- Deploy automático

**Paso 3: Vercel - E-commerce (7 min)**
- Importar repositorio
- Build Command: `cd frontend && npm run build:ecommerce`
- Output: `frontend/dist/ecommerce/browser`

**Paso 4: Vercel - Admin (7 min)**
- Importar mismo repositorio
- Build Command: `cd frontend && npm run build`
- Output: `frontend/dist/browser`

**Tiempo total**: ~30 minutos  
**Costo**: $0/mes (planes gratuitos)

## 📁 Estructura del Proyecto

```
noblestep/
├── backend/              # .NET 8 Web API
│   ├── Controllers/     # API Endpoints
│   ├── Models/         # Entidades de BD
│   ├── DTOs/           # Data Transfer Objects
│   ├── Services/       # Lógica de negocio
│   ├── Data/           # EF Core DbContext
│   └── Helpers/        # Utilidades (JWT, etc)
│
├── frontend/
│   ├── src/            # Sistema Admin
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── sales/
│   │   │   ├── purchases/
│   │   │   ├── customers/
│   │   │   ├── suppliers/
│   │   │   ├── reports/
│   │   │   └── users/
│   │   └── environments/
│   │
│   └── projects/
│       └── ecommerce/  # Tienda Online
│           ├── src/
│           │   ├── app/
│           │   │   ├── pages/
│           │   │   ├── components/
│           │   │   └── services/
│           │   └── environments/
│
├── database/           # Scripts SQL
│   └── BASE-DATOS-DEFINITIVA.sql
│
├── railway.json        # Config Railway
├── nixpacks.toml       # Build Railway
└── vercel.json         # Config Vercel
```

## 🔐 Seguridad

- ✅ Autenticación JWT
- ✅ Passwords hasheados (BCrypt)
- ✅ Validación de entrada
- ✅ CORS configurado
- ✅ Variables de entorno para secretos
- ✅ Protección XSS y CSRF

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login admin
- `POST /api/ecommerce-auth/register` - Registro cliente
- `POST /api/ecommerce-auth/login` - Login cliente

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `PUT /api/products/{id}` - Actualizar producto
- `DELETE /api/products/{id}` - Eliminar producto

### Ventas
- `GET /api/sales` - Listar ventas
- `POST /api/sales` - Crear venta

### Pedidos E-commerce
- `GET /api/shop/products` - Catálogo público
- `POST /api/shop/orders` - Crear pedido
- `GET /api/shop/orders/customer/{id}` - Pedidos del cliente

Ver documentación completa en Swagger: `http://localhost:5000/swagger`

## 🛠️ Tecnologías Detalladas

### Backend
- ASP.NET Core 8.0
- Entity Framework Core
- MySQL Connector
- JWT Bearer Authentication
- Swagger/OpenAPI
- BCrypt.Net

### Frontend Admin
- Angular 18
- Bootstrap 5
- Chart.js (gráficos)
- jsPDF (exportar PDF)
- xlsx (exportar Excel)
- TypeScript 5

### Frontend E-commerce
- Angular 18
- Standalone Components
- Reactive Forms
- RxJS
- CSS Grid/Flexbox
- Animaciones CSS

## 📝 Scripts Disponibles

### Backend
```bash
dotnet run          # Ejecutar API
dotnet build        # Compilar
dotnet test         # Ejecutar tests
```

### Frontend
```bash
npm start           # Admin (4200)
npm run start:ecommerce  # E-commerce (4201)
npm run build       # Build Admin
npm run build:ecommerce  # Build E-commerce
npm test            # Tests
```

## 🐛 Solución de Problemas

### Error de conexión a BD
```bash
# Verificar MySQL esté corriendo
mysql -u root -p

# Verificar base de datos existe
SHOW DATABASES;
```

### Error de CORS
Verificar que `App__FrontendUrl` en configuración incluya las URLs correctas.

### Frontend no compila
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📄 Licencia

Proyecto Privado © 2026

## 👤 Autor

Desarrollado con ❤️

---

**Versión**: 1.0.0  
**Última actualización**: Febrero 2026
