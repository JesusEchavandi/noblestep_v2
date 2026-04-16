# Matriz de Actores y CUN basada en implementacion real

## Actores de negocio identificados

1. Administrador
2. Vendedor
3. Cliente Ecommerce
4. Proveedor
5. Servicio Externo Identidad Peruana API DNI RUC
6. Servicio Externo Correo

## CUN definidos desde funcionalidades implementadas

1. CUN-01 Gestionar autenticacion interna
2. CUN-02 Administrar usuarios internos
3. CUN-03 Gestionar catalogo e inventario
4. CUN-04 Gestionar clientes y proveedores
5. CUN-05 Registrar compras de abastecimiento
6. CUN-06 Registrar ventas presenciales
7. CUN-07 Gestionar cuenta ecommerce cliente
8. CUN-08 Comprar en tienda ecommerce
9. CUN-09 Administrar pedidos ecommerce
10. CUN-10 Monitorear indicadores y reportes

## Evidencia de implementacion por CUN

- CUN-01: api/auth login refresh revoke register
- CUN-02: api/users CRUD activar desactivar
- CUN-03: api/categories api/products api/products/{productId}/variants
- CUN-04: api/customers api/suppliers api/dni y api/dni/ruc
- CUN-05: api/purchases create next-number summary by date
- CUN-06: api/sales create list detail reports
- CUN-07: api/ecommerce/auth register login refresh logout forgot reset profile
- CUN-08: api/shop products categories featured contact y api/ecommerce/orders create my-orders detail
- CUN-09: api/admin/ecommerce-orders list update-status detail export
- CUN-10: api/dashboard metrics chart top-products low-stock recent-sales y api/reports

## Reglas clave observadas

- Control de acceso por rol en backend con Authorize y Authorize Roles.
- Control de stock al crear venta y pedido ecommerce con transaccion.
- Inventario por variante y sincronizacion a stock de producto.
- Pedido ecommerce usa estados de pedido y estados de pago.
- Flujos de correo para bienvenida, recuperacion y confirmacion de pedido.
- Recuperacion de clave con token hasheado y expiracion.

## Supuestos de modelado

- Proveedor participa como actor de negocio porque origina abastecimiento de compras.
- Servicio externo DNI RUC y servicio de correo se modelan como actores de soporte.
- Carrito se maneja en frontend y se confirma en backend al crear pedido.
