#!/bin/bash

# Script para verificar exactamente qué responde el servidor
echo "🔍 Verificando respuestas del servidor..."

DOMAIN="seguimiento.saem.gob.mx"

echo "=== Probando archivo CSS ==="
echo "URL: https://$DOMAIN/_next/static/css/fde4451157aeadda.css"
echo "Headers de respuesta:"
curl -s -I "https://$DOMAIN/_next/static/css/fde4451157aeadda.css"

echo -e "\nPrimeras 500 caracteres del contenido:"
curl -s "https://$DOMAIN/_next/static/css/fde4451157aeadda.css" | head -c 500

echo -e "\n\n=== Probando archivo JS ==="
echo "URL: https://$DOMAIN/_next/static/chunks/webpack-6443da586c4985a7.js"
echo "Headers de respuesta:"
curl -s -I "https://$DOMAIN/_next/static/chunks/webpack-6443da586c4985a7.js"

echo -e "\nPrimeras 500 caracteres del contenido:"
curl -s "https://$DOMAIN/_next/static/chunks/webpack-6443da586c4985a7.js" | head -c 500

echo -e "\n\n=== Probando página principal ==="
echo "URL: https://$DOMAIN/"
echo "Status code:"
curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/"

echo -e "\n\n=== Probando puerto local 3000 ==="
echo "URL: http://localhost:3000"
echo "Status code:"
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000" 2>/dev/null || echo "No se puede conectar"

echo -e "\n\n=== Estado de servicios ==="
echo "Nginx:"
systemctl is-active nginx

echo "Procesos en puerto 3000:"
netstat -tlnp | grep :3000 || echo "Ninguno"

echo "Procesos PM2:"
pm2 status 2>/dev/null || echo "PM2 no está ejecutándose o no hay procesos"
