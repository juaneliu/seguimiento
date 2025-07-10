#!/bin/bash

# Script de diagnóstico para problemas de archivos estáticos
# Ejecutar en el servidor como: bash diagnostics.sh

echo "🔍 Diagnóstico del sistema de seguimiento SAEM..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[INFO] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

section() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Variables
APP_NAME="tablero-estadistico"
APP_DIR="/var/www/$APP_NAME"

section "1. Estado del Sistema"
log "Fecha y hora actual:"
date

log "Uso de memoria:"
free -h

log "Uso de disco:"
df -h

section "2. Estado de la Aplicación"
log "Estado de PM2:"
if command -v pm2 >/dev/null 2>&1; then
    sudo -u $APP_NAME pm2 status 2>/dev/null || echo "PM2 no está ejecutándose o no hay procesos"
else
    error "PM2 no está instalado"
fi

log "Procesos en puerto 3000:"
sudo netstat -tlnp | grep :3000 || echo "Ningún proceso escuchando en puerto 3000"

log "Procesos Node.js:"
ps aux | grep node | grep -v grep || echo "No hay procesos Node.js ejecutándose"

section "3. Estado de Nginx"
log "Estado del servicio Nginx:"
sudo systemctl status nginx --no-pager -l

log "Configuración de Nginx:"
sudo nginx -t

log "Sitios habilitados:"
ls -la /etc/nginx/sites-enabled/

section "4. Logs Recientes"
log "Últimas líneas del log de error de Nginx:"
sudo tail -10 /var/log/nginx/error.log 2>/dev/null || echo "No hay log de error de Nginx"

log "Últimas líneas del log de acceso de Nginx:"
sudo tail -10 /var/log/nginx/access.log 2>/dev/null || echo "No hay log de acceso de Nginx"

if [ -d "$APP_DIR/logs" ]; then
    log "Últimas líneas del log de la aplicación:"
    sudo tail -10 $APP_DIR/logs/combined.log 2>/dev/null || echo "No hay logs de la aplicación"
fi

section "5. Pruebas de Conectividad"
log "Prueba local puerto 3000:"
curl -s -o /dev/null -w "HTTP Code: %{http_code}, Time: %{time_total}s\n" http://localhost:3000 || echo "Falló la conexión"

log "Prueba local puerto 80:"
curl -s -o /dev/null -w "HTTP Code: %{http_code}, Time: %{time_total}s\n" http://localhost || echo "Falló la conexión"

log "Prueba local puerto 443:"
curl -s -o /dev/null -w "HTTP Code: %{http_code}, Time: %{time_total}s\n" https://localhost -k || echo "Falló la conexión"

section "6. Información de la Aplicación"
if [ -d "$APP_DIR" ]; then
    log "Directorio de la aplicación existe: $APP_DIR"
    log "Contenido del directorio:"
    ls -la $APP_DIR/ | head -20
    
    log "Estado del build de Next.js:"
    if [ -d "$APP_DIR/.next" ]; then
        log "Directorio .next existe"
        ls -la $APP_DIR/.next/ | head -10
    else
        warning "Directorio .next NO existe - la aplicación no está compilada"
    fi
    
    log "Archivo package.json:"
    if [ -f "$APP_DIR/package.json" ]; then
        grep -E '"name"|"version"|"scripts"' $APP_DIR/package.json | head -10
    else
        error "package.json NO existe"
    fi
    
    log "Variables de entorno (.env):"
    if [ -f "$APP_DIR/.env" ]; then
        log "Archivo .env existe"
        # Solo mostrar las claves, no los valores por seguridad
        grep -E '^[A-Z_]' $APP_DIR/.env | cut -d'=' -f1 | head -10
    else
        warning "Archivo .env NO existe"
    fi
else
    error "Directorio de la aplicación NO existe: $APP_DIR"
fi

section "7. Análisis de Errores MIME Type"
log "Probando archivos estáticos específicos:"
echo "Probando CSS..."
curl -s -I http://localhost:3000/_next/static/css/app.css 2>/dev/null | head -5 || echo "No se pudo probar CSS"

echo "Probando JS..."
curl -s -I http://localhost:3000/_next/static/chunks/main.js 2>/dev/null | head -5 || echo "No se pudo probar JS"

section "8. Recomendaciones"
echo "📋 Comandos útiles para solucionar problemas:"
echo "• Ver logs en tiempo real: sudo -u $APP_NAME pm2 logs"
echo "• Reiniciar aplicación: sudo -u $APP_NAME pm2 restart all"
echo "• Reconstruir aplicación: sudo -u $APP_NAME npm run build"
echo "• Verificar configuración Nginx: sudo nginx -t"
echo "• Reiniciar Nginx: sudo systemctl restart nginx"
echo "• Ver estado completo: sudo systemctl status nginx"

echo -e "\n${GREEN}🎉 Diagnóstico completado${NC}"
