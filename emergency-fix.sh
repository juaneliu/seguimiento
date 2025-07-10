#!/bin/bash

# Script de emergencia para solucionar problemas críticos de MIME types
# Este script debe ejecutarse en el servidor de producción

echo "🚨 EMERGENCIA: Solucionando problemas críticos de MIME types..."

# Variables
APP_NAME="tablero-estadistico"
APP_DIR="/var/www/$APP_NAME"
DOMAIN="seguimiento.saem.gob.mx"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

log "🔍 Paso 1: Diagnóstico rápido del problema..."

# Verificar si PM2 está instalado
if ! command_exists pm2; then
    error "PM2 no está instalado"
    log "Instalando PM2..."
    sudo npm install -g pm2
fi

# Verificar estado actual
log "Estado actual de PM2:"
sudo -u $APP_NAME pm2 status 2>/dev/null || echo "No hay procesos PM2"

log "Puerto 3000:"
sudo netstat -tlnp | grep :3000 || echo "Puerto 3000 no está en uso"

log "🛑 Paso 2: Detener todos los servicios..."

# Matar cualquier proceso Node.js que pueda estar interfiriendo
log "Deteniendo procesos Node.js..."
sudo pkill -f node || true
sudo -u $APP_NAME pm2 kill 2>/dev/null || true

# Esperar un momento
sleep 3

log "🧹 Paso 3: Limpieza completa..."

cd $APP_DIR

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "No estamos en el directorio correcto de la aplicación"
    exit 1
fi

# Limpiar completamente
log "Limpiando archivos temporales..."
sudo -u $APP_NAME rm -rf .next
sudo -u $APP_NAME rm -rf node_modules
sudo -u $APP_NAME rm -rf .cache
sudo -u $APP_NAME rm -rf logs/*

# Crear directorio de logs
sudo -u $APP_NAME mkdir -p logs

log "📦 Paso 4: Reinstalación completa..."

# Actualizar código
log "Actualizando código..."
sudo -u $APP_NAME git fetch origin
sudo -u $APP_NAME git reset --hard origin/main

# Verificar que ecosystem.config.json existe y no está vacío
if [ ! -s "ecosystem.config.json" ]; then
    warning "ecosystem.config.json está vacío o no existe, creando uno nuevo..."
    sudo -u $APP_NAME cat > ecosystem.config.json << 'EOF'
{
  "apps": [{
    "name": "seguimiento-saem",
    "script": "server.js",
    "instances": 1,
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production",
      "PORT": 3000
    },
    "env_production": {
      "NODE_ENV": "production",
      "PORT": 3000
    },
    "error_file": "./logs/err.log",
    "out_file": "./logs/out.log",
    "log_file": "./logs/combined.log",
    "time": true,
    "max_memory_restart": "1G",
    "restart_delay": 5000
  }]
}
EOF
fi

# Verificar que server.js existe
if [ ! -f "server.js" ]; then
    error "server.js no existe"
    log "Creando server.js básico..."
    sudo -u $APP_NAME cat > server.js << 'EOF'
#!/usr/bin/env node

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = parseInt(process.env.PORT, 10) || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
  .once('error', (err) => {
    console.error(err)
    process.exit(1)
  })
  .listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
EOF
fi

# Instalar dependencias
log "Instalando dependencias..."
sudo -u $APP_NAME npm cache clean --force
sudo -u $APP_NAME npm install

# Verificar que .env existe
if [ ! -f ".env" ]; then
    warning "Archivo .env no existe"
    # Aquí deberías tener las variables correctas
    sudo -u $APP_NAME cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://admin:password@localhost:5432/tablero_estadistico_prod"
NEXTAUTH_SECRET="tu-secreto-aqui"
NEXTAUTH_URL="https://seguimiento.saem.gob.mx"
EOF
    warning "IMPORTANTE: Edita el archivo .env con las variables correctas"
fi

# Generar Prisma Client
log "Generando Prisma Client..."
sudo -u $APP_NAME npx prisma generate

# Build
log "Construyendo aplicación..."
sudo -u $APP_NAME npm run build

# Verificar que el build fue exitoso
if [ ! -d ".next" ]; then
    error "El build falló - directorio .next no existe"
    exit 1
fi

log "✅ Build completado exitosamente"

log "🚀 Paso 5: Iniciando aplicación..."

# Iniciar con PM2
sudo -u $APP_NAME pm2 start ecosystem.config.json --env production

# Esperar que se inicie
sleep 10

# Verificar que está ejecutándose
log "Verificando estado..."
sudo -u $APP_NAME pm2 status

# Verificar puerto
if sudo netstat -tlnp | grep :3000; then
    log "✅ Aplicación escuchando en puerto 3000"
else
    error "❌ Aplicación NO está escuchando en puerto 3000"
    log "Logs de PM2:"
    sudo -u $APP_NAME pm2 logs --lines 20
    exit 1
fi

log "🔄 Paso 6: Reiniciando Nginx..."

# Verificar configuración de Nginx
sudo nginx -t

if [ $? -eq 0 ]; then
    sudo systemctl restart nginx
    log "✅ Nginx reiniciado"
else
    error "❌ Error en configuración de Nginx"
    exit 1
fi

log "🧪 Paso 7: Pruebas finales..."

# Probar conectividad local
log "Probando http://localhost:3000..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    log "✅ Aplicación responde localmente"
else
    error "❌ Aplicación no responde localmente"
    sudo -u $APP_NAME pm2 logs --lines 20
    exit 1
fi

# Probar archivo estático específico
log "Probando archivo CSS..."
RESPONSE=$(curl -s -I http://localhost:3000/_next/static/css/app.css 2>/dev/null | head -1)
log "Respuesta CSS: $RESPONSE"

log "Probando archivo JS..."
RESPONSE=$(curl -s -I http://localhost:3000/_next/static/chunks/main.js 2>/dev/null | head -1)
log "Respuesta JS: $RESPONSE"

# Probar externamente
log "Probando https://$DOMAIN..."
EXTERNAL_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN 2>/dev/null)
log "Respuesta externa: $EXTERNAL_RESPONSE"

log "🎉 SOLUCIÓN COMPLETADA"
log "📊 Estado final:"
echo "• PM2: $(sudo -u $APP_NAME pm2 status | grep -E 'online|stopped')"
echo "• Puerto 3000: $(sudo netstat -tlnp | grep :3000 | wc -l) proceso(s)"
echo "• Nginx: $(sudo systemctl is-active nginx)"

log "📋 Comandos útiles:"
echo "• Ver logs: sudo -u $APP_NAME pm2 logs"
echo "• Estado PM2: sudo -u $APP_NAME pm2 status"
echo "• Reiniciar app: sudo -u $APP_NAME pm2 restart all"
echo "• Ver logs Nginx: sudo tail -f /var/log/nginx/error.log"

if [ "$EXTERNAL_RESPONSE" = "200" ]; then
    log "🎊 ¡La aplicación debería estar funcionando correctamente!"
else
    warning "⚠️ Puede que necesites esperar unos minutos para que los cambios se propaguen"
fi
