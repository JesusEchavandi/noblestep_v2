# 👟 NobleStep — Sistema E-commerce de Calzado

Sistema completo de gestión de ventas y e-commerce para una tienda de calzado, construido con **.NET 8** y **Angular 18**.

![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)
![Angular 18](https://img.shields.io/badge/Angular-18-DD0031?logo=angular)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Descripción

NobleStep es un sistema integral que incluye:

- **🛒 E-commerce público** — Catálogo con filtros, carrito, checkout, cuentas de usuario
- **⚙️ Panel administrativo** — Gestión de productos, ventas, compras, clientes, reportes y dashboard
- **🔒 API REST** — Backend seguro con JWT, rate limiting, CORS, compresión y logging estructurado

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐
│  Ecommerce App  │    │    Admin App    │
│  (Angular 18)   │    │  (Angular 18)   │
│   :4201 / :443  │    │   :4200 / :443  │
└────────┬────────┘    └────────┬────────┘
         │                      │
         └──────────┬───────────┘
                    │ HTTP/HTTPS
         ┌──────────▼───────────┐
         │    NobleStep API     │
         │   (.NET 8 / C#)     │
         │     :5000 / :443    │
         └──────────┬───────────┘
                    │
         ┌──────────▼───────────┐
         │      MySQL 8.0      │
         │   noblestep_db      │
         └──────────────────────┘
```

## 🚀 Inicio Rápido

### Prerrequisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) con npm
- [MySQL 8.0](https://dev.mysql.com/downloads/) o MariaDB 10.6+
- [Angular CLI 18](https://angular.io/cli): `npm install -g @angular/cli`

### 1. Base de datos

```bash
mysql -u root -p < database/noblestep_db.sql
```

### 2. Backend (.NET 8)

```bash
cd backend
dotnet restore
dotnet run
# → API disponible en http://localhost:5000
# → Swagger en http://localhost:5000/swagger
```

### 3. Frontend Admin (Angular 18)

```bash
cd frontend
npm install
ng serve admin --port 4200
# → Panel admin en http://localhost:4200
```

### 4. Frontend Ecommerce (Angular 18)

```bash
cd frontend
ng serve ecommerce --port 4201
# → Tienda en http://localhost:4201
```

## 🧪 Tests

```bash
cd backend/NobleStep.Api.Tests
dotnet test --verbosity normal
```

Incluye **23 tests unitarios** cubriendo:
- Autenticación (login, refresh token, revocación, registro)
- Creación de ventas (descuento stock, stock insuficiente, precio oferta)
- Eliminación de usuarios (reasignación de ventas, protección del último admin)
- Gestión de stock (descuento, negativos, acumulación, productos inactivos)

## 📁 Estructura del Proyecto

```
├── backend/                  # API REST (.NET 8)
│   ├── Controllers/          # 16 controladores
│   ├── Data/                 # AppDbContext + Seed data
│   ├── DTOs/                 # Data Transfer Objects
│   ├── Helpers/              # JWT, DateTime, OrderStatus
│   ├── Models/               # 13 entidades EF Core
│   ├── Services/             # Auth, Token, Email
│   └── NobleStep.Api.Tests/  # xUnit + FluentAssertions
├── frontend/                 # Monorepo Angular
│   ├── projects/admin/       # Panel administrativo
│   └── projects/ecommerce/   # Tienda pública
├── database/                 # Script SQL único de producción
│   └── noblestep_db.sql      # BD completa (schema + seed data)
├── docker/                   # Infraestructura Docker + deploy
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── deploy/               # Scripts de deploy (Nginx, systemd, TLS, backup)
└── .github/workflows/        # CI con GitHub Actions
```

## 🔐 Seguridad

| Feature | Estado |
|---------|--------|
| JWT con expiración 15min + Refresh Token 30d | ✅ |
| Contraseñas hasheadas con BCrypt | ✅ |
| Rate Limiting por endpoint | ✅ |
| CORS configurado por ambiente | ✅ |
| Cabeceras de seguridad (CSP, X-Frame, HSTS) | ✅ |
| Validación de secretos en producción | ✅ |
| Logging estructurado con Serilog | ✅ |
| Correlation ID por request | ✅ |
| Sin stack traces en producción | ✅ |

## ⚙️ Configuración de Producción

El sistema usa **variables de entorno** para secretos en producción:

| Variable | Descripción |
|----------|-------------|
| `NOBLESTEP_DB_CONNECTION` | Cadena de conexión MySQL completa |
| `NOBLESTEP_JWT_SECRET` | Clave secreta JWT (mín. 32 caracteres) |
| `NOBLESTEP_SMTP_PASSWORD` | Contraseña de app Gmail |
| `NOBLESTEP_API_TOKEN` | Token de ApiConsulta.pe |
| `NOBLESTEP_FRONTEND_URL` | URL del frontend ecommerce |
| `NOBLESTEP_CORS_ORIGINS` | Dominios permitidos (separados por coma) |

Ver [`docker/deploy/ENV_TEMPLATE.md`](docker/deploy/ENV_TEMPLATE.md) para documentación completa.

## 🛠️ Deploy

Scripts incluidos en `docker/deploy/`:

```bash
./docker/deploy/1_install.sh       # Instalar dependencias en Ubuntu 22.04
./docker/deploy/2_deploy.sh        # Compilar y desplegar
./docker/deploy/3_setup_tls.sh     # Configurar TLS con Let's Encrypt
./docker/deploy/4_backup.sh        # Backup MySQL con cron
```

## 🤝 CI/CD

GitHub Actions ejecuta 3 jobs en paralelo:
- **Backend**: `dotnet build` + `dotnet test`
- **Admin Frontend**: `npm ci` + `ng build admin`
- **Ecommerce Frontend**: `npm ci` + `ng build ecommerce`

## 📄 Licencia

MIT © NobleStep
