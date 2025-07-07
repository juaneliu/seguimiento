#!/bin/bash

# Script de monitoreo y reinicio automático para seguimiento.saem.gob.mx
# Usar en crontab cada 5 minutos: */5 * * * * /home/ubuntu/seguimiento/monitor-health.sh

LOG_FILE="/home/ubuntu/seguimiento/logs/health-check.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Función para logging
log() {
    echo "[$DATE] $1" >> $LOG_FILE
}

# Verificar si PM2 está corriendo
if ! pgrep -f "PM2" > /dev/null; then
    log "ERROR: PM2 no está corriendo. Reiniciando..."
    pm2 resurrect
    log "PM2 reiniciado"
fi

# Verificar estado de la aplicación
APP_STATUS=$(pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null)

if [ "$APP_STATUS" != "online" ]; then
    log "ERROR: Aplicación no está online (estado: $APP_STATUS). Reiniciando..."
    cd /home/ubuntu/seguimiento
    pm2 restart seguimiento-saem
    sleep 10
    log "Aplicación reiniciada"
fi

# Verificar conectividad HTTP
if ! curl -f -s http://localhost:3000 > /dev/null; then
    log "ERROR: Puerto 3000 no responde. Reiniciando aplicación..."
    cd /home/ubuntu/seguimiento
    pm2 restart seguimiento-saem
    sleep 10
    log "Aplicación reiniciada por falta de respuesta HTTP"
fi

# Verificar conectividad HTTPS
if ! curl -f -s -k https://seguimiento.saem.gob.mx > /dev/null; then
    log "WARNING: Sitio HTTPS no responde correctamente"
    # Reiniciar nginx si es necesario
    sudo systemctl reload nginx
    log "Nginx recargado"
fi

# Log de estado OK
log "Sistema funcionando correctamente"
