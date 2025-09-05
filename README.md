# Plataforma de Seguimiento SAEM

Sistema de tablero estadístico para seguimiento, ejecución y evaluación del Sistema Anticorrupción del Estado de Morelos.

## 🚀 Tecnologías

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Node.js, Prisma ORM
- **Base de datos**: PostgreSQL
- **Despliegue**: Nginx, PM2
- **Sistema de auditoría**: Completo con logs de actividad

## 📦 Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd seguimiento

# Instalar dependencias
npm install

# Configurar base de datos
./setup-database.sh

# Compilar proyecto
npm run build

# Iniciar en producción
npm start
```

## 🔧 Configuración

1. Configurar variables de entorno en `.env`
2. Ajustar dominio en `nginx.conf` 
3. Ejecutar migraciones de Prisma
4. Crear usuario administrador inicial

## 🚀 Despliegue con PM2

```bash
# Iniciar con PM2 (recomendado para producción)
pm2 start ecosystem.config.js

# Configurar inicio automático
pm2 save
pm2 startup

# Monitoreo
pm2 status
pm2 logs seguimiento-saem
pm2 monit
```

## 🔍 Monitoreo y Mantenimiento

- **Monitor automático**: Cada 5 minutos via crontab
- **Scripts disponibles**:
  - `./maintenance-commands.sh` - Comandos útiles
  - `./monitor-health.sh` - Monitoreo automático
  - `./emergency-restart.sh` - Reinicio de emergencia
- **Logs**: `/home/ubuntu/seguimiento/logs/`

### Configuración de Nginx

La configuración de nginx para el sitio está incluida en el archivo `nginx.conf`. Para instalar:

```bash
# Copiar configuración a nginx
sudo cp nginx.conf /etc/nginx/sites-available/seguimiento.saem.gob.mx

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/seguimiento.saem.gob.mx /etc/nginx/sites-enabled/

# Reiniciar nginx
sudo systemctl restart nginx
```

**Nota**: La configuración incluye SSL/TLS con Let's Encrypt y todas las cabeceras de seguridad necesarias.

## 🛡️ Funcionalidades

- ✅ Dashboard estadístico
- ✅ Gestión de acuerdos y seguimientos
- ✅ Diagnósticos municipales
- ✅ Directorio de OIC
- ✅ Interfaz responsive

## 📊 Estado del Proyecto

**Sistema en producción** - Completamente funcional con todas las características implementadas.

---

**Unidad de Servicios Tecnológicos - SAEM** | **Versión**: 1.0 | **Año**: 2025
