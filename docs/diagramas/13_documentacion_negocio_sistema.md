# Documentacion de negocio y sistema NobleStep

## 1. Actores de negocio

1. Administrador
: Gestiona seguridad, usuarios, catalogo, pedidos ecommerce y analitica.
2. Vendedor
: Gestiona ventas presenciales, clientes, consultas de identidad y consulta de reportes.
3. Cliente Ecommerce
: Navega catalogo, se autentica, gestiona su cuenta y realiza pedidos online.
4. Proveedor
: Abastece productos para compras y reposicion de inventario.
5. Servicio externo DNI RUC
: Provee datos de identidad para validacion comercial.
6. Servicio externo Correo
: Soporta notificaciones y recuperacion de credenciales.

## 2. Casos de uso del negocio

1. CUN-01 Gestionar autenticacion interna.
2. CUN-02 Administrar usuarios internos.
3. CUN-03 Gestionar catalogo e inventario.
4. CUN-04 Gestionar clientes y proveedores.
5. CUN-05 Registrar compras de abastecimiento.
6. CUN-06 Registrar ventas presenciales.
7. CUN-07 Gestionar cuenta ecommerce cliente.
8. CUN-08 Comprar en tienda ecommerce.
9. CUN-09 Administrar pedidos ecommerce.
10. CUN-10 Monitorear indicadores y reportes.

## 3. Casos de uso del sistema

### 3.1 Seguridad y cuentas

1. US-01 Iniciar sesion interna.
2. US-02 Refrescar token interno.
3. US-03 Revocar sesion interna.
4. US-04 Registrar usuario interno por administrador.
5. US-05 Registrar cliente ecommerce.
6. US-06 Iniciar sesion ecommerce.
7. US-07 Refrescar token ecommerce.
8. US-08 Cerrar sesion ecommerce.
9. US-09 Solicitar recuperacion de contraseña ecommerce.
10. US-10 Restablecer contraseña ecommerce.
11. US-11 Consultar perfil ecommerce.
12. US-12 Actualizar perfil ecommerce.

### 3.2 Operacion comercial interna

1. US-13 Crear, editar y listar categorias.
2. US-14 Crear, editar, listar y desactivar productos.
3. US-15 Gestionar variantes por talla y stock.
4. US-16 Crear, editar, listar y desactivar clientes.
5. US-17 Crear, editar, listar y eliminar proveedores con validaciones.
6. US-18 Generar numero correlativo de compra.
7. US-19 Registrar compra con actualizacion de stock.
8. US-20 Registrar venta con validacion de stock y transaccion.
9. US-21 Consultar ventas y compras por periodos.

### 3.3 Ecommerce y atencion de pedidos

1. US-22 Consultar catalogo ecommerce con filtros y paginacion.
2. US-23 Consultar detalle de producto ecommerce.
3. US-24 Consultar productos destacados.
4. US-25 Consultar categorias ecommerce.
5. US-26 Registrar pedido ecommerce y descontar stock.
6. US-27 Consultar pedidos propios del cliente autenticado.
7. US-28 Consultar detalle de pedido propio.
8. US-29 Listar y filtrar pedidos ecommerce para administracion.
9. US-30 Actualizar estado de pedido y estado de pago.
10. US-31 Exportar pedidos ecommerce a CSV.
11. US-32 Enviar formulario de contacto.

### 3.4 Analitica y soporte

1. US-33 Consultar metricas del dashboard.
2. US-34 Consultar datos de grafica de ventas.
3. US-35 Consultar productos top y bajo stock.
4. US-36 Consultar reportes de ventas, compras, inventario y utilidad.
5. US-37 Consultar DNI.
6. US-38 Consultar RUC.
7. US-39 Recibir stream SSE de eventos de pedidos para panel admin.

## 4. Diagrama fisico de base de datos

- Se incluye en el archivo Mermaid [14_diagrama_fisico_bd.mmd](14_diagrama_fisico_bd.mmd).
- Incluye entidades principales, PK, FKs y cardinalidades implementadas en MySQL.

## 5. Evidencia de implementacion

- API y seguridad: [backend/Program.cs](../../backend/Program.cs).
- Modelo EF y relaciones: [backend/Data/AppDbContext.cs](../../backend/Data/AppDbContext.cs).
- Rutas ecommerce: [frontend/projects/ecommerce/src/app/app.routes.ts](../../frontend/projects/ecommerce/src/app/app.routes.ts).
- Esquema fisico SQL: [database/noblestep_db.sql](../../database/noblestep_db.sql).
