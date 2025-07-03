#!/bin/bash

# Script de Actualización para Seguimiento SAEM
# Ejecutar con: bash update-deploy.sh

echo "🔄 Actualizando Tablero de Seguimiento SAEM..."

# Variables de configuración actual
APP_DIR="/home/ubuntu/seguimiento"
USER="ubuntu"
PM2_PROCESS="seguimiento-saem"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -d "$APP_DIR" ]; then
    error "Directorio de aplicación no encontrado: $APP_DIR"
fi

cd $APP_DIR || error "No se pudo acceder al directorio $APP_DIR"

# Verificar que es un repositorio git
if [ ! -d ".git" ]; then
    error "Este no es un repositorio git válido"
fi

# 1. Verificar estado actual
log "Verificando estado actual..."
info "Directorio: $(pwd)"
info "Usuario: $(whoami)"
info "Rama actual: $(git branch --show-current)"

# 2. Parar PM2 temporalmente
log "Deteniendo aplicación PM2..."
pm2 stop $PM2_PROCESS || warning "No se pudo detener $PM2_PROCESS (puede que no esté ejecutándose)"

# 3. Crear backup del estado actual (opcional)
log "Creando backup del commit actual..."
CURRENT_COMMIT=$(git rev-parse HEAD)
echo $CURRENT_COMMIT > .last-deploy-commit
info "Commit actual guardado: $CURRENT_COMMIT"

# 4. Actualizar código desde repositorio
log "Actualizando código desde GitHub..."
git fetch origin || error "Error al hacer fetch del repositorio"
git pull origin main || error "Error al hacer pull del repositorio"

# 5. Verificar cambios
CHANGES=$(git diff HEAD~1 --name-only)
if [ -n "$CHANGES" ]; then
    info "Archivos modificados:"
    echo "$CHANGES" | while read -r file; do
        echo "  - $file"
    done
else
    info "No hay cambios nuevos"
fi

# 6. Instalar/actualizar dependencias (solo si package.json cambió)
if echo "$CHANGES" | grep -q "package.json\|package-lock.json"; then
    log "Actualizando dependencias..."
    npm install || error "Error al instalar dependencias"
else
    info "No hay cambios en dependencias"
fi

# 7. Ejecutar migraciones de base de datos (solo si hay cambios en schema)
if echo "$CHANGES" | grep -q "prisma/schema.prisma\|prisma/migrations"; then
    log "Ejecutando migraciones de base de datos..."
    npx prisma migrate deploy || error "Error al ejecutar migraciones"
    
    log "Regenerando Prisma Client..."
    npx prisma generate || error "Error al generar Prisma Client"
else
    info "No hay cambios en base de datos"
fi

# 8. Rebuild de la aplicación
log "Reconstruyendo aplicación..."
npm run build || error "Error al construir la aplicación"

# 9. Reiniciar PM2
log "Reiniciando aplicación PM2..."
pm2 start $PM2_PROCESS || pm2 restart $PM2_PROCESS || error "Error al reiniciar PM2"

# 10. Verificar que la aplicación esté funcionando
log "Verificando estado de la aplicación..."
sleep 3
pm2 status $PM2_PROCESS

# 11. Verificar conectividad HTTP
log "Verificando conectividad HTTP..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|302"; then
    info "✅ Aplicación respondiendo correctamente"
else
    warning "⚠️  La aplicación puede no estar respondiendo correctamente"
fi

# 12. Recargar Nginx si hay cambios en configuración
if echo "$CHANGES" | grep -q "nginx.conf\|nginx-temp.conf"; then
    log "Recargando configuración de Nginx..."
    if sudo nginx -t; then
        sudo systemctl reload nginx
        info "✅ Nginx recargado correctamente"
    else
        error "❌ Error en configuración de Nginx"
    fi
else
    info "No hay cambios en configuración de Nginx"
fi

# 13. Mostrar información final
log "✅ Actualización completada exitosamente!"
echo
info "🌐 Aplicación disponible en:"
info "   - Local: http://localhost:3000"
info "   - Producción: https://seguimiento.saem.gob.mx"
echo
info "📋 Comandos útiles:"
info "   - Ver logs: pm2 logs $PM2_PROCESS"
info "   - Monitorear: pm2 monit"
info "   - Estado: pm2 status"
info "   - Reiniciar: pm2 restart $PM2_PROCESS"
echo
info "🔄 Commit desplegado: $(git rev-parse HEAD)"
info "� Para rollback: git reset --hard $CURRENT_COMMIT && bash update-deploy.sh"
