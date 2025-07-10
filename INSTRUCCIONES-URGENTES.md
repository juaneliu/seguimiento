# 🚨 SOLUCIÓN INMEDIATA - Problema de MIME Types

## El problema exacto:
Los archivos CSS y JS están devolviendo HTML con código 400, lo que significa que:
1. La aplicación Next.js NO está ejecutándose en el puerto 3000, O
2. La aplicación está ejecutándose pero el build está corrupto

## Ejecutar AHORA en el servidor:

### 1. Primero, diagnosticar el problema exacto:
```bash
cd /var/www/tablero-estadistico
bash emergency-check.sh
```

### 2. Si el diagnóstico confirma el problema, ejecutar la solución:
```bash
bash fix-static-files.sh
```

### 3. Si persiste, ejecutar manualmente paso a paso:

#### A) Verificar estado actual:
```bash
sudo -u tablero-estadistico pm2 status
sudo netstat -tlnp | grep :3000
```

#### B) Detener todo y limpiar:
```bash
sudo -u tablero-estadistico pm2 stop all
sudo -u tablero-estadistico pm2 delete all
sudo fuser -k 3000/tcp
```

#### C) Limpiar y reconstruir:
```bash
cd /var/www/tablero-estadistico
sudo -u tablero-estadistico rm -rf .next
sudo -u tablero-estadistico npm run build
```

#### D) Verificar que el build fue exitoso:
```bash
ls -la .next/
ls -la .next/static/
```

#### E) Iniciar con PM2:
```bash
sudo -u tablero-estadistico pm2 start ecosystem.config.json --env production
```

#### F) Verificar que funciona:
```bash
sudo netstat -tlnp | grep :3000
curl -I http://localhost:3000
```

#### G) Si funciona localmente, reiniciar Nginx:
```bash
sudo systemctl restart nginx
```

## ¿Qué buscar en cada paso?

### emergency-check.sh debería mostrar:
- ✅ Algo escuchando en puerto 3000
- ✅ Directorio .next existe
- ✅ Archivos CSS devuelven CSS, no HTML

### fix-static-files.sh debería:
- Limpiar todo completamente
- Reconstruir la aplicación
- Iniciar PM2 correctamente
- Verificar que los archivos estáticos funcionan

## Si NADA funciona:

### Opción nuclear (recrear todo):
```bash
# Ir al directorio
cd /var/www/tablero-estadistico

# Hacer backup del .env
sudo cp .env .env.backup

# Limpiar completamente
sudo -u tablero-estadistico rm -rf .next node_modules

# Reinstalar todo
sudo -u tablero-estadistico npm install
sudo -u tablero-estadistico npx prisma generate
sudo -u tablero-estadistico npm run build

# Verificar que el build existe
ls -la .next/static/css/

# Iniciar
sudo -u tablero-estadistico pm2 start ecosystem.config.json
```

## Verificación final:
```bash
# Debe mostrar código 200 y contenido CSS
curl -v http://localhost:3000/_next/static/css/[archivo-que-existe].css
```

---

**NO HACER COMMITS hasta que confirmes que el problema está resuelto y el sitio funciona correctamente.**
