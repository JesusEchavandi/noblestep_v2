-- ============================================================================
-- NobleStep - Base de Datos Completa (Español)
-- Generado: 2026-03-08
-- Tablas: 14 | Datos: completos con seed realista
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

DROP DATABASE IF EXISTS noblestep_db;
CREATE DATABASE noblestep_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE noblestep_db;

-- ============================================================================
-- EF Core Migrations History
-- ============================================================================
DROP TABLE IF EXISTS __efmigrationshistory;
CREATE TABLE __efmigrationshistory (
  MigrationId varchar(150) NOT NULL,
  ProductVersion varchar(32) NOT NULL,
  PRIMARY KEY (MigrationId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
LOCK TABLES __efmigrationshistory WRITE;
INSERT INTO __efmigrationshistory VALUES ('20260223024928_InitialBaseline','8.0.0'),('20260223025027_AddProductImageSalePriceDescription','8.0.0');
UNLOCK TABLES;

-- ============================================================================
-- USUARIOS (admin / vendedor)
-- Contraseña por defecto: Admin123!
-- ============================================================================
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
  id int(11) NOT NULL AUTO_INCREMENT,
  nombre_usuario varchar(50) NOT NULL,
  hash_contrasena varchar(255) NOT NULL,
  nombre_completo varchar(100) NOT NULL,
  correo varchar(100) NOT NULL,
  rol varchar(20) NOT NULL,
  activo tinyint(1) NOT NULL DEFAULT 1,
  fecha_creacion datetime NOT NULL DEFAULT current_timestamp(),
  fecha_actualizacion datetime DEFAULT NULL,
  creado_por varchar(100) DEFAULT NULL,
  hash_token_refresco varchar(500) DEFAULT NULL,
  expiracion_token_refresco datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_nombre_usuario (nombre_usuario),
  KEY idx_correo (correo)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES usuarios WRITE;
INSERT INTO usuarios VALUES
  (1,'admin','$2a$11$mSiqqJc66CfN.QSbauOBaexU2tSznqKFHKUKj3KX4D3UaaIGWK4qK','Administrador del Sistema','admin@noblestep.com','Administrador',1,'2026-02-23 02:50:26',NULL,NULL,NULL,NULL),
  (2,'vendedor1','$2a$11$mSiqqJc66CfN.QSbauOBaexU2tSznqKFHKUKj3KX4D3UaaIGWK4qK','Juan Vendedor','vendedor@noblestep.com','Vendedor',1,'2026-02-23 02:50:26',NULL,NULL,NULL,NULL),
  (3,'admin2','$2a$11$GWMSRp9NPvkOOi4638K3tOk8svtnV5O9.FLeLsraWAw6xwngJ9r5W','Bruno Taype','cordova@gmail.com','Administrador',1,'2026-02-07 16:37:27',NULL,NULL,NULL,NULL);
UNLOCK TABLES;

-- ============================================================================
-- CATEGORÍAS
-- ============================================================================
DROP TABLE IF EXISTS categorias;
CREATE TABLE categorias (
  id int(11) NOT NULL AUTO_INCREMENT,
  nombre varchar(100) NOT NULL,
  descripcion varchar(500) DEFAULT NULL,
  activo tinyint(1) NOT NULL DEFAULT 1,
  fecha_creacion datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES categorias WRITE;
INSERT INTO categorias VALUES
  (1,'Zapatillas','Zapatillas deportivas y casuales',1,'2026-02-23 02:50:26'),
  (2,'Botas','Botas para trabajo y montaña',1,'2026-02-23 02:50:26'),
  (3,'Formales','Zapatos formales para oficina',1,'2026-02-23 02:50:26'),
  (4,'Sandalias','Sandalias y calzado de verano',1,'2026-02-23 02:50:26');
UNLOCK TABLES;

-- ============================================================================
-- PRODUCTOS (30 productos)
-- ============================================================================
DROP TABLE IF EXISTS productos;
CREATE TABLE productos (
  id int(11) NOT NULL AUTO_INCREMENT,
  nombre varchar(200) NOT NULL,
  codigo varchar(50) DEFAULT NULL,
  marca varchar(100) NOT NULL,
  categoria_id int(11) NOT NULL,
  talla varchar(20) NOT NULL,
  precio decimal(18,2) NOT NULL,
  precio_oferta decimal(18,2) NOT NULL DEFAULT 0.00,
  stock int(11) NOT NULL,
  descripcion text DEFAULT NULL,
  url_imagen varchar(500) DEFAULT NULL,
  activo tinyint(1) NOT NULL DEFAULT 1,
  fecha_creacion datetime NOT NULL DEFAULT current_timestamp(),
  fecha_actualizacion datetime DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_categoria_id (categoria_id),
  CONSTRAINT fk_productos_categorias FOREIGN KEY (categoria_id) REFERENCES categorias (id)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES productos WRITE;
INSERT INTO productos VALUES
  (1,'Nike Air Max 2024','NK-AM24-42','Nike',1,'42',129.99,0.00,38,'Zapatillas deportivas con tecnología Air Max para máximo confort',NULL,1,'2026-02-06 10:11:22','2026-02-08 01:01:09'),
  (2,'Adidas Ultraboost','AD-UB21-41','Adidas',1,'41',149.99,0.00,27,'Zapatillas running con tecnología Boost',NULL,1,'2026-02-06 10:11:22','2026-02-06 10:50:20'),
  (3,'Clarks Desert Boot','CL-DB-42','Clarks',2,'42',119.99,0.00,11,'Botas clásicas de cuero genuino',NULL,1,'2026-02-06 10:11:22','2026-02-23 04:28:12'),
  (4,'Oxford Professional','OX-PR-43','Oxford',3,'43',89.99,0.00,3,'Zapatos formales elegantes para oficina',NULL,1,'2026-02-06 10:11:22','2026-02-06 15:50:48'),
  (5,'Timberland Work Boot','TB-WB-44','Timberland',2,'44',179.99,0.00,8,'Botas de trabajo resistentes e impermeables',NULL,1,'2026-02-06 10:11:22',NULL),
  (6,'Puma Running Pro','PM-RP-41','Puma',1,'41',99.99,0.00,32,'Zapatillas running ligeras y respirables',NULL,1,'2026-02-06 10:11:22',NULL),
  (7,'Teva Summer Sandal','TV-SS-42','Teva',4,'42',49.99,0.00,38,'Sandalias deportivas para verano',NULL,1,'2026-02-06 10:11:22',NULL),
  (8,'Reebok Classic','RB-CL-42','Reebok',1,'42',79.99,0.00,44,'Zapatillas clásicas retro',NULL,1,'2026-02-06 10:11:22','2026-02-06 10:49:58'),
  (9,'Caterpillar Work','CT-WK-43','Caterpillar',2,'43',159.99,0.00,16,'Botas industriales con puntera de acero',NULL,1,'2026-02-06 10:11:22','2026-02-23 04:28:12'),
  (10,'Skechers Comfort','SK-CF-41','Skechers',1,'41',69.99,0.00,70,'Zapatillas ultra cómodas con memory foam',NULL,1,'2026-02-06 10:11:22','2026-02-07 18:08:00'),
  (11,'Zapatillas Nike Air Max 270','PROD-021','Nike',1,'42',499.00,0.00,25,'Zapatillas deportivas con tecnología Air, suela de espuma, diseño moderno y cómodo',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26'),
  (12,'Zapatillas Adidas Ultraboost','PROD-022','Adidas',1,'41',599.00,0.00,18,'Zapatillas running con tecnología Boost, máximo confort y respuesta energética',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26'),
  (13,'Zapatillas Puma RS-X','PROD-023','Puma',1,'40',399.00,0.00,30,'Zapatillas urbanas retro, diseño llamativo, ideal para uso casual',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26'),
  (14,'Zapatillas New Balance 574','PROD-024','New Balance',1,'43',349.00,0.00,21,'Zapatillas clásicas con suela ENCAP, comodidad todo el día',NULL,1,'2026-02-07 13:24:26','2026-02-08 00:59:53'),
  (15,'Zapatillas Converse All Star','PROD-025','Converse',1,'39',189.00,0.00,45,'Zapatillas icónicas de lona, estilo atemporal y versátil',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26'),
  (16,'Botas Timberland Premium 6"','PROD-026','Timberland',2,'42',699.00,0.00,15,'Botas impermeables de cuero premium, ideales para trekking y uso rudo',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26'),
  (17,'Botas Dr. Martens 1460','PROD-027','Dr. Martens',2,'41',549.00,0.00,20,'Botas de cuero suave, icónicas, con suela AirWair resistente',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26'),
  (18,'Botas Caterpillar Colorado','PROD-028','Caterpillar',2,'43',459.00,0.00,18,'Botas de trabajo con puntera de acero, resistentes y duraderas',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26'),
  (19,'Botas Columbia Newton Ridge','PROD-029','Columbia',2,'40',399.00,0.00,25,'Botas de montaña impermeables, tracción superior en terrenos difíciles',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26'),
  (20,'Botas North Face Thermoball','PROD-030','The North Face',2,'42',589.00,0.00,12,'Botas térmicas aisladas, perfectas para clima frío extremo',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26'),
  (21,'Zapatos Oxford Clarks','PROD-031','Clarks',3,'42',449.00,0.00,20,'Zapatos Oxford de cuero genuino, elegantes para ocasiones formales',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26'),
  (22,'Mocasines Gucci Horsebit','PROD-032','Gucci',3,'41',1299.00,0.00,8,'Mocasines de lujo con detalle metálico, estilo italiano premium',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26'),
  (23,'Zapatos Derby Florsheim','PROD-033','Florsheim',3,'43',399.00,0.00,15,'Zapatos Derby clásicos, cómodos y elegantes para oficina',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26'),
  (24,'Zapatos Monk Strap Magnanni','PROD-034','Magnanni',3,'42',699.00,0.00,10,'Zapatos con hebilla doble, artesanía española de alta calidad',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26'),
  (25,'Zapatos Brogue Allen Edmonds','PROD-035','Allen Edmonds',3,'41',799.00,0.00,12,'Zapatos brogue con perforaciones decorativas, estilo clásico británico',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26'),
  (26,'Sandalias Birkenstock Arizona','PROD-036','Birkenstock',4,'42',299.00,0.00,30,'Sandalias ortopédicas con plantilla contorneada, máximo confort',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26'),
  (27,'Sandalias Teva Hurricane XLT2','PROD-037','Teva',4,'41',249.00,0.00,23,'Sandalias deportivas con correas ajustables, ideales para aventuras',NULL,1,'2026-02-07 13:24:26','2026-02-24 13:37:52'),
  (28,'Sandalias Reef Fanning','PROD-038','Reef',4,'40',179.00,0.00,33,'Sandalias playeras con abrebotellas en la suela, estilo surfer',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26'),
  (29,'Sandalias Havaianas Slim','PROD-039','Havaianas',4,'39',89.00,0.00,50,'Chanclas brasileñas de caucho, ligeras y coloridas para verano',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26'),
  (30,'Sandalias Keen Newport H2','PROD-040','Keen',4,'43',349.00,0.00,20,'Sandalias híbridas con protección de dedos, perfectas para agua y tierra',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26');
UNLOCK TABLES;

-- ============================================================================
-- CLIENTES (punto de venta)
-- ============================================================================
DROP TABLE IF EXISTS clientes;
CREATE TABLE clientes (
  id int(11) NOT NULL AUTO_INCREMENT,
  nombre_completo varchar(100) NOT NULL,
  numero_documento varchar(20) NOT NULL,
  telefono varchar(20) DEFAULT NULL,
  correo varchar(100) DEFAULT NULL,
  activo tinyint(1) NOT NULL DEFAULT 1,
  fecha_creacion datetime NOT NULL DEFAULT current_timestamp(),
  fecha_actualizacion datetime DEFAULT NULL,
  creado_por varchar(100) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_numero_documento (numero_documento)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES clientes WRITE;
INSERT INTO clientes VALUES
  (1,'Carlos Rodríguez','45678912','987654321','carlos.r@email.com',1,'2026-02-06 10:11:22',NULL,NULL),
  (2,'Ana Martínez','78945612','987123456','ana.m@email.com',1,'2026-02-06 10:11:22',NULL,NULL),
  (3,'Luis Fernández','12398745','956789123','luis.f@email.com',1,'2026-02-06 10:11:22',NULL,NULL),
  (4,'Carmen Rosa','60942355','999999999','carmenrosagarcilazo@gmail.com',1,'2026-02-08 00:57:40',NULL,NULL),
  (5,'BRUNO JEANPIEER TAYPE FAJARDO','75999886','942381162','',1,'2026-02-24 13:37:47',NULL,NULL);
UNLOCK TABLES;

-- ============================================================================
-- PROVEEDORES
-- ============================================================================
DROP TABLE IF EXISTS proveedores;
CREATE TABLE proveedores (
  id int(11) NOT NULL AUTO_INCREMENT,
  razon_social varchar(100) NOT NULL,
  nombre_contacto varchar(100) NOT NULL,
  numero_documento varchar(20) NOT NULL,
  telefono varchar(15) DEFAULT NULL,
  correo varchar(100) DEFAULT NULL,
  direccion varchar(200) DEFAULT NULL,
  ciudad varchar(100) DEFAULT NULL,
  pais varchar(100) DEFAULT NULL,
  activo tinyint(1) NOT NULL DEFAULT 1,
  fecha_creacion datetime NOT NULL DEFAULT current_timestamp(),
  fecha_actualizacion datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_numero_documento (numero_documento)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES proveedores WRITE;
INSERT INTO proveedores VALUES
  (1,'Nike Perú SAC','Roberto Silva','20456789123','014567890','ventas@nike.pe','Av. Javier Prado 2500','Lima','Perú',1,'2026-02-06 10:11:22',NULL),
  (2,'Adidas Distribution','María Torres','20567891234','014567891','ventas@adidas.pe','Av. Larco 1234','Lima','Perú',1,'2026-02-06 10:11:22',NULL),
  (3,'Calzados Importados SAC','Jorge Vargas','20678912345','014567892','ventas@calzimport.com','Jr. Puno 567','Lima','Perú',1,'2026-02-06 10:11:22',NULL);
UNLOCK TABLES;

-- ============================================================================
-- VENTAS (17 ventas)
-- ============================================================================
DROP TABLE IF EXISTS ventas;
CREATE TABLE ventas (
  id int(11) NOT NULL AUTO_INCREMENT,
  cliente_id int(11) NOT NULL,
  usuario_id int(11) NOT NULL,
  fecha_venta datetime NOT NULL DEFAULT current_timestamp(),
  total decimal(18,2) NOT NULL,
  estado varchar(20) NOT NULL DEFAULT 'Completada',
  fecha_creacion datetime NOT NULL DEFAULT current_timestamp(),
  fecha_actualizacion datetime DEFAULT NULL,
  creado_por varchar(100) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_cliente_id (cliente_id),
  KEY idx_usuario_id (usuario_id),
  CONSTRAINT fk_ventas_clientes FOREIGN KEY (cliente_id) REFERENCES clientes (id),
  CONSTRAINT fk_ventas_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES ventas WRITE;
INSERT INTO ventas VALUES
  (1,1,1,'2026-02-06 10:26:28',259.98,'Completada','2026-02-06 10:26:28',NULL,NULL),
  (2,2,1,'2026-02-06 10:26:28',189.98,'Completada','2026-02-06 10:26:28',NULL,NULL),
  (3,1,1,'2026-02-05 10:26:28',299.97,'Completada','2026-02-05 10:26:28',NULL,NULL),
  (4,3,1,'2026-02-05 10:26:28',149.99,'Completada','2026-02-05 10:26:28',NULL,NULL),
  (5,2,1,'2026-02-04 10:26:28',329.96,'Completada','2026-02-04 10:26:28',NULL,NULL),
  (6,1,1,'2026-02-03 10:26:28',229.97,'Completada','2026-02-03 10:26:28',NULL,NULL),
  (7,2,1,'2026-02-03 10:26:28',179.98,'Completada','2026-02-03 10:26:28',NULL,NULL),
  (8,3,1,'2026-02-01 10:26:28',269.97,'Completada','2026-02-01 10:26:28',NULL,NULL),
  (9,1,1,'2026-01-06 10:26:28',399.95,'Completada','2026-01-06 10:26:28',NULL,NULL),
  (10,2,1,'2026-01-06 10:26:28',289.97,'Completada','2026-01-06 10:26:28',NULL,NULL),
  (11,1,1,'2025-12-06 10:26:28',449.96,'Completada','2025-12-06 10:26:28',NULL,NULL),
  (12,3,1,'2025-12-06 10:26:28',199.98,'Completada','2025-12-06 10:26:28',NULL,NULL),
  (13,1,1,'2026-02-07 11:36:53',1799.80,'Completada','2026-02-07 11:36:53',NULL,NULL),
  (14,1,3,'2026-02-07 13:14:52',349.95,'Completada','2026-02-07 13:14:52',NULL,NULL),
  (15,4,1,'2026-02-07 19:58:07',199.98,'Completada','2026-02-07 19:58:07',NULL,NULL),
  (16,2,1,'2026-02-22 20:35:33',358.00,'Completada','2026-02-22 20:35:33',NULL,NULL),
  (17,5,1,'2026-02-24 13:37:52',498.00,'Completada','2026-02-24 13:37:52',NULL,NULL);
UNLOCK TABLES;

-- ============================================================================
-- DETALLE VENTAS (25 líneas)
-- ============================================================================
DROP TABLE IF EXISTS detalle_ventas;
CREATE TABLE detalle_ventas (
  id int(11) NOT NULL AUTO_INCREMENT,
  venta_id int(11) NOT NULL,
  producto_id int(11) NOT NULL,
  variante_id int(11) DEFAULT NULL,
  cantidad int(11) NOT NULL,
  precio_unitario decimal(18,2) NOT NULL,
  subtotal decimal(18,2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_venta_id (venta_id),
  KEY idx_producto_id (producto_id),
  CONSTRAINT fk_detalle_ventas_ventas FOREIGN KEY (venta_id) REFERENCES ventas (id) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_ventas_productos FOREIGN KEY (producto_id) REFERENCES productos (id)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES detalle_ventas WRITE;
INSERT INTO detalle_ventas VALUES
  (1,1,1,NULL,2,129.99,259.98),
  (2,2,4,NULL,2,89.99,179.98),
  (3,2,10,NULL,1,69.99,69.99),
  (4,3,2,NULL,2,149.99,299.98),
  (5,4,2,NULL,1,149.99,149.99),
  (6,5,5,NULL,2,179.99,359.98),
  (7,6,1,NULL,1,129.99,129.99),
  (8,6,6,NULL,1,99.99,99.99),
  (9,7,8,NULL,2,79.99,159.98),
  (10,7,10,NULL,1,69.99,69.99),
  (11,8,3,NULL,2,119.99,239.98),
  (12,8,7,NULL,1,49.99,49.99),
  (13,9,1,NULL,2,129.99,259.98),
  (14,9,2,NULL,1,149.99,149.99),
  (15,10,4,NULL,3,89.99,269.97),
  (16,10,10,NULL,1,69.99,69.99),
  (17,11,5,NULL,2,179.99,359.98),
  (18,11,1,NULL,1,129.99,129.99),
  (19,12,8,NULL,2,79.99,159.98),
  (20,12,7,NULL,1,49.99,49.99),
  (21,13,4,NULL,20,89.99,1799.80),
  (22,14,10,NULL,5,69.99,349.95),
  (23,15,6,NULL,2,99.99,199.98),
  (24,16,28,NULL,2,179.00,358.00),
  (25,17,27,NULL,2,249.00,498.00);
UNLOCK TABLES;

-- ============================================================================
-- COMPRAS (3 compras a proveedores)
-- ============================================================================
DROP TABLE IF EXISTS compras;
CREATE TABLE compras (
  id int(11) NOT NULL AUTO_INCREMENT,
  proveedor_id int(11) NOT NULL,
  usuario_id int(11) NOT NULL,
  fecha_compra datetime NOT NULL DEFAULT current_timestamp(),
  numero_factura varchar(50) NOT NULL,
  total decimal(18,2) NOT NULL,
  estado varchar(50) NOT NULL DEFAULT 'Completada',
  notas varchar(500) DEFAULT NULL,
  fecha_creacion datetime NOT NULL DEFAULT current_timestamp(),
  fecha_actualizacion datetime DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_proveedor_id (proveedor_id),
  KEY idx_usuario_id (usuario_id),
  CONSTRAINT fk_compras_proveedores FOREIGN KEY (proveedor_id) REFERENCES proveedores (id),
  CONSTRAINT fk_compras_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES compras WRITE;
INSERT INTO compras VALUES
  (1,2,1,'2026-02-06 20:49:00','F00001',959.88,'Completada',NULL,'2026-02-06 10:49:58',NULL),
  (2,3,1,'2026-02-06 20:50:00','F00002',2369.73,'Completada',NULL,'2026-02-06 10:50:20',NULL),
  (3,1,1,'2026-02-08 05:58:00','F00005',1559.88,'Completada',NULL,'2026-02-07 19:58:46',NULL);
UNLOCK TABLES;

-- ============================================================================
-- DETALLE COMPRAS (5 líneas)
-- ============================================================================
DROP TABLE IF EXISTS detalle_compras;
CREATE TABLE detalle_compras (
  id int(11) NOT NULL AUTO_INCREMENT,
  compra_id int(11) NOT NULL,
  producto_id int(11) NOT NULL,
  variante_id int(11) DEFAULT NULL,
  cantidad int(11) NOT NULL,
  costo_unitario decimal(18,2) NOT NULL,
  subtotal decimal(18,2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_compra_id (compra_id),
  KEY idx_producto_id (producto_id),
  CONSTRAINT fk_detalle_compras_compras FOREIGN KEY (compra_id) REFERENCES compras (id) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_compras_productos FOREIGN KEY (producto_id) REFERENCES productos (id)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES detalle_compras WRITE;
INSERT INTO detalle_compras VALUES
  (1,1,8,NULL,20,47.99,959.88),
  (2,2,10,NULL,11,41.99,461.93),
  (3,2,2,NULL,10,89.99,899.94),
  (4,2,10,NULL,24,41.99,1007.86),
  (5,3,1,NULL,20,77.99,1559.88);
UNLOCK TABLES;

-- ============================================================================
-- VARIANTES DE PRODUCTO (54 variantes de talla)
-- ============================================================================
DROP TABLE IF EXISTS variantes_producto;
CREATE TABLE variantes_producto (
  id int(11) NOT NULL AUTO_INCREMENT,
  producto_id int(11) NOT NULL,
  talla varchar(20) NOT NULL,
  stock int(11) NOT NULL DEFAULT 0,
  activo tinyint(1) NOT NULL DEFAULT 1,
  fecha_creacion datetime NOT NULL DEFAULT current_timestamp(),
  fecha_actualizacion datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE KEY uq_producto_talla (producto_id,talla),
  KEY idx_producto_id (producto_id),
  CONSTRAINT fk_variantes_productos FOREIGN KEY (producto_id) REFERENCES productos (id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES variantes_producto WRITE;
INSERT INTO variantes_producto VALUES
  (1,1,'42',38,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (2,2,'41',27,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (3,3,'42',11,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (4,4,'43',3,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (5,5,'44',8,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (6,6,'41',32,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (7,7,'42',38,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (8,8,'42',44,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (9,9,'43',16,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (10,10,'41',70,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (11,11,'42',25,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (12,12,'41',18,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (13,13,'40',30,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (14,14,'43',21,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (15,15,'39',45,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (16,16,'42',15,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (17,17,'41',20,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (18,18,'43',18,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (19,19,'40',25,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (20,20,'42',12,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (21,21,'42',20,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (22,22,'41',8,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (23,23,'43',15,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (24,24,'42',10,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (25,25,'41',12,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (26,26,'42',30,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (27,27,'41',25,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (28,28,'40',33,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (29,29,'39',50,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (30,30,'43',20,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (32,1,'39',8,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (33,1,'40',12,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (34,1,'41',15,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (35,1,'43',7,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (36,1,'44',4,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (38,2,'38',5,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (39,2,'39',9,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (40,2,'40',11,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (41,2,'42',6,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (42,2,'43',4,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (43,2,'44',2,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (45,3,'38',6,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (46,3,'39',10,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (47,3,'40',14,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (48,3,'41',9,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (50,4,'39',7,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (51,4,'40',13,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (52,4,'41',10,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (53,4,'42',8,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (54,4,'44',3,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (56,5,'35',10,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (57,5,'36',12,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (58,5,'37',15,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (59,5,'38',14,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (60,5,'39',11,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (61,5,'40',8,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (62,5,'41',6,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),
  (63,5,'42',4,1,'2026-02-23 01:26:38','2026-02-23 01:26:38');
UNLOCK TABLES;

-- ============================================================================
-- CLIENTES ECOMMERCE (3 clientes web)
-- ============================================================================
DROP TABLE IF EXISTS clientes_ecommerce;
CREATE TABLE clientes_ecommerce (
  id int(11) NOT NULL AUTO_INCREMENT,
  correo varchar(100) NOT NULL,
  hash_contrasena varchar(255) NOT NULL,
  nombre_completo varchar(100) NOT NULL,
  telefono varchar(20) DEFAULT NULL,
  numero_documento varchar(20) DEFAULT NULL,
  direccion varchar(300) DEFAULT NULL,
  ciudad varchar(100) DEFAULT NULL,
  distrito varchar(100) DEFAULT NULL,
  activo tinyint(1) NOT NULL DEFAULT 1,
  correo_verificado tinyint(1) NOT NULL DEFAULT 0,
  token_recuperacion varchar(500) DEFAULT NULL,
  expiracion_recuperacion datetime DEFAULT NULL,
  fecha_creacion datetime NOT NULL DEFAULT current_timestamp(),
  fecha_actualizacion datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  hash_token_refresco varchar(500) DEFAULT NULL,
  expiracion_token_refresco datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_correo (correo)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES clientes_ecommerce WRITE;
INSERT INTO clientes_ecommerce VALUES
  (1,'test@test.com','$2a$11$HZTpsIXnm7Pb4dfrKOkxke1gfn671vQRbxmvrnkcYt4J.scY80PMC','Test User',NULL,NULL,NULL,NULL,NULL,1,0,NULL,NULL,'2026-02-06 15:22:43','2026-02-06 15:22:43',NULL,NULL),
  (2,'xplitc@gmail.com','$2a$11$wAjJt8Hb3K5ghxFtX1T35eL3MsieS5EaZtS4EXdtPLtujhu9zSC8G','Juan Jesus Cordova Echavandi','942381162',NULL,NULL,NULL,NULL,1,0,NULL,NULL,'2026-02-06 15:46:02','2026-02-06 15:46:02',NULL,NULL),
  (3,'bruno@gmail.com','$2a$11$oTtHTmGI9qANxp04kMf1pOEnxwKLSZa7Dj1LbzjJJethJgW7dX32S','Bruno Taype','942381162',NULL,NULL,NULL,NULL,1,0,NULL,NULL,'2026-02-08 01:00:48','2026-02-08 01:00:48',NULL,NULL);
UNLOCK TABLES;

-- ============================================================================
-- PEDIDOS ECOMMERCE (7 pedidos)
-- ============================================================================
DROP TABLE IF EXISTS pedidos;
CREATE TABLE pedidos (
  id int(11) NOT NULL AUTO_INCREMENT,
  cliente_ecommerce_id int(11) DEFAULT NULL,
  nombre_completo_cliente varchar(100) NOT NULL,
  correo_cliente varchar(100) NOT NULL,
  telefono_cliente varchar(20) NOT NULL,
  direccion_cliente varchar(300) NOT NULL,
  ciudad_cliente varchar(100) NOT NULL,
  distrito_cliente varchar(100) NOT NULL,
  referencia_cliente varchar(300) DEFAULT NULL,
  documento_cliente varchar(20) DEFAULT NULL,
  numero_pedido varchar(50) NOT NULL,
  subtotal decimal(18,2) NOT NULL,
  costo_envio decimal(18,2) NOT NULL DEFAULT 0.00,
  total decimal(18,2) NOT NULL,
  metodo_pago varchar(50) NOT NULL,
  detalle_pago text DEFAULT NULL,
  estado_pago varchar(50) NOT NULL DEFAULT 'Pendiente',
  url_comprobante_pago varchar(500) DEFAULT NULL,
  notas_admin text DEFAULT NULL,
  estado_pedido varchar(50) NOT NULL DEFAULT 'Pendiente',
  tipo_comprobante varchar(20) NOT NULL DEFAULT 'Boleta',
  razon_social_empresa varchar(200) DEFAULT NULL,
  ruc_empresa varchar(20) DEFAULT NULL,
  direccion_empresa varchar(300) DEFAULT NULL,
  fecha_pedido datetime NOT NULL DEFAULT current_timestamp(),
  fecha_procesado datetime DEFAULT NULL,
  fecha_enviado datetime DEFAULT NULL,
  fecha_entregado datetime DEFAULT NULL,
  fecha_creacion datetime NOT NULL DEFAULT current_timestamp(),
  fecha_actualizacion datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  eliminado tinyint(1) NOT NULL DEFAULT 0,
  fecha_eliminacion datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_numero_pedido (numero_pedido),
  KEY idx_cliente_ecommerce_id (cliente_ecommerce_id),
  KEY idx_numero_pedido (numero_pedido),
  KEY idx_fecha_pedido (fecha_pedido),
  KEY idx_correo_cliente (correo_cliente),
  KEY idx_estado_pedido (estado_pedido),
  CONSTRAINT fk_pedidos_clientes_ecommerce FOREIGN KEY (cliente_ecommerce_id) REFERENCES clientes_ecommerce (id) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES pedidos WRITE;
INSERT INTO pedidos VALUES
  (1,2,'Juan Jesus Cordova Echavandi','xplitc@gmail.com','942381162','MZ J LOTE 2 ENRIQUE MONTENEGRO, SJL, LIMA','Lima','San Juan de Lurigancho','Montenegro',NULL,'ORD-20260206-DD13BED5',249.98,0.00,249.98,'yape',NULL,'Confirmado',NULL,NULL,'Enviado','Boleta',NULL,NULL,NULL,'2026-02-06 15:47:06','2026-02-06 15:49:22','2026-02-06 15:49:17',NULL,'2026-02-06 15:47:06','2026-02-06 15:49:35',0,NULL),
  (2,2,'Juan Jesus Cordova Echavandi','xplitc@gmail.com','942381162','MZ J LOTE 2 ENRIQUE MONTENEGRO, SJL, LIMA','Lima','SJL','PARQUES',NULL,'ORD-20260206-EF609FA9',159.98,0.00,159.98,'yape',NULL,'Confirmado',NULL,NULL,'Pendiente','Boleta',NULL,NULL,NULL,'2026-02-06 15:50:48','2026-02-06 15:50:57',NULL,NULL,'2026-02-06 15:50:48','2026-02-06 15:51:01',0,NULL),
  (3,2,'Juan Jesus Cordova Echavandi','xplitc@gmail.com','942381162','MZ J LOTE 2 ENRIQUE MONTENEGRO, SJL, LIMA','Lima','SJL','A',NULL,'ORD-20260207-7DEE1D17',239.98,0.00,239.98,'yape',NULL,'Confirmado',NULL,NULL,'Pendiente','Boleta',NULL,NULL,NULL,'2026-02-07 16:36:22',NULL,NULL,NULL,'2026-02-07 16:36:22','2026-02-07 16:36:31',0,NULL),
  (4,2,'Juan Jesus Cordova Echavandi','xplitc@gmail.com','942381162','MZ J LOTE 2 ENRIQUE MONTENEGRO, SJL, LIMA','Lima','SJL','AEA',NULL,'ORD-20260207-3CFAD234',69.99,10.00,79.99,'yape',NULL,'Confirmado',NULL,NULL,'Pendiente','Boleta',NULL,NULL,NULL,'2026-02-07 18:08:00',NULL,NULL,'2026-02-07 18:14:10','2026-02-07 18:08:00','2026-02-07 18:14:19',0,NULL),
  (5,NULL,'Juan Cordova','xplitc@gmail.com','942381162','MZ J LOTE 2 ENRIQUE MONTENEGRO, SJL, LIMA','Lima','SJL','',NULL,'ORD-20260208-4EBEA910',349.00,0.00,349.00,'yape',NULL,'Confirmado',NULL,NULL,'Pendiente','Boleta',NULL,NULL,NULL,'2026-02-08 00:59:53','2026-02-08 01:00:18','2026-02-08 01:00:15',NULL,'2026-02-08 00:59:53','2026-02-08 01:01:17',0,NULL),
  (6,3,'Bruno Taype','bruno@gmail.com','942381162','MZ J LOTE 2 ENRIQUE MONTENEGRO, SJL, LIMA','Lima','SJL','',NULL,'ORD-20260208-0E85F00F',389.97,0.00,389.97,'yape',NULL,'Confirmado',NULL,NULL,'Pendiente','Boleta',NULL,NULL,NULL,'2026-02-08 01:01:09',NULL,NULL,NULL,'2026-02-08 01:01:09','2026-02-08 01:01:16',0,NULL),
  (7,NULL,'Juan','xplitc@gmail.com','942381162','Av Mar Adriatico','Lima','San Juan de Lurigancho','',NULL,'ORD-20260223-F851E659',279.98,0.00,279.98,'yape',NULL,'Pendiente',NULL,NULL,'Pendiente','Boleta',NULL,NULL,NULL,'2026-02-23 04:28:12',NULL,NULL,NULL,'2026-02-23 04:28:12','2026-02-23 04:28:12',0,NULL);
UNLOCK TABLES;

-- ============================================================================
-- DETALLE PEDIDOS (10 líneas)
-- ============================================================================
DROP TABLE IF EXISTS detalle_pedidos;
CREATE TABLE detalle_pedidos (
  id int(11) NOT NULL AUTO_INCREMENT,
  pedido_id int(11) NOT NULL,
  producto_id int(11) NOT NULL,
  variante_id int(11) DEFAULT NULL,
  nombre_producto varchar(200) NOT NULL,
  codigo_producto varchar(100) NOT NULL,
  talla_producto varchar(50) DEFAULT NULL,
  marca_producto varchar(100) DEFAULT NULL,
  cantidad int(11) NOT NULL,
  precio_unitario decimal(18,2) NOT NULL,
  subtotal decimal(18,2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_pedido_id (pedido_id),
  KEY idx_producto_id (producto_id),
  CONSTRAINT fk_detalle_pedidos_pedidos FOREIGN KEY (pedido_id) REFERENCES pedidos (id) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_pedidos_productos FOREIGN KEY (producto_id) REFERENCES productos (id)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
LOCK TABLES detalle_pedidos WRITE;
INSERT INTO detalle_pedidos VALUES
  (1,1,9,NULL,'Caterpillar Work','Caterpillar','43','Caterpillar',1,159.99,159.99),
  (2,1,4,NULL,'Oxford Professional','Oxford','43','Oxford',1,89.99,89.99),
  (3,2,4,NULL,'Oxford Professional','Oxford','43','Oxford',1,89.99,89.99),
  (4,2,10,NULL,'Skechers Comfort','Skechers','41','Skechers',1,69.99,69.99),
  (5,3,3,NULL,'Clarks Desert Boot','Clarks','42','Clarks',2,119.99,239.98),
  (6,4,10,NULL,'Skechers Comfort','Skechers','41','Skechers',1,69.99,69.99),
  (7,5,14,NULL,'Zapatillas New Balance 574','New Balance','43','New Balance',1,349.00,349.00),
  (8,6,1,NULL,'Nike Air Max 2024','Nike','42','Nike',3,129.99,389.97),
  (9,7,9,NULL,'Caterpillar Work','Caterpillar','43','Caterpillar',1,159.99,159.99),
  (10,7,3,NULL,'Clarks Desert Boot','Clarks','42','Clarks',1,119.99,119.99);
UNLOCK TABLES;

-- ============================================================================
-- Restaurar configuraciones
-- ============================================================================
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completado
