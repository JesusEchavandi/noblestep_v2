# NobleStep — Variables de Entorno para Producción

## Variables OBLIGATORIAS

Configúralas en `/etc/systemd/system/noblestep-api.service` dentro de la sección `[Service]`:

```ini
# Base de datos MySQL
Environment=NOBLESTEP_DB_CONNECTION=Server=localhost;Database=noblestep_db;User=noblestep;Password=<PASSWORD_SEGURO>;

# JWT — clave secreta de mínimo 32 caracteres, generada con:
#   openssl rand -base64 48
Environment=NOBLESTEP_JWT_SECRET=<CLAVE_JWT_SEGURA_MIN_32_CHARS>

# SMTP — contraseña de aplicación de Gmail
Environment=NOBLESTEP_SMTP_PASSWORD=<APP_PASSWORD_GMAIL>

# Token de API de consulta DNI (apiconsulta.pe)
Environment=NOBLESTEP_API_TOKEN=<TOKEN_API_CONSULTA>

# URL pública del frontend ecommerce
Environment=NOBLESTEP_FRONTEND_URL=https://tudominio.com

# Orígenes CORS permitidos (separados por coma)
Environment=NOBLESTEP_CORS_ORIGINS=https://tudominio.com,https://admin.tudominio.com
```

## Cómo generar una clave JWT segura

```bash
openssl rand -base64 48
```

## Cómo generar un password MySQL seguro

```bash
openssl rand -base64 24
```

## Después de modificar el .service

```bash
sudo systemctl daemon-reload
sudo systemctl restart noblestep-api
```

## ⚠️ NUNCA commits estos valores al repositorio
