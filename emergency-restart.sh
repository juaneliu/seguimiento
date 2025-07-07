#!/bin/bash

# Script de emergencia para reinicio completo del sistema

echo "🚨 REINICIO DE EMERGENCIA - Seguimiento SAEM"
echo "============================================="

# Detener todo
echo "1. Deteniendo aplicación..."
pm2 stop seguimiento-saem

# Limpiar memoria
echo "2. Limpiando memoria..."
sudo sync
sudo sysctl vm.drop_caches=3

# Reiniciar nginx
echo "3. Reiniciando nginx..."
sudo systemctl restart nginx

# Esperar
echo "4. Esperando 5 segundos..."
sleep 5

# Reiniciar aplicación
echo "5. Reiniciando aplicación..."
cd /home/ubuntu/seguimiento
pm2 start ecosystem.config.js

# Esperar y probar
echo "6. Esperando 10 segundos para pruebas..."
sleep 10

# Verificar estado
echo "7. Verificando estado:"
pm2 status
echo ""

# Probar conectividad
echo "8. Probando conectividad:"
if curl -f -s http://localhost:3000 > /dev/null; then
    echo "✅ Puerto 3000: OK"
else
    echo "❌ Puerto 3000: FALLO"
fi

if curl -f -s -k https://seguimiento.saem.gob.mx > /dev/null; then
    echo "✅ Sitio HTTPS: OK"
else
    echo "❌ Sitio HTTPS: FALLO"
fi

echo ""
echo "🔧 Reinicio de emergencia completado"
echo "📊 Ejecuta 'pm2 monit' para monitoreo continuo"
