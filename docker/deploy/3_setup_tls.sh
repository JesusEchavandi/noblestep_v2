#!/bin/bash
# ============================================================
# NobleStep - Configurar TLS con Let's Encrypt (Certbot)
# Ejecutar una sola vez en el VPS: sudo bash 3_setup_tls.sh
#
# REQUISITOS PREVIOS:
# 1. Tener un dominio apuntando a la IP del VPS (ej: noblestep.pe)
# 2. Crear subdominio admin.noblestep.pe → misma IP
# 3. Tener Nginx instalado y corriendo
#
# USO: sudo bash 3_setup_tls.sh noblestep.pe tu@email.com
# ============================================================

set -e

DOMAIN=${1:-""}
EMAIL=${2:-""}

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "❌ Uso: sudo bash 3_setup_tls.sh <dominio> <email>"
    echo "   Ejemplo: sudo bash 3_setup_tls.sh noblestep.pe admin@noblestep.pe"
    exit 1
fi

echo "================================================"
echo "  NobleStep - Setup TLS / Let's Encrypt"
echo "  Dominio: $DOMAIN"
echo "  Email:   $EMAIL"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================================"

# --- 1. Instalar Certbot ---
echo ""
echo "[1/5] Instalando Certbot..."
apt update -qq
apt install -y certbot python3-certbot-nginx
echo "  ✅ Certbot instalado"

# --- 2. Crear directorio para challenge ---
echo ""
echo "[2/5] Preparando directorios..."
mkdir -p /var/www/certbot
echo "  ✅ /var/www/certbot creado"

# --- 3. Copiar config de Nginx con TLS ---
echo ""
echo "[3/5] Configurando Nginx con TLS..."
REPO_DIR=$(dirname "$(readlink -f "$0")")/..
NGINX_CONF="$REPO_DIR/deploy/nginx-noblestep-tls.conf"

if [ ! -f "$NGINX_CONF" ]; then
    NGINX_CONF="/home/juan/noblestep/deploy/nginx-noblestep-tls.conf"
fi

# Reemplazar placeholder DOMINIO.COM con dominio real
sed "s/DOMINIO\.COM/$DOMAIN/g" "$NGINX_CONF" > /etc/nginx/sites-available/noblestep-tls

# Primero mantener la config sin TLS para el challenge
cat > /etc/nginx/sites-available/noblestep-challenge <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN admin.$DOMAIN api.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'Challenge server ready';
        add_header Content-Type text/plain;
    }
}
EOF

ln -sf /etc/nginx/sites-available/noblestep-challenge /etc/nginx/sites-enabled/noblestep
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "  ✅ Nginx preparado para challenge"

# --- 4. Obtener certificado ---
echo ""
echo "[4/5] Obteniendo certificado SSL..."
certbot certonly --webroot \
    -w /var/www/certbot \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    -d "admin.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email

echo "  ✅ Certificado SSL obtenido"

# --- 5. Activar config TLS ---
echo ""
echo "[5/5] Activando configuración TLS..."
ln -sf /etc/nginx/sites-available/noblestep-tls /etc/nginx/sites-enabled/noblestep
rm -f /etc/nginx/sites-available/noblestep-challenge
nginx -t && systemctl reload nginx
echo "  ✅ Nginx con TLS activado"

# --- Verificar auto-renovación ---
echo ""
echo "Verificando auto-renovación..."
certbot renew --dry-run
echo "  ✅ Auto-renovación configurada"

echo ""
echo "================================================"
echo "  ✅ TLS configurado exitosamente!"
echo ""
echo "  🛒 Ecommerce: https://$DOMAIN"
echo "  🔧 Admin:     https://admin.$DOMAIN"
echo "  🔌 API:       https://$DOMAIN/api"
echo ""
echo "  📋 Los certificados se renuevan automáticamente."
echo "  📋 Verificar: sudo certbot certificates"
echo "================================================"
