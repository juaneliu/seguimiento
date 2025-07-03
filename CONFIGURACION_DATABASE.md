# 🗄️ CONFIGURACIÓN DE BASE DE DATOS - SEGUIMIENTO SAEM

## Estado Actual ✅

La base de datos está **completamente configurada y funcionando** con:
- ✅ PostgreSQL configurado y corriendo
- ✅ Todas las migraciones aplicadas
- ✅ Usuario administrador creado
- ✅ Sistema de autenticación funcionando
- ✅ Prisma Client generado y funcional

## 🔑 Credenciales de Acceso

**Usuario Administrador:**
- Email: `admin@saem.gob.mx`
- Password: `admin123`
- Rol: `ADMINISTRADOR`

## 📋 Scripts Disponibles

### Script de Setup Completo
```bash
./setup-database.sh
```
Realiza configuración completa de la base de datos desde cero.

### Scripts de Mantenimiento
```bash
# Verificar estado y credenciales
node debug-login.js

# Listar usuarios (requiere tsx)
npx tsx scripts/list-users.ts

# Crear usuario admin
npx tsx scripts/create-admin-user.ts

# Configurar contraseñas
npx tsx scripts/set-passwords.ts
```

### Comandos Prisma Útiles
```bash
# Aplicar migraciones
npx prisma migrate deploy

# Generar cliente
npx prisma generate

# Ver base de datos en browser
npx prisma studio

# Reset completo (¡CUIDADO EN PRODUCCIÓN!)
npx prisma migrate reset
```

## 🔧 Configuración Técnica

### Variables de Entorno (.env)
```bash
DATABASE_URL="postgresql://admin:SeguimientoSAEM2025@localhost:5432/tablero_estadistico_prod"
JWT_SECRET="jwt_secret_super_seguro_para_produccion_2025_saem_seguimiento"
NODE_ENV="production"
```

### Modelos de Base de Datos

**Principales tablas configuradas:**
- `usuarios` - Sistema de autenticación
- `acuerdos_seguimiento` - Acuerdos y seguimientos
- `diagnosticos_municipales` - Diagnósticos municipales
- `directorio_oic` - Directorio de OICs
- `entes_publicos` - Entes públicos
- `seguimientos` - Seguimientos de acuerdos

## 🚀 Verificación de Estado

### Test Rápido de Funcionamiento
```bash
# 1. Verificar conexión y usuario admin
node debug-login.js

# 2. Verificar API de login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@saem.gob.mx","password":"admin123"}'

# 3. Verificar Prisma Studio
npx prisma studio
```

### Resultados Esperados
- ✅ Debug script muestra conexión exitosa y usuario válido
- ✅ API login retorna `"success":true` con token JWT
- ✅ Prisma Studio abre en `http://localhost:5555`

## 📊 Estadísticas Actuales

- **Usuarios registrados:** 1 (Administrador)
- **Tablas en base de datos:** 6 principales
- **Migraciones aplicadas:** 6 completadas
- **Estado general:** ✅ Completamente funcional

## 🔒 Seguridad

### Configuraciones de Seguridad Implementadas
- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT tokens para autenticación
- ✅ Middleware de seguridad configurado
- ✅ CORS configurado correctamente
- ✅ Variables sensibles en .env

### Recomendaciones Adicionales
- 🔄 Cambiar contraseñas por defecto en producción
- 🔄 Configurar backup automático de base de datos
- 🔄 Implementar rotación de JWT secrets
- 🔄 Monitorear logs de acceso

## 🛠️ Troubleshooting

### Problemas Comunes

**Error: "Cannot read properties of undefined"**
```bash
# Regenerar Prisma Client
npx prisma generate
```

**Error: "Permission denied to create database"**
```bash
# Usar migrate deploy en lugar de migrate dev
npx prisma migrate deploy
```

**Error: "Migration failed"**
```bash
# Marcar migraciones como aplicadas
npx prisma migrate resolve --applied "MIGRATION_NAME"
npx prisma migrate deploy
```

### Logs Importantes
```bash
# Ver logs de aplicación
pm2 logs seguimiento-saem

# Ver logs de PostgreSQL
sudo journalctl -u postgresql

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

## 📝 Mantenimiento Regular

### Tareas Recomendadas

**Diarias:**
- Verificar logs de errores
- Monitorear uso de base de datos

**Semanales:**
- Backup de base de datos
- Verificar integridad de datos
- Limpiar logs antiguos

**Mensuales:**
- Actualizar dependencias
- Revisar usuarios inactivos
- Optimizar consultas

---

**Estado:** ✅ Base de datos completamente configurada y funcional
**Última verificación:** $(date)
**Próxima revisión recomendada:** $(date -d "+1 week")
