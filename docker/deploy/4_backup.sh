#!/bin/bash
# ============================================================
# NobleStep - Backup automático de MySQL
# Configura un cron que crea dumps diarios y limpia los viejos
#
# USO MANUAL:  bash 4_backup.sh
# INSTALAR CRON: bash 4_backup.sh --install-cron
#
# Los backups se guardan en /var/backups/noblestep/
# Se retienen los últimos 30 días.
# ============================================================

set -euo pipefail

BACKUP_DIR="/var/backups/noblestep"
DB_NAME="noblestep_db"
DB_USER="noblestep"
RETENTION_DAYS=30
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

# --- Instalar cron ---
if [ "${1:-}" == "--install-cron" ]; then
    echo "Instalando cron de backup diario a las 02:00..."
    SCRIPT_PATH="$(readlink -f "$0")"
    # Añadir al crontab de root si no existe
    CRON_ENTRY="0 2 * * * /bin/bash $SCRIPT_PATH >> /var/log/noblestep-backup.log 2>&1"
    (crontab -l 2>/dev/null | grep -v "noblestep" ; echo "$CRON_ENTRY") | crontab -
    echo "  ✅ Cron instalado: $CRON_ENTRY"
    echo "  📋 Verificar: crontab -l"
    exit 0
fi

# --- Crear directorio de backups ---
mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando backup de $DB_NAME..."

# --- Crear backup comprimido ---
# Usa ~/.my.cnf o pide password. Para automatizar:
# Crear /root/.my.cnf con:
#   [mysqldump]
#   user=noblestep
#   password=TU_PASSWORD
#   Permisos: chmod 600 /root/.my.cnf
mysqldump \
    --user="$DB_USER" \
    --single-transaction \
    --routines \
    --triggers \
    --add-drop-table \
    "$DB_NAME" | gzip > "$BACKUP_FILE"

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "  ✅ Backup creado: $BACKUP_FILE ($BACKUP_SIZE)"

# --- Limpiar backups antiguos ---
DELETED=$(find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
    echo "  🗑️  $DELETED backup(s) antiguos eliminados (>$RETENTION_DAYS días)"
fi

# --- Opcional: Subir a DigitalOcean Spaces / S3 ---
# Descomenta y configura si tienes un bucket:
# if command -v s3cmd &>/dev/null; then
#     s3cmd put "$BACKUP_FILE" s3://noblestep-backups/
#     echo "  ☁️  Backup subido a S3"
# fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup completado."
