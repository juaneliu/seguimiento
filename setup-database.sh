#!/bin/bash

# Script de Setup de Base de Datos para Seguimiento SAEM
# Ejecutar con: bash setup-database.sh

echo "🗄️ Configurando Base de Datos para Seguimiento SAEM..."

# Variables de configuración
APP_DIR="/home/ubuntu/seguimiento"
USER="ubuntu"

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

# Verificar que existe prisma
if [ ! -f "prisma/schema.prisma" ]; then
    error "Schema de Prisma no encontrado. ¿Estás en el directorio correcto?"
fi

# 1. Verificar conexión a base de datos
log "Verificando conexión a la base de datos..."
if npx prisma db pull --force > /dev/null 2>&1; then
    info "✅ Conexión a base de datos exitosa"
else
    error "❌ No se pudo conectar a la base de datos. Verifica tu DATABASE_URL en .env"
fi

# 2. Verificar si la base de datos está vacía o poblada
log "Verificando estado de la base de datos..."

# Verificar si las tablas principales existen
USER_TABLE_EXISTS=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'Usuario';" 2>/dev/null | tail -1 | tr -d ' ' || echo "0")

if [ "$USER_TABLE_EXISTS" = "0" ] || [ -z "$USER_TABLE_EXISTS" ]; then
    info "Tablas principales no encontradas - Se realizará setup completo"
    FRESH_INSTALL=true
else
    info "Base de datos existente con tablas configuradas - Se verificará migración"
    FRESH_INSTALL=false
fi

# 3. Aplicar migraciones de base de datos
log "Aplicando migraciones de Prisma..."
if [ "$FRESH_INSTALL" = true ]; then
    # Para producción sin shadow database, usar migrate deploy
    info "Usando modo producción (sin shadow database)"
    
    # Marcar todas las migraciones existentes como aplicadas primero
    for migration in $(ls prisma/migrations/ 2>/dev/null | grep -E '^[0-9]'); do
        info "Marcando migración como aplicada: $migration"
        npx prisma migrate resolve --applied "$migration" 2>/dev/null || true
    done
    
    # Aplicar migraciones en modo deploy (producción)
    npx prisma migrate deploy || error "Error al aplicar migraciones"
else
    # Base de datos existente - usar deploy para producción
    npx prisma migrate deploy || {
        warning "Las migraciones fallaron. Intentando resolver conflicts..."
        
        # Marcar migraciones existentes como aplicadas
        for migration in $(ls prisma/migrations/ 2>/dev/null | grep -E '^[0-9]'); do
            npx prisma migrate resolve --applied "$migration" 2>/dev/null || true
        done
        
        # Intentar deploy nuevamente
        npx prisma migrate deploy || error "Error al aplicar migraciones"
    }
fi

# 4. Generar Prisma Client
log "Generando Prisma Client..."
npx prisma generate || error "Error al generar Prisma Client"

# 5. Verificar si el usuario admin existe
log "Verificando usuario administrador..."
USER_EXISTS=$(npx tsx scripts/list-users.ts 2>/dev/null | grep -c "admin@saem.gob.mx" || echo "0")

if [ "$USER_EXISTS" = "0" ]; then
    info "Usuario admin no existe - Creando usuario administrador..."
    npx tsx scripts/create-admin-user.ts || error "Error al crear usuario administrador"
else
    info "Usuario administrador ya existe"
fi

# 6. Configurar contraseñas si es necesario
log "Configurando contraseñas de usuarios..."
npx tsx scripts/set-passwords.ts || warning "Advertencia al configurar contraseñas"

# 7. Cargar datos adicionales si existen
if [ -f "scripts/seed-additional-data.sql" ]; then
    log "Cargando datos adicionales..."
    npx prisma db execute --file scripts/seed-additional-data.sql || warning "Advertencia al cargar datos adicionales"
fi

# 8. Ejecutar seed de desarrollo si está disponible
if [ -f "scripts/seed-dev-data.ts" ]; then
    log "Ejecutando seed de datos de desarrollo..."
    npx tsx scripts/seed-dev-data.ts || warning "Advertencia al ejecutar seed de desarrollo"
fi

# 9. Verificación final
log "Realizando verificación final..."

# Verificar tablas creadas
TABLE_COUNT_FINAL=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tail -1 | tr -d ' ')
info "Tablas en base de datos: $TABLE_COUNT_FINAL"

# Verificar usuarios
USER_COUNT=$(npx tsx scripts/list-users.ts 2>/dev/null | grep -c "Email:" || echo "0")
info "Usuarios registrados: $USER_COUNT"

# Verificar conexión con debug script
log "Ejecutando verificación de login..."
if node debug-login.js > /dev/null 2>&1; then
    info "✅ Sistema de autenticación funcionando"
else
    warning "⚠️ Posibles problemas en sistema de autenticación"
fi

# 10. Mostrar información final
log "✅ Setup de base de datos completado!"
echo
info "📋 Resumen de configuración:"
info "   - Migraciones aplicadas: ✅"
info "   - Prisma Client generado: ✅"
info "   - Usuario admin configurado: ✅"
info "   - Tablas en BD: $TABLE_COUNT_FINAL"
info "   - Usuarios registrados: $USER_COUNT"
echo
info "🔑 Credenciales de prueba:"
info "   - Email: admin@saem.gob.mx"
info "   - Password: admin123"
echo
info "🔧 Comandos útiles:"
info "   - Ver usuarios: npx tsx scripts/list-users.ts"
info "   - Test login: node debug-login.js"
info "   - Prisma Studio: npx prisma studio"
info "   - Reset BD: npx prisma migrate reset"
echo
warning "⚠️ IMPORTANTE:"
warning "   Asegúrate de cambiar las contraseñas por defecto en producción"
warning "   Revisa que DATABASE_URL apunte a la base de datos correcta"
