-- MySQL dump 10.13  Distrib 9.4.0, for Win64 (x86_64)
--
-- Host: localhost    Database: noblestep_db
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

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

--
-- Current Database: `noblestep_db`
--

/*!40000 DROP DATABASE IF EXISTS `noblestep_db`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `noblestep_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `noblestep_db`;

--
-- Table structure for table `__efmigrationshistory`
--

DROP TABLE IF EXISTS `__efmigrationshistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__efmigrationshistory` (
  `MigrationId` varchar(150) NOT NULL,
  `ProductVersion` varchar(32) NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__efmigrationshistory`
--

LOCK TABLES `__efmigrationshistory` WRITE;
/*!40000 ALTER TABLE `__efmigrationshistory` DISABLE KEYS */;
INSERT INTO `__efmigrationshistory` VALUES ('20260223024928_InitialBaseline','8.0.0'),('20260223025027_AddProductImageSalePriceDescription','8.0.0');
/*!40000 ALTER TABLE `__efmigrationshistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT 1,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`Id`),
  KEY `idx_name` (`Name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Zapatillas','Zapatillas deportivas y casuales',1,'2026-02-23 02:50:26'),(2,'Botas','Botas para trabajo y monta?a',1,'2026-02-23 02:50:26'),(3,'Formales','Zapatos formales para oficina',1,'2026-02-23 02:50:26'),(4,'Sandalias','Sandalias y calzado de verano',1,'2026-02-23 02:50:26');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `FullName` varchar(100) NOT NULL,
  `DocumentNumber` varchar(20) NOT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT 1,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`Id`),
  UNIQUE KEY `DocumentNumber` (`DocumentNumber`),
  KEY `idx_document` (`DocumentNumber`),
  KEY `idx_name` (`FullName`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Carlos Rodr?guez','45678912','987654321','carlos.r@email.com','Av. Principal 123, Lima',1,'2026-02-06 10:11:22'),(2,'Ana Mart?nez','78945612','987123456','ana.m@email.com','Jr. Los Olivos 456, Miraflores',1,'2026-02-06 10:11:22'),(3,'Luis Fern?ndez','12398745','956789123','luis.f@email.com','Calle Las Flores 789, San Isidro',1,'2026-02-06 10:11:22'),(4,'Carmen Rosa','60942355','999999999','carmenrosagarcilazo@gmail.com',NULL,1,'2026-02-08 00:57:40'),(5,'BRUNO JEANPIEER TAYPE FAJARDO','75999886','942381162','',NULL,1,'2026-02-24 13:37:47');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ecommercecustomers`
--

DROP TABLE IF EXISTS `ecommercecustomers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecommercecustomers` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Email` varchar(100) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `FullName` varchar(100) NOT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `DocumentNumber` varchar(20) DEFAULT NULL,
  `Address` varchar(300) DEFAULT NULL,
  `City` varchar(100) DEFAULT NULL,
  `District` varchar(100) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT 1,
  `EmailVerified` tinyint(1) NOT NULL DEFAULT 0,
  `PasswordResetToken` varchar(500) DEFAULT NULL,
  `PasswordResetExpires` datetime DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Email` (`Email`),
  KEY `idx_email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ecommercecustomers`
--

LOCK TABLES `ecommercecustomers` WRITE;
/*!40000 ALTER TABLE `ecommercecustomers` DISABLE KEYS */;
INSERT INTO `ecommercecustomers` VALUES (1,'test@test.com','$2a$11$HZTpsIXnm7Pb4dfrKOkxke1gfn671vQRbxmvrnkcYt4J.scY80PMC','Test User',NULL,NULL,NULL,NULL,NULL,1,0,NULL,NULL,'2026-02-06 15:22:43','2026-02-06 15:22:43'),(2,'xplitc@gmail.com','$2a$11$wAjJt8Hb3K5ghxFtX1T35eL3MsieS5EaZtS4EXdtPLtujhu9zSC8G','Juan Jesus Cordova Echavandi','942381162',NULL,NULL,NULL,NULL,1,0,NULL,NULL,'2026-02-06 15:46:02','2026-02-06 15:46:02'),(3,'bruno@gmail.com','$2a$11$oTtHTmGI9qANxp04kMf1pOEnxwKLSZa7Dj1LbzjJJethJgW7dX32S','Bruno Taype','942381162',NULL,NULL,NULL,NULL,1,0,NULL,NULL,'2026-02-08 01:00:48','2026-02-08 01:00:48');
/*!40000 ALTER TABLE `ecommercecustomers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderdetails`
--

DROP TABLE IF EXISTS `orderdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderdetails` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `OrderId` int(11) NOT NULL,
  `ProductId` int(11) NOT NULL,
  `VariantId` int(11) DEFAULT NULL,
  `ProductName` varchar(200) NOT NULL,
  `ProductCode` varchar(100) NOT NULL,
  `ProductSize` varchar(50) DEFAULT NULL,
  `ProductBrand` varchar(100) DEFAULT NULL,
  `Quantity` int(11) NOT NULL,
  `UnitPrice` decimal(18,2) NOT NULL,
  `Subtotal` decimal(18,2) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_order` (`OrderId`),
  KEY `idx_product` (`ProductId`),
  KEY `fk_orderdetail_variant` (`VariantId`),
  CONSTRAINT `fk_orderdetail_variant` FOREIGN KEY (`VariantId`) REFERENCES `productvariants` (`Id`) ON DELETE SET NULL,
  CONSTRAINT `orderdetails_ibfk_1` FOREIGN KEY (`OrderId`) REFERENCES `orders` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `orderdetails_ibfk_2` FOREIGN KEY (`ProductId`) REFERENCES `products` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderdetails`
--

LOCK TABLES `orderdetails` WRITE;
/*!40000 ALTER TABLE `orderdetails` DISABLE KEYS */;
INSERT INTO `orderdetails` VALUES (1,1,9,NULL,'Caterpillar Work','Caterpillar','43','Caterpillar',1,159.99,159.99),(2,1,4,NULL,'Oxford Professional','Oxford','43','Oxford',1,89.99,89.99),(3,2,4,NULL,'Oxford Professional','Oxford','43','Oxford',1,89.99,89.99),(4,2,10,NULL,'Skechers Comfort','Skechers','41','Skechers',1,69.99,69.99),(5,3,3,NULL,'Clarks Desert Boot','Clarks','42','Clarks',2,119.99,239.98),(6,4,10,NULL,'Skechers Comfort','Skechers','41','Skechers',1,69.99,69.99),(7,5,14,NULL,'Zapatillas New Balance 574','New Balance','43','New Balance',1,349.00,349.00),(8,6,1,NULL,'Nike Air Max 2024','Nike','42','Nike',3,129.99,389.97),(9,7,9,NULL,'Caterpillar Work','Caterpillar','43','Caterpillar',1,159.99,159.99),(10,7,3,NULL,'Clarks Desert Boot','Clarks','42','Clarks',1,119.99,119.99);
/*!40000 ALTER TABLE `orderdetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `EcommerceCustomerId` int(11) DEFAULT NULL,
  `CustomerFullName` varchar(100) NOT NULL,
  `CustomerEmail` varchar(100) NOT NULL,
  `CustomerPhone` varchar(20) NOT NULL,
  `CustomerAddress` varchar(300) NOT NULL,
  `CustomerCity` varchar(100) NOT NULL,
  `CustomerDistrict` varchar(100) NOT NULL,
  `CustomerReference` varchar(300) DEFAULT NULL,
  `CustomerDocumentNumber` varchar(20) DEFAULT NULL,
  `OrderNumber` varchar(50) NOT NULL,
  `Subtotal` decimal(18,2) NOT NULL,
  `ShippingCost` decimal(18,2) NOT NULL DEFAULT 0.00,
  `Total` decimal(18,2) NOT NULL,
  `PaymentMethod` varchar(50) NOT NULL,
  `PaymentDetails` text DEFAULT NULL,
  `PaymentStatus` varchar(50) NOT NULL DEFAULT 'Pending',
  `OrderStatus` varchar(50) NOT NULL DEFAULT 'Pending',
  `InvoiceType` varchar(20) NOT NULL DEFAULT 'Boleta',
  `CompanyName` varchar(200) DEFAULT NULL,
  `CompanyRUC` varchar(20) DEFAULT NULL,
  `CompanyAddress` varchar(300) DEFAULT NULL,
  `OrderDate` datetime NOT NULL DEFAULT current_timestamp(),
  `ProcessedDate` datetime DEFAULT NULL,
  `ShippedDate` datetime DEFAULT NULL,
  `DeliveredDate` datetime DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `PaymentProofUrl` varchar(500) DEFAULT NULL COMMENT 'URL del comprobante de pago subido por el cliente',
  `AdminNotes` text DEFAULT NULL COMMENT 'Notas del administrador sobre el pedido',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `OrderNumber` (`OrderNumber`),
  KEY `idx_customer` (`EcommerceCustomerId`),
  KEY `idx_order_number` (`OrderNumber`),
  KEY `idx_order_date` (`OrderDate`),
  KEY `idx_email` (`CustomerEmail`),
  KEY `idx_status` (`OrderStatus`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`EcommerceCustomerId`) REFERENCES `ecommercecustomers` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,2,'Juan Jesus Cordova Echavandi','xplitc@gmail.com','942381162','MZ J LOTE 2 ENRIQUE MONTENEGRO, SJL, LIMA','Lima','San Juan de Lurigancho','Montenegro',NULL,'ORD-20260206-DD13BED5',249.98,0.00,249.98,'yape',NULL,'Confirmed','Shipped','Boleta',NULL,NULL,NULL,'2026-02-06 15:47:06','2026-02-06 15:49:22','2026-02-06 15:49:17',NULL,'2026-02-06 15:47:06','2026-02-06 15:49:35',NULL,NULL),(2,2,'Juan Jesus Cordova Echavandi','xplitc@gmail.com','942381162','MZ J LOTE 2 ENRIQUE MONTENEGRO, SJL, LIMA','Lima','SJL','PARQUES',NULL,'ORD-20260206-EF609FA9',159.98,0.00,159.98,'yape',NULL,'Confirmed','Pending','Boleta',NULL,NULL,NULL,'2026-02-06 15:50:48','2026-02-06 15:50:57',NULL,NULL,'2026-02-06 15:50:48','2026-02-06 15:51:01',NULL,NULL),(3,2,'Juan Jesus Cordova Echavandi','xplitc@gmail.com','942381162','MZ J LOTE 2 ENRIQUE MONTENEGRO, SJL, LIMA','Lima','SJL','A',NULL,'ORD-20260207-7DEE1D17',239.98,0.00,239.98,'yape',NULL,'Confirmed','Pending','Boleta',NULL,NULL,NULL,'2026-02-07 16:36:22',NULL,NULL,NULL,'2026-02-07 16:36:22','2026-02-07 16:36:31',NULL,NULL),(4,2,'Juan Jesus Cordova Echavandi','xplitc@gmail.com','942381162','MZ J LOTE 2 ENRIQUE MONTENEGRO, SJL, LIMA','Lima','SJL','AEA',NULL,'ORD-20260207-3CFAD234',69.99,10.00,79.99,'yape',NULL,'Confirmed','Pending','Boleta',NULL,NULL,NULL,'2026-02-07 18:08:00',NULL,NULL,'2026-02-07 18:14:10','2026-02-07 18:08:00','2026-02-07 18:14:19',NULL,NULL),(5,NULL,'Juan Cordova','xplitc@gmail.com','942381162','MZ J LOTE 2 ENRIQUE MONTENEGRO, SJL, LIMA','Lima','SJL','',NULL,'ORD-20260208-4EBEA910',349.00,0.00,349.00,'yape',NULL,'Confirmed','Pending','Boleta',NULL,NULL,NULL,'2026-02-08 00:59:53','2026-02-08 01:00:18','2026-02-08 01:00:15',NULL,'2026-02-08 00:59:53','2026-02-08 01:01:17',NULL,NULL),(6,3,'Bruno Taype','bruno@gmail.com','942381162','MZ J LOTE 2 ENRIQUE MONTENEGRO, SJL, LIMA','Lima','SJL','',NULL,'ORD-20260208-0E85F00F',389.97,0.00,389.97,'yape',NULL,'Confirmed','Pending','Boleta',NULL,NULL,NULL,'2026-02-08 01:01:09',NULL,NULL,NULL,'2026-02-08 01:01:09','2026-02-08 01:01:16',NULL,NULL),(7,NULL,'Juan','xplitc@gmail.com','942381162','Av Mar Adriatico','Lima','San Juan de Lurigancho','',NULL,'ORD-20260223-F851E659',279.98,0.00,279.98,'yape',NULL,'Pending','Pending','Boleta',NULL,NULL,NULL,'2026-02-23 04:28:12',NULL,NULL,NULL,'2026-02-23 04:28:12','2026-02-23 04:28:12',NULL,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(200) NOT NULL,
  `Code` varchar(50) DEFAULT NULL,
  `Brand` varchar(100) NOT NULL,
  `CategoryId` int(11) NOT NULL,
  `Size` varchar(20) NOT NULL,
  `Price` decimal(18,2) NOT NULL,
  `Stock` int(11) NOT NULL,
  `Description` text DEFAULT NULL,
  `ImageUrl` varchar(500) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT 1,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` datetime DEFAULT NULL,
  `SalePrice` decimal(18,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`Id`),
  KEY `idx_category` (`CategoryId`),
  KEY `idx_name` (`Name`),
  KEY `idx_brand` (`Brand`),
  KEY `idx_code` (`Code`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`CategoryId`) REFERENCES `categories` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Nike Air Max 2024','NK-AM24-42','Nike',1,'42',129.99,38,'Zapatillas deportivas con tecnolog?a Air Max para m?ximo confort',NULL,1,'2026-02-06 10:11:22','2026-02-08 01:01:09',0.00),(2,'Adidas Ultraboost','AD-UB21-41','Adidas',1,'41',149.99,27,'Zapatillas running con tecnolog?a Boost',NULL,1,'2026-02-06 10:11:22','2026-02-06 10:50:20',0.00),(3,'Clarks Desert Boot','CL-DB-42','Clarks',2,'42',119.99,11,'Botas cl?sicas de cuero genuino',NULL,1,'2026-02-06 10:11:22','2026-02-23 04:28:12',0.00),(4,'Oxford Professional','OX-PR-43','Oxford',3,'43',89.99,3,'Zapatos formales elegantes para oficina',NULL,1,'2026-02-06 10:11:22','2026-02-06 15:50:48',0.00),(5,'Timberland Work Boot','TB-WB-44','Timberland',2,'44',179.99,8,'Botas de trabajo resistentes e impermeables',NULL,1,'2026-02-06 10:11:22',NULL,0.00),(6,'Puma Running Pro','PM-RP-41','Puma',1,'41',99.99,32,'Zapatillas running ligeras y respirables',NULL,1,'2026-02-06 10:11:22',NULL,0.00),(7,'Teva Summer Sandal','TV-SS-42','Teva',4,'42',49.99,38,'Sandalias deportivas para verano',NULL,1,'2026-02-06 10:11:22',NULL,0.00),(8,'Reebok Classic','RB-CL-42','Reebok',1,'42',79.99,44,'Zapatillas cl?sicas retro',NULL,1,'2026-02-06 10:11:22','2026-02-06 10:49:58',0.00),(9,'Caterpillar Work','CT-WK-43','Caterpillar',2,'43',159.99,16,'Botas industriales con puntera de acero',NULL,1,'2026-02-06 10:11:22','2026-02-23 04:28:12',0.00),(10,'Skechers Comfort','SK-CF-41','Skechers',1,'41',69.99,70,'Zapatillas ultra c?modas con memory foam',NULL,1,'2026-02-06 10:11:22','2026-02-07 18:08:00',0.00),(11,'Zapatillas Nike Air Max 270','PROD-021','Nike',1,'42',499.00,25,'Zapatillas deportivas con tecnolog?a Air, suela de espuma, dise?o moderno y c?modo',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26',0.00),(12,'Zapatillas Adidas Ultraboost','PROD-022','Adidas',1,'41',599.00,18,'Zapatillas running con tecnolog?a Boost, m?ximo confort y respuesta energ?tica',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26',0.00),(13,'Zapatillas Puma RS-X','PROD-023','Puma',1,'40',399.00,30,'Zapatillas urbanas retro, dise?o llamativo, ideal para uso casual',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26',0.00),(14,'Zapatillas New Balance 574','PROD-024','New Balance',1,'43',349.00,21,'Zapatillas cl?sicas con suela ENCAP, comodidad todo el d?a',NULL,1,'2026-02-07 13:24:26','2026-02-08 00:59:53',0.00),(15,'Zapatillas Converse All Star','PROD-025','Converse',1,'39',189.00,45,'Zapatillas ic?nicas de lona, estilo atemporal y vers?til',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26',0.00),(16,'Botas Timberland Premium 6\"','PROD-026','Timberland',2,'42',699.00,15,'Botas impermeables de cuero premium, ideales para trekking y uso rudo',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26',0.00),(17,'Botas Dr. Martens 1460','PROD-027','Dr. Martens',2,'41',549.00,20,'Botas de cuero suave, ic?nicas, con suela AirWair resistente',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26',0.00),(18,'Botas Caterpillar Colorado','PROD-028','Caterpillar',2,'43',459.00,18,'Botas de trabajo con puntera de acero, resistentes y duraderas',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26',0.00),(19,'Botas Columbia Newton Ridge','PROD-029','Columbia',2,'40',399.00,25,'Botas de monta?a impermeables, tracci?n superior en terrenos dif?ciles',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26',0.00),(20,'Botas North Face Thermoball','PROD-030','The North Face',2,'42',589.00,12,'Botas t?rmicas aisladas, perfectas para clima fr?o extremo',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26',0.00),(21,'Zapatos Oxford Clarks','PROD-031','Clarks',3,'42',449.00,20,'Zapatos Oxford de cuero genuino, elegantes para ocasiones formales',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26',0.00),(22,'Mocasines Gucci Horsebit','PROD-032','Gucci',3,'41',1299.00,8,'Mocasines de lujo con detalle met?lico, estilo italiano premium',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26',0.00),(23,'Zapatos Derby Florsheim','PROD-033','Florsheim',3,'43',399.00,15,'Zapatos Derby cl?sicos, c?modos y elegantes para oficina',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26',0.00),(24,'Zapatos Monk Strap Magnanni','PROD-034','Magnanni',3,'42',699.00,10,'Zapatos con hebilla doble, artesan?a espa?ola de alta calidad',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26',0.00),(25,'Zapatos Brogue Allen Edmonds','PROD-035','Allen Edmonds',3,'41',799.00,12,'Zapatos brogue con perforaciones decorativas, estilo cl?sico brit?nico',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26',0.00),(26,'Sandalias Birkenstock Arizona','PROD-036','Birkenstock',4,'42',299.00,30,'Sandalias ortop?dicas con plantilla contorneada, m?ximo confort',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26',0.00),(27,'Sandalias Teva Hurricane XLT2','PROD-037','Teva',4,'41',249.00,23,'Sandalias deportivas con correas ajustables, ideales para aventuras',NULL,1,'2026-02-07 13:24:26','2026-02-24 13:37:52',0.00),(28,'Sandalias Reef Fanning','PROD-038','Reef',4,'40',179.00,33,'Sandalias playeras con abrebotellas en la suela, estilo surfer',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26',0.00),(29,'Sandalias Havaianas Slim','PROD-039','Havaianas',4,'39',89.00,50,'Chanclas brasile?as de caucho, ligeras y coloridas para verano',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26',0.00),(30,'Sandalias Keen Newport H2','PROD-040','Keen',4,'43',349.00,20,'Sandalias h?bridas con protecci?n de dedos, perfectas para agua y tierra',NULL,1,'2026-02-07 13:24:26','2026-02-07 13:24:26',0.00);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productvariants`
--

DROP TABLE IF EXISTS `productvariants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productvariants` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `ProductId` int(11) NOT NULL,
  `Size` varchar(20) NOT NULL,
  `Stock` int(11) NOT NULL DEFAULT 0,
  `IsActive` tinyint(1) NOT NULL DEFAULT 1,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`Id`),
  UNIQUE KEY `uq_product_size` (`ProductId`,`Size`),
  KEY `idx_product` (`ProductId`),
  KEY `idx_size` (`Size`),
  KEY `idx_active` (`IsActive`),
  KEY `idx_stock` (`Stock`),
  CONSTRAINT `productvariants_ibfk_1` FOREIGN KEY (`ProductId`) REFERENCES `products` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Variantes de talla por producto con stock individual';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productvariants`
--

LOCK TABLES `productvariants` WRITE;
/*!40000 ALTER TABLE `productvariants` DISABLE KEYS */;
INSERT INTO `productvariants` VALUES (1,1,'42',38,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(2,2,'41',27,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(3,3,'42',11,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(4,4,'43',3,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(5,5,'44',8,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(6,6,'41',32,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(7,7,'42',38,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(8,8,'42',44,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(9,9,'43',16,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(10,10,'41',70,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(11,11,'42',25,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(12,12,'41',18,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(13,13,'40',30,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(14,14,'43',21,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(15,15,'39',45,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(16,16,'42',15,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(17,17,'41',20,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(18,18,'43',18,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(19,19,'40',25,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(20,20,'42',12,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(21,21,'42',20,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(22,22,'41',8,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(23,23,'43',15,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(24,24,'42',10,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(25,25,'41',12,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(26,26,'42',30,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(27,27,'41',25,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(28,28,'40',33,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(29,29,'39',50,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(30,30,'43',20,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(32,1,'39',8,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(33,1,'40',12,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(34,1,'41',15,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(35,1,'43',7,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(36,1,'44',4,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(38,2,'38',5,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(39,2,'39',9,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(40,2,'40',11,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(41,2,'42',6,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(42,2,'43',4,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(43,2,'44',2,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(45,3,'38',6,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(46,3,'39',10,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(47,3,'40',14,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(48,3,'41',9,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(50,4,'39',7,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(51,4,'40',13,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(52,4,'41',10,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(53,4,'42',8,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(54,4,'44',3,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(56,5,'35',10,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(57,5,'36',12,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(58,5,'37',15,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(59,5,'38',14,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(60,5,'39',11,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(61,5,'40',8,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(62,5,'41',6,1,'2026-02-23 01:26:38','2026-02-23 01:26:38'),(63,5,'42',4,1,'2026-02-23 01:26:38','2026-02-23 01:26:38');
/*!40000 ALTER TABLE `productvariants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchasedetails`
--

DROP TABLE IF EXISTS `purchasedetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchasedetails` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `PurchaseId` int(11) NOT NULL,
  `ProductId` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL,
  `UnitCost` decimal(18,2) NOT NULL,
  `Subtotal` decimal(18,2) NOT NULL,
  `VariantId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_purchase` (`PurchaseId`),
  KEY `idx_product` (`ProductId`),
  KEY `fk_pd_variant` (`VariantId`),
  CONSTRAINT `fk_pd_variant` FOREIGN KEY (`VariantId`) REFERENCES `productvariants` (`Id`) ON DELETE SET NULL,
  CONSTRAINT `purchasedetails_ibfk_1` FOREIGN KEY (`PurchaseId`) REFERENCES `purchases` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `purchasedetails_ibfk_2` FOREIGN KEY (`ProductId`) REFERENCES `products` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchasedetails`
--

LOCK TABLES `purchasedetails` WRITE;
/*!40000 ALTER TABLE `purchasedetails` DISABLE KEYS */;
INSERT INTO `purchasedetails` VALUES (1,1,8,20,47.99,959.88,NULL),(2,2,10,11,41.99,461.93,NULL),(3,2,2,10,89.99,899.94,NULL),(4,2,10,24,41.99,1007.86,NULL),(5,3,1,20,77.99,1559.88,NULL);
/*!40000 ALTER TABLE `purchasedetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `SupplierId` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `PurchaseDate` datetime NOT NULL DEFAULT current_timestamp(),
  `InvoiceNumber` varchar(50) NOT NULL,
  `Total` decimal(18,2) NOT NULL,
  `Status` varchar(50) NOT NULL DEFAULT 'Completed',
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `Notes` varchar(500) DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_supplier` (`SupplierId`),
  KEY `idx_user` (`UserId`),
  KEY `idx_date` (`PurchaseDate`),
  CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`SupplierId`) REFERENCES `suppliers` (`Id`),
  CONSTRAINT `purchases_ibfk_2` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
INSERT INTO `purchases` VALUES (1,2,1,'2026-02-06 20:49:00','F00001',959.88,'Completada','2026-02-06 10:49:58',NULL,NULL),(2,3,1,'2026-02-06 20:50:00','F00002',2369.73,'Completada','2026-02-06 10:50:20',NULL,NULL),(3,1,1,'2026-02-08 05:58:00','F00005',1559.88,'Completada','2026-02-07 19:58:46',NULL,NULL);
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saledetails`
--

DROP TABLE IF EXISTS `saledetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saledetails` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `SaleId` int(11) NOT NULL,
  `ProductId` int(11) NOT NULL,
  `VariantId` int(11) DEFAULT NULL,
  `Quantity` int(11) NOT NULL,
  `UnitPrice` decimal(18,2) NOT NULL,
  `Subtotal` decimal(18,2) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_sale` (`SaleId`),
  KEY `idx_product` (`ProductId`),
  KEY `fk_saledetail_variant` (`VariantId`),
  CONSTRAINT `fk_saledetail_variant` FOREIGN KEY (`VariantId`) REFERENCES `productvariants` (`Id`) ON DELETE SET NULL,
  CONSTRAINT `saledetails_ibfk_1` FOREIGN KEY (`SaleId`) REFERENCES `sales` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `saledetails_ibfk_2` FOREIGN KEY (`ProductId`) REFERENCES `products` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saledetails`
--

LOCK TABLES `saledetails` WRITE;
/*!40000 ALTER TABLE `saledetails` DISABLE KEYS */;
INSERT INTO `saledetails` VALUES (1,1,1,NULL,2,129.99,259.98),(2,2,4,NULL,2,89.99,179.98),(3,2,10,NULL,1,69.99,69.99),(4,3,2,NULL,2,149.99,299.98),(5,4,2,NULL,1,149.99,149.99),(6,5,5,NULL,2,179.99,359.98),(7,6,1,NULL,1,129.99,129.99),(8,6,6,NULL,1,99.99,99.99),(9,7,8,NULL,2,79.99,159.98),(10,7,10,NULL,1,69.99,69.99),(11,8,3,NULL,2,119.99,239.98),(12,8,7,NULL,1,49.99,49.99),(13,9,1,NULL,2,129.99,259.98),(14,9,2,NULL,1,149.99,149.99),(15,10,4,NULL,3,89.99,269.97),(16,10,10,NULL,1,69.99,69.99),(17,11,5,NULL,2,179.99,359.98),(18,11,1,NULL,1,129.99,129.99),(19,12,8,NULL,2,79.99,159.98),(20,12,7,NULL,1,49.99,49.99),(21,13,4,NULL,20,89.99,1799.80),(22,14,10,NULL,5,69.99,349.95),(23,15,6,NULL,2,99.99,199.98),(24,16,28,NULL,2,179.00,358.00),(25,17,27,NULL,2,249.00,498.00);
/*!40000 ALTER TABLE `saledetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `CustomerId` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `SaleDate` datetime NOT NULL DEFAULT current_timestamp(),
  `Total` decimal(18,2) NOT NULL,
  `Status` varchar(20) NOT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`Id`),
  KEY `idx_customer` (`CustomerId`),
  KEY `idx_user` (`UserId`),
  KEY `idx_date` (`SaleDate`),
  CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`CustomerId`) REFERENCES `customers` (`Id`),
  CONSTRAINT `sales_ibfk_2` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (1,1,1,'2026-02-06 10:26:28',259.98,'Completed','2026-02-06 10:26:28'),(2,2,1,'2026-02-06 10:26:28',189.98,'Completed','2026-02-06 10:26:28'),(3,1,1,'2026-02-05 10:26:28',299.97,'Completed','2026-02-05 10:26:28'),(4,3,1,'2026-02-05 10:26:28',149.99,'Completed','2026-02-05 10:26:28'),(5,2,1,'2026-02-04 10:26:28',329.96,'Completed','2026-02-04 10:26:28'),(6,1,1,'2026-02-03 10:26:28',229.97,'Completed','2026-02-03 10:26:28'),(7,2,1,'2026-02-03 10:26:28',179.98,'Completed','2026-02-03 10:26:28'),(8,3,1,'2026-02-01 10:26:28',269.97,'Completed','2026-02-01 10:26:28'),(9,1,1,'2026-01-06 10:26:28',399.95,'Completed','2026-01-06 10:26:28'),(10,2,1,'2026-01-06 10:26:28',289.97,'Completed','2026-01-06 10:26:28'),(11,1,1,'2025-12-06 10:26:28',449.96,'Completed','2025-12-06 10:26:28'),(12,3,1,'2025-12-06 10:26:28',199.98,'Completed','2025-12-06 10:26:28'),(13,1,1,'2026-02-07 11:36:53',1799.80,'Completed','2026-02-07 11:36:53'),(14,1,3,'2026-02-07 13:14:52',349.95,'Completed','2026-02-07 13:14:52'),(15,4,1,'2026-02-07 19:58:07',199.98,'Completed','2026-02-07 19:58:07'),(16,2,1,'2026-02-22 20:35:33',358.00,'Completed','2026-02-22 20:35:33'),(17,5,1,'2026-02-24 13:37:52',498.00,'Completed','2026-02-24 13:37:52');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `CompanyName` varchar(100) NOT NULL,
  `ContactName` varchar(100) NOT NULL,
  `DocumentNumber` varchar(20) NOT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Address` varchar(200) DEFAULT NULL,
  `City` varchar(100) DEFAULT NULL,
  `Country` varchar(100) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT 1,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `DocumentNumber` (`DocumentNumber`),
  KEY `idx_name` (`CompanyName`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'Nike Per? SAC','Roberto Silva','20456789123','014567890','ventas@nike.pe','Av. Javier Prado 2500','Lima','Per?',1,'2026-02-06 10:11:22',NULL),(2,'Adidas Distribution','Mar?a Torres','20567891234','014567891','ventas@adidas.pe','Av. Larco 1234','Lima','Per?',1,'2026-02-06 10:11:22',NULL),(3,'Calzados Importados SAC','Jorge Vargas','20678912345','014567892','ventas@calzimport.com','Jr. Puno 567','Lima','Per?',1,'2026-02-06 10:11:22',NULL);
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `FullName` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Role` varchar(20) NOT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT 1,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Username` (`Username`),
  KEY `idx_username` (`Username`),
  KEY `idx_email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2a$11$mSiqqJc66CfN.QSbauOBaexU2tSznqKFHKUKj3KX4D3UaaIGWK4qK','Administrador del Sistema','admin@noblestep.com','Administrator',1,'2026-02-23 02:50:26'),(2,'vendedor1','$2a$11$mSiqqJc66CfN.QSbauOBaexU2tSznqKFHKUKj3KX4D3UaaIGWK4qK','Juan Vendedor','vendedor@noblestep.com','Seller',1,'2026-02-23 02:50:26'),(3,'admin2','$2a$11$GWMSRp9NPvkOOi4638K3tOk8svtnV5O9.FLeLsraWAw6xwngJ9r5W','Bruno Taype','cordova@gmail.com','Administrator',1,'2026-02-07 16:37:27');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'noblestep_db'
--
--
-- WARNING: can't read the INFORMATION_SCHEMA.libraries table. It's most probably an old server 5.5.5-10.4.32-MariaDB.
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-24 14:31:09
