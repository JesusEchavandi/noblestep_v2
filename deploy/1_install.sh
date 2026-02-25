#!/bin/bash
# ============================================================
# NobleStep - Script de instalación inicial del VPS
# Ejecutar UNA SOLA VEZ como: bash 1_install.sh
# VPS: Ubuntu 22.04 | Usuario: juan
# ============================================================

set -e
echo "================================================"
echo "  NobleStep - Instalación del servidor"
echo "================================================"

# --- Actualizar sistema ---
echo ""
echo "[1/7] Actualizando sistema..."
sudo apt update
# Upgrade sin dotnet para evitar conflictos (se instala después por separado)
sudo apt upgrade -y --exclude='dotnet*' --exclude='aspnet*' --exclude='netstandard*'

# --- Nginx ---
echo ""
echo "[2/7] Instalando Nginx..."
sudo apt install nginx -y
sudo systemctl enable nginx

# --- MySQL ---
echo ""
echo "[3/7] Instalando MySQL..."
sudo apt install mysql-server -y
sudo systemctl enable mysql

# Configurar usuario de MySQL para NobleStep
echo ""
echo "[3.1] Configurando base de datos NobleStep..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS noblestep_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'noblestep'@'localhost' IDENTIFIED BY 'L4grimas';"
sudo mysql -e "GRANT ALL PRIVILEGES ON noblestep_db.* TO 'noblestep'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
echo "  ✅ Base de datos lista: noblestep_db"

# --- Node.js 20 ---
echo ""
echo "[4/7] Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
echo "  ✅ Node $(node -v) instalado"

# --- .NET 8 ---
echo ""
echo "[5/7] Instalando .NET 8..."
# Eliminar paquetes conflictivos de .NET si existen
sudo apt remove -y dotnet-host dotnet-host-8.0 netstandard-targeting-pack-2.1 netstandard-targeting-pack-2.1-8.0 2>/dev/null || true
sudo apt autoremove -y 2>/dev/null || true
# Registrar repo de Microsoft si no está
if [ ! -f /etc/apt/sources.list.d/microsoft-prod.list ]; then
    wget -q https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
    sudo dpkg -i packages-microsoft-prod.deb
    rm packages-microsoft-prod.deb
fi
sudo apt update
sudo apt install -y dotnet-sdk-8.0
echo "  ✅ .NET $(dotnet --version) instalado"

# --- Directorios de la app ---
echo ""
echo "[6/7] Creando directorios de la aplicación..."
sudo mkdir -p /var/www/noblestep-admin
sudo mkdir -p /var/www/noblestep-ecommerce
sudo mkdir -p /var/www/noblestep-api
sudo mkdir -p /var/log/noblestep
sudo chown -R juan:juan /var/www/noblestep-admin
sudo chown -R juan:juan /var/www/noblestep-ecommerce
sudo chown -R juan:juan /var/www/noblestep-api
sudo chown -R juan:juan /var/log/noblestep
echo "  ✅ Directorios creados"

# --- Firewall ---
echo ""
echo "[7/7] Configurando firewall (UFW)..."
sudo ufw allow OpenSSH
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 5000/tcp
sudo ufw --force enable
echo "  ✅ Puertos 3000, 3001, 5000 y SSH abiertos"

echo ""
echo "================================================"
echo "  ✅ Instalación completada!"
echo "  Siguiente paso: bash 2_deploy.sh"
echo "================================================"
