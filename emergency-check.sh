#!/bin/bash

# Script de emergencia para verificar exactamente qué está fallando
echo "🔍 Verificando estado actual del servidor..."

APP_NAME="tablero-estadistico"
APP_DIR="/var/www/$APP_NAME"

echo "=== 1. ¿Está ejecutándose la aplicación en puerto 3000? ==="
if netstat -tlnp | grep :3000; then
    echo "✅ Algo está escuchando en puerto 3000"
else
    echo "❌ NADA está escuchando en puerto 3000 - ESTE ES EL PROBLEMA"
fi

echo -e "\n=== 2. Estado de PM2 ==="
if command -v pm2 >/dev/null 2>&1; then
    sudo -u $APP_NAME pm2 list 2>/dev/null || echo "❌ PM2 no tiene procesos ejecutándose"
else
    echo "❌ PM2 no está instalado"
fi

echo -e "\n=== 3. Procesos Node.js ==="
ps aux | grep node | grep -v grep || echo "❌ No hay procesos Node.js"

echo -e "\n=== 4. Probando qué devuelve el puerto 3000 ==="
echo "Probando http://localhost:3000..."
RESPONSE=$(curl -s -w "HTTPCODE:%{http_code}" http://localhost:3000 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | grep -o "HTTPCODE:[0-9]*" | cut -d: -f2)
CONTENT=$(echo "$RESPONSE" | sed 's/HTTPCODE:[0-9]*$//')

echo "Código HTTP: $HTTP_CODE"
echo "Primeras líneas de respuesta:"
echo "$CONTENT" | head -5

echo -e "\n=== 5. Probando archivo CSS específico ==="
echo "Probando /_next/static/css/..."
CSS_RESPONSE=$(curl -s -w "HTTPCODE:%{http_code}" http://localhost:3000/_next/static/css/fde4451157aeadda.css 2>/dev/null)
CSS_CODE=$(echo "$CSS_RESPONSE" | grep -o "HTTPCODE:[0-9]*" | cut -d: -f2)
CSS_CONTENT=$(echo "$CSS_RESPONSE" | sed 's/HTTPCODE:[0-9]*$//')

echo "Código HTTP para CSS: $CSS_CODE"
echo "Contenido del CSS (primeras líneas):"
echo "$CSS_CONTENT" | head -3

if echo "$CSS_CONTENT" | grep -q "<html\|<!DOCTYPE"; then
    echo "🚨 EL CSS ESTÁ DEVOLVIENDO HTML - Problema confirmado"
else
    echo "✅ El CSS parece correcto"
fi

echo -e "\n=== 6. Verificando directorio .next ==="
if [ -d "$APP_DIR/.next" ]; then
    echo "✅ Directorio .next existe"
    echo "Archivos en .next:"
    ls -la "$APP_DIR/.next" | head -10
    
    if [ -d "$APP_DIR/.next/static" ]; then
        echo "✅ Directorio .next/static existe"
        echo "Archivos en .next/static:"
        find "$APP_DIR/.next/static" -name "*.css" | head -5
    else
        echo "❌ NO existe .next/static"
    fi
else
    echo "❌ NO existe .next - La aplicación no está compilada"
fi

echo -e "\n=== 7. Logs recientes de PM2 ==="
if [ -f "$APP_DIR/logs/combined.log" ]; then
    echo "Últimas líneas del log:"
    tail -10 "$APP_DIR/logs/combined.log"
else
    echo "No hay logs de PM2"
fi

echo -e "\n=== DIAGNÓSTICO ==="
if ! netstat -tlnp | grep :3000 >/dev/null; then
    echo "🚨 PROBLEMA PRINCIPAL: No hay ningún servicio ejecutándose en puerto 3000"
    echo "📋 SOLUCIÓN: Necesitas iniciar la aplicación Next.js correctamente"
elif [ ! -d "$APP_DIR/.next" ]; then
    echo "🚨 PROBLEMA PRINCIPAL: La aplicación no está compilada (no existe .next)"
    echo "📋 SOLUCIÓN: Ejecutar npm run build"
else
    echo "🤔 La aplicación parece estar ejecutándose pero devuelve HTML en lugar de CSS/JS"
    echo "📋 SOLUCIÓN: Revisar configuración de Next.js y PM2"
fi
