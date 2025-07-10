#!/bin/bash

# INSTRUCCIONES PARA EJECUTAR EN EL SERVIDOR DE PRODUCCIÓN
# =========================================================

echo "📋 INSTRUCCIONES PARA SOLUCIONAR EL PROBLEMA MIME TYPE"
echo "======================================================="

echo "
🚨 PROBLEMA IDENTIFICADO:
Los archivos CSS y JS están devolviendo HTML (error 400) en lugar de su contenido correcto.
Esto indica que la aplicación Next.js no está funcionando en el puerto 3000.

📋 EJECUTAR EN EL SERVIDOR (paso a paso):

1️⃣  CONECTARSE AL SERVIDOR:
   ssh tu-usuario@servidor-ip

2️⃣  IR AL DIRECTORIO DE LA APLICACIÓN:
   cd /var/www/tablero-estadistico

3️⃣  ACTUALIZAR EL CÓDIGO:
   sudo -u tablero-estadistico git pull origin main

4️⃣  EJECUTAR DIAGNÓSTICO:
   bash diagnostics.sh

5️⃣  EJECUTAR CORRECCIÓN DE EMERGENCIA:
   bash emergency-fix.sh

6️⃣  VERIFICAR RESULTADO:
   bash check-server.sh

🔧 SI EL SCRIPT AUTOMÁTICO FALLA, EJECUTAR MANUALMENTE:

   # Detener todo
   sudo -u tablero-estadistico pm2 kill
   sudo pkill -f node

   # Limpiar build
   sudo -u tablero-estadistico rm -rf .next node_modules

   # Reinstalar
   sudo -u tablero-estadistico npm install
   sudo -u tablero-estadistico npx prisma generate
   sudo -u tablero-estadistico npm run build

   # Verificar ecosystem.config.json
   cat ecosystem.config.json
   # Si está vacío, copiarlo del repositorio actualizado

   # Iniciar
   sudo -u tablero-estadistico pm2 start ecosystem.config.json --env production
   sudo systemctl restart nginx

   # Verificar
   sudo -u tablero-estadistico pm2 status
   curl -I http://localhost:3000

📊 VERIFICAR QUE FUNCIONA:
   - PM2 status debe mostrar 'online'
   - Puerto 3000 debe estar en uso: netstat -tlnp | grep :3000
   - https://seguimiento.saem.gob.mx debe cargar sin errores de consola

💡 LOGS ÚTILES:
   - PM2: sudo -u tablero-estadistico pm2 logs
   - Nginx: sudo tail -f /var/log/nginx/error.log
   - Sistema: journalctl -u nginx -f

🆘 SI NADA FUNCIONA:
   1. Verificar que PostgreSQL esté funcionando
   2. Verificar variables de entorno en .env
   3. Verificar que el dominio apunte al servidor correcto
   4. Considerar reinstalación completa con deploy.sh

📞 CONTACTO:
   Si persiste el problema, enviar los logs de:
   - bash diagnostics.sh
   - sudo -u tablero-estadistico pm2 logs --lines 50
   - sudo tail -50 /var/log/nginx/error.log
"

echo "
🎯 EJECUTAR AHORA EN EL SERVIDOR:
   bash emergency-fix.sh
"
