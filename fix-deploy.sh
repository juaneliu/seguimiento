#!/bin/bash

# Script de actualización para solucionar problemas de archivos estáticos
# Ejecutar en el servidor como: bash fix-deploy.sh

echo "🔧 Solucionando problemas de archivos estáticos en producción..."

# Variables
APP_NAME="tablero-estadistico"
APP_DIR="/var/www/$APP_NAME"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# 1. Detener aplicación actual
log "Deteniendo aplicación actual..."
sudo -u $APP_NAME pm2 stop all || true

# 2. Actualizar código desde repositorio
log "Actualizando código..."
cd $APP_DIR
sudo -u $APP_NAME git pull origin main

# 3. Instalar dependencias
log "Instalando dependencias..."
sudo -u $APP_NAME npm ci

# 4. Limpiar build anterior
log "Limpiando build anterior..."
sudo -u $APP_NAME rm -rf .next

# 5. Regenerar Prisma Client
log "Regenerando Prisma Client..."
sudo -u $APP_NAME npx prisma generate

# 6. Build de producción
log "Construyendo para producción..."
sudo -u $APP_NAME npm run build

# 7. Crear directorio de logs si no existe
log "Creando directorio de logs..."
sudo -u $APP_NAME mkdir -p logs

# 8. Reiniciar con PM2
log "Reiniciando aplicación..."
sudo -u $APP_NAME pm2 start ecosystem.config.json --env production

# 9. Reiniciar Nginx para limpiar cache
log "Reiniciando Nginx..."
sudo systemctl restart nginx

# 10. Verificar estado
log "Verificando estado de la aplicación..."
sleep 5
sudo -u $APP_NAME pm2 status

# 11. Verificar si el puerto 3000 está escuchando
log "Verificando puerto 3000..."
if sudo netstat -tlnp | grep :3000; then
    log "✅ Aplicación ejecutándose en puerto 3000"
else
    error "❌ La aplicación no está escuchando en puerto 3000"
    sudo -u $APP_NAME pm2 logs --lines 20
fi

# 12. Test de conectividad local
log "Probando conectividad local..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    log "✅ Aplicación responde localmente"
else
    warning "⚠️ La aplicación podría no estar respondiendo correctamente"
fi

log "🎉 Actualización completada!"
log "💡 Si persisten problemas, revisa los logs: sudo -u $APP_NAME pm2 logs"
log "💡 Para reiniciar: sudo -u $APP_NAME pm2 restart all"
