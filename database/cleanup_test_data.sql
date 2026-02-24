-- =============================================================================
-- SCRIPT DE LIMPIEZA DE DATOS DE PRUEBA PARA PRODUCCIÓN
-- NobleStep — Ejecutar UNA SOLA VEZ antes del despliegue a producción
-- =============================================================================
-- ADVERTENCIA: Este script elimina datos de prueba.
-- Hacer backup ANTES de ejecutar: mysqldump -u root noblestep_db > backup.sql
-- =============================================================================

USE noblestep_db;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. Limpiar detalles de órdenes de prueba (ecommerce)
-- -----------------------------------------------------------------------------
DELETE FROM orderdetails
WHERE OrderId IN (
    SELECT Id FROM orders WHERE Status IN ('pending','test','prueba')
);

-- -----------------------------------------------------------------------------
-- 2. Limpiar órdenes de prueba (ecommerce)
-- -----------------------------------------------------------------------------
DELETE FROM orders
WHERE Status IN ('pending','test','prueba')
   OR CustomerName LIKE '%test%'
   OR CustomerName LIKE '%prueba%';

-- -----------------------------------------------------------------------------
-- 3. Limpiar clientes ecommerce de prueba
-- -----------------------------------------------------------------------------
DELETE FROM ecommercecustomers
WHERE Email LIKE '%test%'
   OR Email LIKE '%prueba%'
   OR Email LIKE '%example%'
   OR Email LIKE '%demo%';

-- -----------------------------------------------------------------------------
-- 4. Limpiar clientes admin de prueba
-- -----------------------------------------------------------------------------
DELETE FROM customers
WHERE Name LIKE '%test%'
   OR Name LIKE '%prueba%'
   OR Name LIKE '%demo%';

-- -----------------------------------------------------------------------------
-- 5. Dejar solo el usuario administrador principal (eliminar usuarios de prueba)
--    IMPORTANTE: Ajusta el Username del admin real antes de ejecutar
-- -----------------------------------------------------------------------------
-- DELETE FROM users WHERE Username NOT IN ('admin');

-- -----------------------------------------------------------------------------
-- 6. Limpiar tokens de reset password expirados
-- -----------------------------------------------------------------------------
UPDATE ecommercecustomers
SET PasswordResetToken = NULL,
    PasswordResetExpires = NULL
WHERE PasswordResetExpires < NOW()
   OR PasswordResetExpires IS NOT NULL;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- Verificación final
-- -----------------------------------------------------------------------------
SELECT 'categories'        AS tabla, COUNT(*) AS registros FROM categories
UNION ALL SELECT 'products',          COUNT(*) FROM products
UNION ALL SELECT 'productvariants',   COUNT(*) FROM productvariants
UNION ALL SELECT 'users',             COUNT(*) FROM users
UNION ALL SELECT 'customers',         COUNT(*) FROM customers
UNION ALL SELECT 'ecommercecustomers',COUNT(*) FROM ecommercecustomers
UNION ALL SELECT 'orders',            COUNT(*) FROM orders
UNION ALL SELECT 'orderdetails',      COUNT(*) FROM orderdetails
UNION ALL SELECT 'sales',             COUNT(*) FROM sales
UNION ALL SELECT 'saledetails',       COUNT(*) FROM saledetails
UNION ALL SELECT 'purchases',         COUNT(*) FROM purchases
UNION ALL SELECT 'purchasedetails',   COUNT(*) FROM purchasedetails;
