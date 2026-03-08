-- ============================================================================
-- NOBLESTEP — BASE DE DATOS COMPLETA DE PRODUCCIÓN
-- ============================================================================
-- Motor       : MySQL 8.0 / MariaDB 10.4+
-- Base datos  : noblestep_db
-- Charset     : utf8mb4 / utf8mb4_unicode_ci
-- Generado    : 2026-03-08
-- Descripción : Script único que crea la base de datos, todas las tablas con
--               sus relaciones, índices, constraints y datos iniciales (seed)
--               necesarios para que el sistema funcione correctamente.
-- ============================================================================
-- USO:
--   mysql -u root -p < noblestep_db.sql
-- ============================================================================

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- ============================================================================
-- 1. CREAR BASE DE DATOS
-- ============================================================================

/*!40000 DROP DATABASE IF EXISTS `noblestep_db`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `noblestep_db`
  /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `noblestep_db`;

-- ============================================================================
-- 2. TABLA: __efmigrationshistory (historial de migraciones EF Core)
-- ============================================================================

DROP TABLE IF EXISTS `__efmigrationshistory`;
CREATE TABLE `__efmigrationshistory` (
  `MigrationId` varchar(150) NOT NULL,
  `ProductVersion` varchar(32) NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- 3. TABLA: usuarios
-- ============================================================================

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(50) NOT NULL,
  `hash_contrasena` varchar(255) NOT NULL,
  `nombre_completo` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `rol` varchar(20) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT NULL,
  `creado_por` varchar(100) DEFAULT NULL,
  `hash_token_refresco` varchar(500) DEFAULT NULL,
  `expiracion_token_refresco` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_nombre_usuario` (`nombre_usuario`),
  KEY `idx_nombre_usuario` (`nombre_usuario`),
  KEY `idx_correo` (`correo`),
  KEY `idx_hash_token_refresco` (`hash_token_refresco`(128))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed: Usuario administrador por defecto (contraseña: Admin123!)
-- Hash generado con BCrypt cost 11
INSERT INTO `usuarios` (`nombre_usuario`, `hash_contrasena`, `nombre_completo`, `correo`, `rol`, `activo`, `fecha_creacion`)
VALUES
  ('admin', '$2a$11$mSiqqJc66CfN.QSbauOBaexU2tSznqKFHKUKj3KX4D3UaaIGWK4qK', 'Administrador del Sistema', 'admin@noblestep.com', 'Administrador', 1, NOW()),
  ('vendedor1', '$2a$11$mSiqqJc66CfN.QSbauOBaexU2tSznqKFHKUKj3KX4D3UaaIGWK4qK', 'Juan Vendedor', 'vendedor@noblestep.com', 'Vendedor', 1, NOW());

-- ============================================================================
-- 4. TABLA: categorias
-- ============================================================================

DROP TABLE IF EXISTS `categorias`;
CREATE TABLE `categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed: Categorías base del sistema
INSERT INTO `categorias` (`nombre`, `descripcion`, `activo`, `fecha_creacion`)
VALUES
  ('Zapatillas', 'Zapatillas deportivas y casuales', 1, NOW()),
  ('Botas', 'Botas para trabajo y montaña', 1, NOW()),
  ('Formales', 'Zapatos formales para oficina', 1, NOW()),
  ('Sandalias', 'Sandalias y calzado de verano', 1, NOW());

-- ============================================================================
-- 5. TABLA: productos
-- ============================================================================

DROP TABLE IF EXISTS `productos`;
CREATE TABLE `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  `marca` varchar(100) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  `talla` varchar(20) NOT NULL,
  `precio` decimal(18,2) NOT NULL,
  `precio_oferta` decimal(18,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `url_imagen` varchar(500) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_categoria` (`categoria_id`),
  KEY `idx_nombre` (`nombre`),
  KEY `idx_marca` (`marca`),
  KEY `idx_codigo` (`codigo`),
  CONSTRAINT `fk_productos_categorias` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed: Catálogo inicial de productos
INSERT INTO `productos` (`nombre`, `codigo`, `marca`, `categoria_id`, `talla`, `precio`, `precio_oferta`, `stock`, `descripcion`, `activo`, `fecha_creacion`)
VALUES
  ('Nike Air Max 2024', 'NK-AM24-42', 'Nike', 1, '42', 129.99, 0.00, 15, 'Zapatillas deportivas con tecnología Air Max para máximo confort', 1, NOW()),
  ('Adidas Ultraboost', 'AD-UB21-41', 'Adidas', 1, '41', 149.99, 0.00, 12, 'Zapatillas running con tecnología Boost', 1, NOW()),
  ('Clarks Desert Boot', 'CL-DB-42', 'Clarks', 2, '42', 119.99, 0.00, 10, 'Botas clásicas de cuero genuino', 1, NOW()),
  ('Oxford Professional', 'OX-PR-43', 'Oxford', 3, '43', 89.99, 0.00, 8, 'Zapatos formales elegantes para oficina', 1, NOW()),
  ('Timberland Work Boot', 'TB-WB-44', 'Timberland', 2, '44', 179.99, 0.00, 8, 'Botas de trabajo resistentes e impermeables', 1, NOW()),
  ('Puma Running Pro', 'PM-RP-41', 'Puma', 1, '41', 99.99, 0.00, 20, 'Zapatillas running ligeras y respirables', 1, NOW()),
  ('Teva Summer Sandal', 'TV-SS-42', 'Teva', 4, '42', 49.99, 0.00, 25, 'Sandalias deportivas para verano', 1, NOW()),
  ('Reebok Classic', 'RB-CL-42', 'Reebok', 1, '42', 79.99, 0.00, 18, 'Zapatillas clásicas retro', 1, NOW()),
  ('Caterpillar Work', 'CT-WK-43', 'Caterpillar', 2, '43', 159.99, 0.00, 10, 'Botas industriales con puntera de acero', 1, NOW()),
  ('Skechers Comfort', 'SK-CF-41', 'Skechers', 1, '41', 69.99, 0.00, 30, 'Zapatillas ultra cómodas con memory foam', 1, NOW()),
  ('Zapatillas Nike Air Max 270', 'PROD-021', 'Nike', 1, '42', 499.00, 0.00, 15, 'Zapatillas deportivas con tecnología Air, suela de espuma, diseño moderno', 1, NOW()),
  ('Zapatillas Adidas Ultraboost', 'PROD-022', 'Adidas', 1, '41', 599.00, 0.00, 12, 'Zapatillas running con tecnología Boost, máximo confort y respuesta energética', 1, NOW()),
  ('Zapatillas Puma RS-X', 'PROD-023', 'Puma', 1, '40', 399.00, 0.00, 20, 'Zapatillas urbanas retro, diseño llamativo, ideal para uso casual', 1, NOW()),
  ('Zapatillas New Balance 574', 'PROD-024', 'New Balance', 1, '43', 349.00, 0.00, 15, 'Zapatillas clásicas con suela ENCAP, comodidad todo el día', 1, NOW()),
  ('Zapatillas Converse All Star', 'PROD-025', 'Converse', 1, '39', 189.00, 0.00, 25, 'Zapatillas icónicas de lona, estilo atemporal y versátil', 1, NOW()),
  ('Botas Timberland Premium 6"', 'PROD-026', 'Timberland', 2, '42', 699.00, 0.00, 10, 'Botas impermeables de cuero premium, ideales para trekking', 1, NOW()),
  ('Botas Dr. Martens 1460', 'PROD-027', 'Dr. Martens', 2, '41', 549.00, 0.00, 12, 'Botas de cuero suave, icónicas, con suela AirWair resistente', 1, NOW()),
  ('Botas Caterpillar Colorado', 'PROD-028', 'Caterpillar', 2, '43', 459.00, 0.00, 10, 'Botas de trabajo con puntera de acero, resistentes y duraderas', 1, NOW()),
  ('Botas Columbia Newton Ridge', 'PROD-029', 'Columbia', 2, '40', 399.00, 0.00, 15, 'Botas de montaña impermeables, tracción superior en terrenos difíciles', 1, NOW()),
  ('Botas North Face Thermoball', 'PROD-030', 'The North Face', 2, '42', 589.00, 0.00, 8, 'Botas térmicas aisladas, perfectas para clima frío extremo', 1, NOW()),
  ('Zapatos Oxford Clarks', 'PROD-031', 'Clarks', 3, '42', 449.00, 0.00, 12, 'Zapatos Oxford de cuero genuino, elegantes para ocasiones formales', 1, NOW()),
  ('Mocasines Gucci Horsebit', 'PROD-032', 'Gucci', 3, '41', 1299.00, 0.00, 5, 'Mocasines de lujo con detalle metálico, estilo italiano premium', 1, NOW()),
  ('Zapatos Derby Florsheim', 'PROD-033', 'Florsheim', 3, '43', 399.00, 0.00, 10, 'Zapatos Derby clásicos, cómodos y elegantes para oficina', 1, NOW()),
  ('Zapatos Monk Strap Magnanni', 'PROD-034', 'Magnanni', 3, '42', 699.00, 0.00, 6, 'Zapatos con hebilla doble, artesanía española de alta calidad', 1, NOW()),
  ('Zapatos Brogue Allen Edmonds', 'PROD-035', 'Allen Edmonds', 3, '41', 799.00, 0.00, 8, 'Zapatos brogue con perforaciones decorativas, estilo clásico británico', 1, NOW()),
  ('Sandalias Birkenstock Arizona', 'PROD-036', 'Birkenstock', 4, '42', 299.00, 0.00, 20, 'Sandalias ortopédicas con plantilla contorneada, máximo confort', 1, NOW()),
  ('Sandalias Teva Hurricane XLT2', 'PROD-037', 'Teva', 4, '41', 249.00, 0.00, 15, 'Sandalias deportivas con correas ajustables, ideales para aventuras', 1, NOW()),
  ('Sandalias Reef Fanning', 'PROD-038', 'Reef', 4, '40', 179.00, 0.00, 20, 'Sandalias playeras con abrebotellas en la suela, estilo surfer', 1, NOW()),
  ('Sandalias Havaianas Slim', 'PROD-039', 'Havaianas', 4, '39', 89.00, 0.00, 30, 'Chanclas brasileñas de caucho, ligeras y coloridas para verano', 1, NOW()),
  ('Sandalias Keen Newport H2', 'PROD-040', 'Keen', 4, '43', 349.00, 0.00, 15, 'Sandalias híbridas con protección de dedos, perfectas para agua y tierra', 1, NOW());

-- ============================================================================
-- 6. TABLA: clientes
-- ============================================================================

DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(100) NOT NULL,
  `numero_documento` varchar(20) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT NULL,
  `creado_por` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_numero_documento` (`numero_documento`),
  KEY `idx_numero_documento` (`numero_documento`),
  KEY `idx_nombre_completo` (`nombre_completo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed: Clientes iniciales de demostración
INSERT INTO `clientes` (`nombre_completo`, `numero_documento`, `telefono`, `correo`, `activo`, `fecha_creacion`)
VALUES
  ('Carlos Rodríguez', '45678912', '987654321', 'carlos.r@email.com', 1, NOW()),
  ('Ana Martínez', '78945612', '987123456', 'ana.m@email.com', 1, NOW()),
  ('Luis Fernández', '12398745', '956789123', 'luis.f@email.com', 1, NOW());

-- ============================================================================
-- 7. TABLA: proveedores
-- ============================================================================

DROP TABLE IF EXISTS `proveedores`;
CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `razon_social` varchar(100) NOT NULL,
  `nombre_contacto` varchar(100) NOT NULL,
  `numero_documento` varchar(20) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `pais` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_numero_documento` (`numero_documento`),
  KEY `idx_razon_social` (`razon_social`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed: Proveedores iniciales
INSERT INTO `proveedores` (`razon_social`, `nombre_contacto`, `numero_documento`, `telefono`, `correo`, `direccion`, `ciudad`, `pais`, `activo`, `fecha_creacion`)
VALUES
  ('Nike Perú SAC', 'Roberto Silva', '20456789123', '014567890', 'ventas@nike.pe', 'Av. Javier Prado 2500', 'Lima', 'Perú', 1, NOW()),
  ('Adidas Distribution', 'María Torres', '20567891234', '014567891', 'ventas@adidas.pe', 'Av. Larco 1234', 'Lima', 'Perú', 1, NOW()),
  ('Calzados Importados SAC', 'Jorge Vargas', '20678912345', '014567892', 'ventas@calzimport.com', 'Jr. Puno 567', 'Lima', 'Perú', 1, NOW());

-- ============================================================================
-- 8. TABLA: variantes_producto
-- ============================================================================

DROP TABLE IF EXISTS `variantes_producto`;
CREATE TABLE `variantes_producto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `producto_id` int(11) NOT NULL,
  `talla` varchar(20) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_producto_talla` (`producto_id`, `talla`),
  KEY `idx_producto` (`producto_id`),
  KEY `idx_talla` (`talla`),
  KEY `idx_activo` (`activo`),
  KEY `idx_stock` (`stock`),
  CONSTRAINT `fk_variantes_productos` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Variantes de talla por producto con stock individual';

-- ============================================================================
-- 9. TABLA: ventas
-- ============================================================================

DROP TABLE IF EXISTS `ventas`;
CREATE TABLE `ventas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `fecha_venta` datetime NOT NULL DEFAULT current_timestamp(),
  `total` decimal(18,2) NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'Completada',
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT NULL,
  `creado_por` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cliente` (`cliente_id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_fecha_venta` (`fecha_venta`),
  CONSTRAINT `fk_ventas_clientes` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `fk_ventas_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. TABLA: detalle_ventas
-- ============================================================================

DROP TABLE IF EXISTS `detalle_ventas`;
CREATE TABLE `detalle_ventas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `venta_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `variante_id` int(11) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(18,2) NOT NULL,
  `subtotal` decimal(18,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_venta` (`venta_id`),
  KEY `idx_producto` (`producto_id`),
  KEY `idx_variante` (`variante_id`),
  CONSTRAINT `fk_detalle_ventas_ventas` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_detalle_ventas_productos` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `fk_detalle_ventas_variantes` FOREIGN KEY (`variante_id`) REFERENCES `variantes_producto` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. TABLA: compras
-- ============================================================================

DROP TABLE IF EXISTS `compras`;
CREATE TABLE `compras` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `proveedor_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `fecha_compra` datetime NOT NULL DEFAULT current_timestamp(),
  `numero_factura` varchar(50) NOT NULL,
  `total` decimal(18,2) NOT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'Completada',
  `notas` varchar(500) DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_proveedor` (`proveedor_id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_fecha_compra` (`fecha_compra`),
  CONSTRAINT `fk_compras_proveedores` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`),
  CONSTRAINT `fk_compras_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. TABLA: detalle_compras
-- ============================================================================

DROP TABLE IF EXISTS `detalle_compras`;
CREATE TABLE `detalle_compras` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `compra_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `variante_id` int(11) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `costo_unitario` decimal(18,2) NOT NULL,
  `subtotal` decimal(18,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_compra` (`compra_id`),
  KEY `idx_producto` (`producto_id`),
  KEY `idx_variante` (`variante_id`),
  CONSTRAINT `fk_detalle_compras_compras` FOREIGN KEY (`compra_id`) REFERENCES `compras` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_detalle_compras_productos` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `fk_detalle_compras_variantes` FOREIGN KEY (`variante_id`) REFERENCES `variantes_producto` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 13. TABLA: clientes_ecommerce
-- ============================================================================

DROP TABLE IF EXISTS `clientes_ecommerce`;
CREATE TABLE `clientes_ecommerce` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `correo` varchar(100) NOT NULL,
  `hash_contrasena` varchar(255) NOT NULL,
  `nombre_completo` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `numero_documento` varchar(20) DEFAULT NULL,
  `direccion` varchar(300) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `distrito` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `correo_verificado` tinyint(1) NOT NULL DEFAULT 0,
  `token_recuperacion` varchar(500) DEFAULT NULL,
  `expiracion_recuperacion` datetime DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `hash_token_refresco` varchar(500) DEFAULT NULL,
  `expiracion_token_refresco` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_correo` (`correo`),
  KEY `idx_correo` (`correo`),
  KEY `idx_activo_fecha_creacion` (`activo`, `fecha_creacion`),
  KEY `idx_hash_token_refresco` (`hash_token_refresco`(128))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 14. TABLA: pedidos
-- ============================================================================

DROP TABLE IF EXISTS `pedidos`;
CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_ecommerce_id` int(11) DEFAULT NULL,
  `nombre_completo_cliente` varchar(100) NOT NULL,
  `correo_cliente` varchar(100) NOT NULL,
  `telefono_cliente` varchar(20) NOT NULL,
  `direccion_cliente` varchar(300) NOT NULL,
  `ciudad_cliente` varchar(100) NOT NULL,
  `distrito_cliente` varchar(100) NOT NULL,
  `referencia_cliente` varchar(300) DEFAULT NULL,
  `documento_cliente` varchar(20) DEFAULT NULL,
  `numero_pedido` varchar(50) NOT NULL,
  `subtotal` decimal(18,2) NOT NULL,
  `costo_envio` decimal(18,2) NOT NULL DEFAULT 0.00,
  `total` decimal(18,2) NOT NULL,
  `metodo_pago` varchar(50) NOT NULL,
  `detalle_pago` text DEFAULT NULL,
  `estado_pago` varchar(50) NOT NULL DEFAULT 'Pendiente',
  `url_comprobante_pago` varchar(500) DEFAULT NULL COMMENT 'URL del comprobante de pago subido por el cliente',
  `notas_admin` text DEFAULT NULL COMMENT 'Notas del administrador sobre el pedido',
  `estado_pedido` varchar(50) NOT NULL DEFAULT 'Pendiente',
  `tipo_comprobante` varchar(20) NOT NULL DEFAULT 'Boleta',
  `razon_social_empresa` varchar(200) DEFAULT NULL,
  `ruc_empresa` varchar(20) DEFAULT NULL,
  `direccion_empresa` varchar(300) DEFAULT NULL,
  `fecha_pedido` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_procesado` datetime DEFAULT NULL,
  `fecha_enviado` datetime DEFAULT NULL,
  `fecha_entregado` datetime DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_numero_pedido` (`numero_pedido`),
  KEY `idx_cliente_ecommerce` (`cliente_ecommerce_id`),
  KEY `idx_numero_pedido` (`numero_pedido`),
  KEY `idx_fecha_pedido` (`fecha_pedido`),
  KEY `idx_correo_cliente` (`correo_cliente`),
  KEY `idx_estado_pedido` (`estado_pedido`),
  CONSTRAINT `fk_pedidos_clientes_ecommerce` FOREIGN KEY (`cliente_ecommerce_id`) REFERENCES `clientes_ecommerce` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 15. TABLA: detalle_pedidos
-- ============================================================================

DROP TABLE IF EXISTS `detalle_pedidos`;
CREATE TABLE `detalle_pedidos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `variante_id` int(11) DEFAULT NULL,
  `nombre_producto` varchar(200) NOT NULL,
  `codigo_producto` varchar(100) NOT NULL,
  `talla_producto` varchar(50) DEFAULT NULL,
  `marca_producto` varchar(100) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(18,2) NOT NULL,
  `subtotal` decimal(18,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pedido` (`pedido_id`),
  KEY `idx_producto` (`producto_id`),
  KEY `idx_variante` (`variante_id`),
  CONSTRAINT `fk_detalle_pedidos_pedidos` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_detalle_pedidos_productos` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `fk_detalle_pedidos_variantes` FOREIGN KEY (`variante_id`) REFERENCES `variantes_producto` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- RESTAURAR CONFIGURACIÓN
-- ============================================================================

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- ============================================================================
-- FIN — Base de datos noblestep_db (Producción)
-- ============================================================================
