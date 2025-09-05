'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Save, FileText } from "lucide-react"
import { showSuccess, showError } from "@/lib/notifications"
import { useRouter } from "next/navigation"
import { useAcuerdosSeguimiento } from "@/hooks/use-acuerdos-seguimiento"

// Tipos de sesión
const TIPOS_SESION = [
  "Sesión Ordinaria",
  "Sesión Extraordinaria",
  "Reunión de Trabajo",
  "Comité Técnico",
  "Asamblea General"
]

// Prioridades
const PRIORIDADES = [
  "Alta",
  "Media", 
  "Baja"
]

// Estados
const ESTADOS = [
  "Pendiente",
  "En progreso", 
  "Completado",
  "Cancelado",
  "En revisión"
]

interface AcuerdoForm {
  numeroSesion: string
  tipoSesion: string
  fechaSesion: string
  temaAgenda: string
  descripcionAcuerdo: string
  responsable: string
  area: string
  fechaCompromiso: string
  prioridad: string
  estado: string
  observaciones: string
}

export function FormularioAcuerdo() {
  const router = useRouter()
  const { createAcuerdo } = useAcuerdosSeguimiento()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<AcuerdoForm>({
    numeroSesion: '',
    tipoSesion: '',
    fechaSesion: '',
    temaAgenda: '',
    descripcionAcuerdo: '',
    responsable: '',
    area: '',
    fechaCompromiso: '',
    prioridad: '',
    estado: 'Pendiente',
    observaciones: ''
  })

  const [errors, setErrors] = useState<Partial<AcuerdoForm>>({})

  const handleInputChange = (field: keyof AcuerdoForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<AcuerdoForm> = {}

    // Validaciones obligatorias
    if (!formData.numeroSesion.trim()) {
      newErrors.numeroSesion = 'El número de sesión es obligatorio'
    }
    
    if (!formData.tipoSesion) {
      newErrors.tipoSesion = 'El tipo de sesión es obligatorio'
    }
    
    if (!formData.fechaSesion) {
      newErrors.fechaSesion = 'La fecha de sesión es obligatoria'
    }
    
    if (!formData.temaAgenda.trim()) {
      newErrors.temaAgenda = 'El tema de agenda es obligatorio'
    }
    
    if (!formData.descripcionAcuerdo.trim()) {
      newErrors.descripcionAcuerdo = 'La descripción del acuerdo es obligatoria'
    }
    
    if (!formData.responsable.trim()) {
      newErrors.responsable = 'El responsable es obligatorio'
    }
    
    if (!formData.area.trim()) {
      newErrors.area = 'El área es obligatoria'
    }
    
    if (!formData.fechaCompromiso) {
      newErrors.fechaCompromiso = 'La fecha de compromiso es obligatoria'
    }
    
    if (!formData.prioridad) {
      newErrors.prioridad = 'La prioridad es obligatoria'
    }

    // Validación de fechas
    if (formData.fechaSesion && formData.fechaCompromiso) {
      const fechaSesion = new Date(formData.fechaSesion)
      const fechaCompromiso = new Date(formData.fechaCompromiso)
      
      if (fechaCompromiso < fechaSesion) {
        newErrors.fechaCompromiso = 'La fecha de compromiso no puede ser anterior a la fecha de sesión'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Crear acuerdo usando la API
      await createAcuerdo(formData)

      await showSuccess(
        '¡Acuerdo creado exitosamente!',
        `El acuerdo "${formData.temaAgenda}" ha sido registrado correctamente.`
      )

      // Redirigir al tablero
      router.push('/dashboard/acuerdos')

    } catch (error) {
      console.error('Error al crear acuerdo:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear el acuerdo'
      await showError(
        'Error al crear acuerdo',
        `Ocurrió un error: ${errorMessage}. Por favor, intenta nuevamente.`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <Card className="bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 via-indigo-200/20 to-purple-200/20 dark:from-blue-800/10 dark:via-indigo-800/10 dark:to-purple-800/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-200/20 via-teal-200/20 to-emerald-200/20 dark:from-cyan-800/10 dark:via-teal-800/10 dark:to-emerald-800/10 rounded-full blur-2xl -z-10"></div>
        
        <CardHeader className="relative z-10 border-b border-slate-200/60 dark:border-slate-600/60 pb-4 sm:pb-6 bg-gradient-to-r from-white/50 to-blue-50/50 dark:from-slate-800/50 dark:to-slate-700/50 backdrop-blur-sm">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl text-slate-800 dark:text-slate-100">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-bold">
              Crear Nuevo Acuerdo
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 relative z-10">
          {/* Información de la sesión */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="numeroSesion" className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                Número de Sesión <span className="text-red-500 font-bold text-lg ml-1">*</span>
              </Label>
              <Input
                id="numeroSesion"
                value={formData.numeroSesion}
                onChange={(e) => handleInputChange('numeroSesion', e.target.value)}
                className={`w-full bg-white/70 dark:bg-slate-800/70 border-slate-300/60 dark:border-slate-600/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 ${errors.numeroSesion ? 'field-error border-red-500' : ''}`}
                placeholder="Ej: SOE/2023/001"
              />
              {errors.numeroSesion && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.numeroSesion}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoSesion" className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                Tipo de Sesión <span className="text-red-500 font-bold text-lg ml-1">*</span>
              </Label>
              <Select
                value={formData.tipoSesion}
                onValueChange={(value) => handleInputChange('tipoSesion', value)}
              >
                <SelectTrigger className={`w-full bg-white/70 dark:bg-slate-800/70 border-slate-300/60 dark:border-slate-600/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 ${errors.tipoSesion ? 'field-error border-red-500' : ''}`}>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-slate-300/60 dark:border-slate-600/60">
                  {TIPOS_SESION.map((tipo) => (
                    <SelectItem key={tipo} value={tipo} className="hover:bg-blue-50/80 dark:hover:bg-slate-700/80">
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipoSesion && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.tipoSesion}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaSesion" className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                Fecha de Sesión <span className="text-red-500 font-bold text-lg ml-1">*</span>
              </Label>
              <Input
                id="fechaSesion"
                type="date"
                value={formData.fechaSesion}
                onChange={(e) => handleInputChange('fechaSesion', e.target.value)}
                className={`w-full bg-white/70 dark:bg-slate-800/70 border-slate-300/60 dark:border-slate-600/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 ${errors.fechaSesion ? 'field-error border-red-500' : ''}`}
              />
              {errors.fechaSesion && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.fechaSesion}</p>
              )}
            </div>
          </div>

          {/* Información del acuerdo */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="temaAgenda" className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                Tema de Agenda <span className="text-red-500 font-bold text-lg ml-1">*</span>
              </Label>
              <Input
                id="temaAgenda"
                placeholder="Ej: Implementación de Sistema de Transparencia"
                value={formData.temaAgenda}
                onChange={(e) => handleInputChange('temaAgenda', e.target.value)}
                className={`w-full bg-white/70 dark:bg-slate-800/70 border-slate-300/60 dark:border-slate-600/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 ${errors.temaAgenda ? 'field-error border-red-500' : ''}`}
              />
              {errors.temaAgenda && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.temaAgenda}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcionAcuerdo" className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                Descripción del Acuerdo <span className="text-red-500 font-bold text-lg ml-1">*</span>
              </Label>
              <textarea
                id="descripcionAcuerdo"
                rows={4}
                placeholder="Describe detalladamente el acuerdo tomado en la sesión..."
                value={formData.descripcionAcuerdo}
                onChange={(e) => handleInputChange('descripcionAcuerdo', e.target.value)}
                className={`flex w-full rounded-md border bg-white/70 dark:bg-slate-800/70 border-slate-300/60 dark:border-slate-600/60 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${
                  errors.descripcionAcuerdo ? 'border-red-500' : ''
                }`}
              />
              {errors.descripcionAcuerdo && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.descripcionAcuerdo}</p>
              )}
            </div>
          </div>

          {/* Responsabilidad y seguimiento */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="responsable" className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                Responsable <span className="text-red-500 font-bold text-lg ml-1">*</span>
              </Label>
              <Input
                id="responsable"
                placeholder="Ej: Lic. María González"
                value={formData.responsable}
                onChange={(e) => handleInputChange('responsable', e.target.value)}
                className={`w-full ${errors.responsable ? 'field-error' : ''}`}
              />
              {errors.responsable && (
                <p className="text-xs text-red-500 mt-1">{errors.responsable}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="area" className="text-sm sm:text-base">
                Área <span className="text-red-500 font-bold text-lg ml-1">*</span>
              </Label>
              <Input
                id="area"
                placeholder="Ej: Dirección de Tecnologías"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                className={`w-full ${errors.area ? 'field-error' : ''}`}
              />
              {errors.area && (
                <p className="text-xs text-red-500 mt-1">{errors.area}</p>
              )}
            </div>
          </div>

          {/* Estado y prioridad */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="fechaCompromiso" className="text-sm sm:text-base">
                Fecha de Compromiso <span className="text-red-500 font-bold text-lg ml-1">*</span>
              </Label>
              <Input
                id="fechaCompromiso"
                type="date"
                value={formData.fechaCompromiso}
                onChange={(e) => handleInputChange('fechaCompromiso', e.target.value)}
                className={`w-full ${errors.fechaCompromiso ? 'field-error' : ''}`}
              />
              {errors.fechaCompromiso && (
                <p className="text-xs text-red-500 mt-1">{errors.fechaCompromiso}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridad" className="text-sm sm:text-base">
                Prioridad <span className="text-red-500 font-bold text-lg ml-1">*</span>
              </Label>
              <Select
                value={formData.prioridad}
                onValueChange={(value) => handleInputChange('prioridad', value)}
              >
                <SelectTrigger className={`w-full ${errors.prioridad ? 'field-error' : ''}`}>
                  <SelectValue placeholder="Selecciona la prioridad" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORIDADES.map(prioridad => (
                    <SelectItem key={prioridad} value={prioridad}>{prioridad}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.prioridad && (
                <p className="text-xs text-red-500 mt-1">{errors.prioridad}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado" className="text-sm sm:text-base">Estado Inicial</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => handleInputChange('estado', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map(estado => (
                    <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-sm sm:text-base">Observaciones</Label>
            <textarea
              id="observaciones"
              rows={3}
              placeholder="Observaciones adicionales (opcional)..."
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => router.push('/dashboard/acuerdos')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Acuerdo
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
