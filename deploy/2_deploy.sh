#!/bin/bash
# ============================================================
# NobleStep - Script de deploy completo
# Ejecutar en cada actualización: bash 2_deploy.sh
# VPS: Ubuntu 22.04 | Usuario: juan
# ============================================================

set -e
REPO_DIR=~/noblestep
REPO_URL=https://github.com/JesusEchavandi/noblestep.git

echo "================================================"
echo "  NobleStep - Deploy"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================================"

# --- Clonar o actualizar repositorio ---
echo ""
echo "[1/5] Obteniendo código fuente..."
if [ -d "$REPO_DIR/.git" ]; then
    cd $REPO_DIR
    git pull origin main
    echo "  ✅ Repositorio actualizado"
else
    git clone git@github.com:JesusEchavandi/noblestep.git $REPO_DIR
    echo "  ✅ Repositorio clonado"
fi

cd $REPO_DIR

# --- Importar base de datos (solo si es primer deploy) ---
if [ "$1" == "--init-db" ]; then
    echo ""
    echo "[DB] Importando schema de base de datos..."
    mysql -u noblestep -pL4grimas noblestep_db < database/noblestep_db.sql
    echo "  ✅ Schema importado"
fi

# --- Backend .NET ---
echo ""
echo "[2/5] Compilando backend .NET..."
dotnet publish backend/NobleStep.Api.csproj -c Release -o /var/www/noblestep-api
echo "  ✅ Backend compilado en /var/www/noblestep-api"

# --- Configurar servicio systemd ---
echo ""
echo "[3/5] Configurando servicio systemd..."
sudo cp deploy/noblestep-api.service /etc/systemd/system/noblestep-api.service
sudo systemctl daemon-reload
sudo systemctl enable noblestep-api
sudo systemctl restart noblestep-api
sleep 2
if sudo systemctl is-active --quiet noblestep-api; then
    echo "  ✅ Servicio noblestep-api corriendo"
else
    echo "  ❌ Error al iniciar el servicio. Revisa: sudo journalctl -u noblestep-api -n 50"
    exit 1
fi

# --- Frontends Angular ---
echo ""
echo "[4/5] Compilando frontends Angular..."
cd $REPO_DIR/frontend
npm install --silent

echo "  Compilando Admin panel..."
npm run build -- --configuration production
echo "  Compilando Ecommerce..."
npm run build:ecommerce -- --configuration production

# Copiar a /var/www/
echo "  Copiando archivos..."
rm -rf /var/www/noblestep-admin/*
rm -rf /var/www/noblestep-ecommerce/*
cp -r dist/noblestep-web/browser/. /var/www/noblestep-admin/
cp -r dist/ecommerce/browser/. /var/www/noblestep-ecommerce/
echo "  ✅ Frontends compilados y copiados"

# --- Nginx ---
echo ""
echo "[5/5] Configurando Nginx..."
cd $REPO_DIR
sudo cp deploy/nginx-noblestep.conf /etc/nginx/sites-available/noblestep
sudo ln -sf /etc/nginx/sites-available/noblestep /etc/nginx/sites-enabled/noblestep

# Eliminar el sitio default si existe
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl restart nginx
echo "  ✅ Nginx configurado y reiniciado"

echo ""
echo "================================================"
echo "  ✅ Deploy completado exitosamente!"
echo ""
echo "  🌐 Admin:     http://104.131.62.116:3000"
echo "  🛒 Ecommerce: http://104.131.62.116:3001"
echo "  🔌 API:       http://104.131.62.116:5000/api"
echo "================================================"
