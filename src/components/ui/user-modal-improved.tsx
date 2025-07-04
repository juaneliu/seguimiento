'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Eye, Edit, User, Shield, Activity, X, Crown, UserCheck, Lock } from 'lucide-react'
import { showSuccess, showError } from '@/lib/notifications'

type Usuario = {
  id: number
  email: string
  nombre: string
  apellido: string
  rol: 'INVITADO' | 'OPERATIVO' | 'ADMINISTRADOR' | 'SEGUIMIENTO'
  activo: boolean
  ultimoAcceso?: Date | null
  createdAt: Date
  updatedAt: Date
}

interface UserModalProps {
  user: Usuario | null
  isOpen: boolean
  onClose: () => void
  onUserUpdated: () => void
  mode: 'view' | 'edit'
  onModeChange: (mode: 'view' | 'edit') => void
}

export function SimpleUserModal({ 
  user, 
  isOpen, 
  onClose, 
  onUserUpdated, 
  mode, 
  onModeChange 
}: UserModalProps) {
  const [editFormData, setEditFormData] = useState({
    email: '',
    nombre: '',
    apellido: '',
    rol: 'INVITADO' as 'INVITADO' | 'OPERATIVO' | 'ADMINISTRADOR' | 'SEGUIMIENTO',
    activo: true,
    changePassword: false,
    password: '',
    confirmPassword: ''
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user && isOpen) {
      setEditFormData({
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
        activo: user.activo,
        changePassword: false,
        password: '',
        confirmPassword: ''
      })
    }
  }, [user, isOpen])

  const getRoleIcon = (rol: string) => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return <Crown className="h-4 w-4" />
      case 'OPERATIVO':
        return <Shield className="h-4 w-4" />
      case 'SEGUIMIENTO':
        return <UserCheck className="h-4 w-4" />
      case 'INVITADO':
        return <User className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg'
      case 'OPERATIVO':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg'
      case 'SEGUIMIENTO':
        return 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-lg'
      case 'INVITADO':
        return 'bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white shadow-lg'
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white shadow-lg'
    }
  }

  const handleSaveEdit = async () => {
    if (!user) return

    // Validaciones
    if (!editFormData.email || !editFormData.nombre || !editFormData.apellido) {
      await showError('Campos requeridos', 'Por favor complete todos los campos obligatorios')
      return
    }

    if (editFormData.changePassword) {
      if (!editFormData.password || editFormData.password.length < 8) {
        await showError('Contraseña inválida', 'La contraseña debe tener al menos 8 caracteres')
        return
      }

      if (editFormData.password !== editFormData.confirmPassword) {
        await showError('Contraseñas no coinciden', 'Las contraseñas ingresadas no coinciden')
        return
      }
    }

    setIsLoading(true)

    try {
      const updateData: any = {
        email: editFormData.email,
        nombre: editFormData.nombre,
        apellido: editFormData.apellido,
        rol: editFormData.rol,
        activo: editFormData.activo
      }

      // Solo incluir contraseña si se marcó para cambiar
      if (editFormData.changePassword && editFormData.password) {
        updateData.password = editFormData.password
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const successMessage = editFormData.changePassword && editFormData.password 
          ? 'Los datos del usuario y su contraseña han sido actualizados exitosamente'
          : 'Los datos del usuario han sido actualizados exitosamente'
        
        await showSuccess('¡Usuario actualizado!', successMessage)
        onClose()
        onUserUpdated()
        onModeChange('view')
      } else {
        const data = await response.json()
        await showError('Error al actualizar usuario', data.error || 'Ocurrió un error inesperado')
      }
    } catch (error) {
      await showError('Error de conexión', 'No se pudo conectar con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 via-indigo-200/20 to-purple-200/20 dark:from-blue-800/10 dark:via-indigo-800/10 dark:to-purple-800/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 dark:from-emerald-800/10 dark:to-teal-800/10 rounded-full blur-2xl -z-10"></div>
        
        <DialogHeader className="relative z-10 border-b border-slate-200/40 dark:border-slate-600/40 pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-slate-200">
            <div className={`p-2 rounded-lg shadow-lg ${getRoleBadgeColor(user.rol)} transition-all duration-200`}>
              {getRoleIcon(user.rol)}
            </div>
            <div>
              <span className="bg-gradient-to-r from-slate-700 via-blue-700 to-indigo-700 dark:from-slate-300 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                {mode === 'view' ? 'Detalles del Usuario' : 'Editar Usuario'}
              </span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 mt-2">
            {mode === 'view' 
              ? `Información completa de ${user.nombre} ${user.apellido}`
              : 'Modifica los datos del usuario según sea necesario'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="relative z-10 py-6">
          {mode === 'view' ? (
            // Modo vista - información detallada
            <div className="space-y-6">
              {/* Información básica */}
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-slate-200/60 dark:border-slate-600/40 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre completo</Label>
                    <p className="text-slate-900 dark:text-slate-100 font-medium mt-1">{user.nombre} {user.apellido}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Correo electrónico</Label>
                    <p className="text-slate-900 dark:text-slate-100 font-medium mt-1">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Rol y estado */}
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-slate-200/60 dark:border-slate-600/40 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Permisos y Estado
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rol del sistema</Label>
                    <div className="mt-2">
                      <Badge className={`${getRoleBadgeColor(user.rol)} px-3 py-1`}>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.rol)}
                          {user.rol}
                        </div>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Estado de la cuenta</Label>
                    <div className="mt-2">
                      <Badge variant={user.activo ? 'default' : 'destructive'} className="px-3 py-1">
                        <div className="flex items-center gap-2">
                          <Activity className="h-3 w-3" />
                          {user.activo ? 'Activo' : 'Inactivo'}
                        </div>
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de actividad */}
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-slate-200/60 dark:border-slate-600/40 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Actividad del Usuario
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de registro</Label>
                    <p className="text-slate-900 dark:text-slate-100 font-medium mt-1">
                      {new Date(user.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Último acceso</Label>
                    <p className="text-slate-900 dark:text-slate-100 font-medium mt-1">
                      {user.ultimoAcceso 
                        ? new Date(user.ultimoAcceso).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Nunca ha ingresado'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Modo edición
            <div className="space-y-6">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-slate-200/60 dark:border-slate-600/40 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Información Básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-nombre" className="text-sm font-medium">Nombre *</Label>
                    <Input
                      id="edit-nombre"
                      value={editFormData.nombre}
                      onChange={(e) => setEditFormData({...editFormData, nombre: e.target.value})}
                      className="mt-1"
                      placeholder="Ingrese el nombre"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-apellido" className="text-sm font-medium">Apellido *</Label>
                    <Input
                      id="edit-apellido"
                      value={editFormData.apellido}
                      onChange={(e) => setEditFormData({...editFormData, apellido: e.target.value})}
                      className="mt-1"
                      placeholder="Ingrese el apellido"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="edit-email" className="text-sm font-medium">Correo electrónico *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      className="mt-1"
                      placeholder="Ingrese el correo electrónico"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-slate-200/60 dark:border-slate-600/40 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Permisos y Estado</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Rol del sistema</Label>
                    <Select 
                      value={editFormData.rol} 
                      onValueChange={(value: any) => setEditFormData({...editFormData, rol: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INVITADO">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Invitado
                          </div>
                        </SelectItem>
                        <SelectItem value="OPERATIVO">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Operativo
                          </div>
                        </SelectItem>
                        <SelectItem value="SEGUIMIENTO">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            Seguimiento
                          </div>
                        </SelectItem>
                        <SelectItem value="ADMINISTRADOR">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4" />
                            Administrador
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estado de la cuenta</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        checked={editFormData.activo}
                        onCheckedChange={(checked) => setEditFormData({...editFormData, activo: checked})}
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {editFormData.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-slate-200/60 dark:border-slate-600/40 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Cambio de Contraseña
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editFormData.changePassword}
                      onCheckedChange={(checked) => setEditFormData({...editFormData, changePassword: checked, password: '', confirmPassword: ''})}
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Cambiar contraseña del usuario
                    </span>
                  </div>
                  
                  {editFormData.changePassword && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div>
                        <Label htmlFor="edit-password" className="text-sm font-medium">Nueva contraseña</Label>
                        <Input
                          id="edit-password"
                          type="password"
                          value={editFormData.password}
                          onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                          className="mt-1"
                          placeholder="Mínimo 8 caracteres"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-confirm-password" className="text-sm font-medium">Confirmar contraseña</Label>
                        <Input
                          id="edit-confirm-password"
                          type="password"
                          value={editFormData.confirmPassword}
                          onChange={(e) => setEditFormData({...editFormData, confirmPassword: e.target.value})}
                          className="mt-1"
                          placeholder="Repita la contraseña"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="relative z-10 border-t border-slate-200/40 dark:border-slate-600/40 pt-4">
          {mode === 'view' ? (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                onClick={() => onModeChange('edit')}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg transition-all duration-200 flex-1 sm:flex-none"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Usuario
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 sm:flex-none"
              >
                Cerrar
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={() => onModeChange('view')}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveEdit}
                disabled={isLoading}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg transition-all duration-200 flex-1 sm:flex-none"
              >
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
