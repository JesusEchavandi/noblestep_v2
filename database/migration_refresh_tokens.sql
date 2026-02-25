-- Migración: Agregar columnas de Refresh Token
-- Ejecutar en producción al desplegar esta versión
USE noblestep_db;

ALTER TABLE Users
    ADD COLUMN IF NOT EXISTS RefreshTokenHash VARCHAR(128) NULL,
    ADD COLUMN IF NOT EXISTS RefreshTokenExpires DATETIME NULL;

ALTER TABLE EcommerceCustomers
    ADD COLUMN IF NOT EXISTS RefreshTokenHash VARCHAR(128) NULL,
    ADD COLUMN IF NOT EXISTS RefreshTokenExpires DATETIME NULL;

-- Índices para búsqueda rápida por hash
CREATE INDEX IF NOT EXISTS idx_users_refresh_token ON Users(RefreshTokenHash);
CREATE INDEX IF NOT EXISTS idx_ecommerce_customers_refresh_token ON EcommerceCustomers(RefreshTokenHash);
