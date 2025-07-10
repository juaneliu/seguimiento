#!/bin/bash

# Script de solución específica para el problema de MIME types
echo "🛠️ Solucionando problema de archivos estáticos..."

APP_NAME="tablero-estadistico"
APP_DIR="/var/www/$APP_NAME"

# Función para logging
log() {
    echo "[$(date +'%H:%M:%S')] $1"
}

error() {
    echo "❌ [ERROR] $1"
}

success() {
    echo "✅ [OK] $1"
}

# Paso 1: Detener todo
log "Paso 1: Deteniendo servicios..."
sudo -u $APP_NAME pm2 stop all 2>/dev/null || true
sudo -u $APP_NAME pm2 delete all 2>/dev/null || true
killall node 2>/dev/null || true

# Verificar que no haya nada en puerto 3000
if netstat -tlnp | grep :3000; then
    error "Aún hay algo en puerto 3000, matando procesos..."
    sudo fuser -k 3000/tcp 2>/dev/null || true
    sleep 2
fi

# Paso 2: Ir al directorio de la aplicación
log "Paso 2: Verificando directorio de aplicación..."
if [ ! -d "$APP_DIR" ]; then
    error "Directorio $APP_DIR no existe"
    exit 1
fi

cd $APP_DIR

# Paso 3: Limpiar completamente
log "Paso 3: Limpiando archivos anteriores..."
sudo -u $APP_NAME rm -rf .next
sudo -u $APP_NAME rm -rf node_modules/.cache
sudo -u $APP_NAME rm -rf logs/*

# Paso 4: Verificar package.json
log "Paso 4: Verificando configuración..."
if [ ! -f "package.json" ]; then
    error "package.json no existe"
    exit 1
fi

# Paso 5: Instalar dependencias limpias
log "Paso 5: Instalando dependencias..."
sudo -u $APP_NAME npm ci --production=false

# Paso 6: Generar Prisma Client
log "Paso 6: Generando Prisma Client..."
sudo -u $APP_NAME npx prisma generate

# Paso 7: Build de producción
log "Paso 7: Compilando aplicación..."
sudo -u $APP_NAME npm run build

# Verificar que el build fue exitoso
if [ ! -d ".next" ]; then
    error "El build falló - no se creó directorio .next"
    exit 1
fi

if [ ! -d ".next/static" ]; then
    error "El build falló - no se creó .next/static"
    exit 1
fi

success "Build completado exitosamente"

# Paso 8: Crear directorio de logs
log "Paso 8: Preparando logs..."
sudo -u $APP_NAME mkdir -p logs

# Paso 9: Iniciar con PM2
log "Paso 9: Iniciando aplicación..."
sudo -u $APP_NAME pm2 start ecosystem.config.json --env production

# Esperar un momento para que inicie
sleep 5

# Paso 10: Verificar que esté ejecutándose
log "Paso 10: Verificando estado..."
if netstat -tlnp | grep :3000; then
    success "Aplicación ejecutándose en puerto 3000"
else
    error "La aplicación NO está ejecutándose en puerto 3000"
    echo "Logs de PM2:"
    sudo -u $APP_NAME pm2 logs --lines 10
    exit 1
fi

# Paso 11: Probar archivo estático
log "Paso 11: Probando archivos estáticos..."
sleep 2

# Buscar un archivo CSS real en .next/static
CSS_FILE=$(find .next/static -name "*.css" | head -1)
if [ -n "$CSS_FILE" ]; then
    CSS_PATH=$(echo "$CSS_FILE" | sed 's|^\./||')
    log "Probando archivo CSS: /$CSS_PATH"
    
    RESPONSE=$(curl -s -w "HTTPCODE:%{http_code}" "http://localhost:3000/$CSS_PATH" 2>/dev/null)
    HTTP_CODE=$(echo "$RESPONSE" | grep -o "HTTPCODE:[0-9]*" | cut -d: -f2)
    CONTENT=$(echo "$RESPONSE" | sed 's/HTTPCODE:[0-9]*$//')
    
    if [ "$HTTP_CODE" = "200" ] && ! echo "$CONTENT" | grep -q "<html\|<!DOCTYPE"; then
        success "Archivo CSS se sirve correctamente"
    else
        error "Archivo CSS aún devuelve HTML (código: $HTTP_CODE)"
        echo "Contenido:"
        echo "$CONTENT" | head -3
    fi
else
    error "No se encontraron archivos CSS en .next/static"
fi

# Paso 12: Reiniciar Nginx
log "Paso 12: Reiniciando Nginx..."
sudo systemctl restart nginx

# Paso 13: Test final
log "Paso 13: Test final..."
sleep 2

FINAL_TEST=$(curl -s -w "HTTPCODE:%{http_code}" http://localhost:3000 2>/dev/null)
FINAL_CODE=$(echo "$FINAL_TEST" | grep -o "HTTPCODE:[0-9]*" | cut -d: -f2)

if [ "$FINAL_CODE" = "200" ]; then
    success "🎉 Aplicación funcionando correctamente"
    echo "✅ La aplicación debería estar disponible en https://seguimiento.saem.gob.mx"
else
    error "La aplicación aún no responde correctamente (código: $FINAL_CODE)"
fi

# Mostrar estado final
log "Estado final de PM2:"
sudo -u $APP_NAME pm2 status
