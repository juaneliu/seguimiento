'use client'

import React, { useState, useEffect, Fragment } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calendar,
  FileText, 
  Search,
  Filter,
  Download,
  Eye,
  X,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Building,
  MessageSquare,
  Save,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileImage
} from "lucide-react"
import { showConfirm, showSuccess, showError } from "@/lib/notifications"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useAcuerdosSeguimiento, type AcuerdoSeguimiento } from "@/hooks/use-acuerdos-seguimiento"
import { useSeguimientos } from "@/hooks/use-seguimientos"
import { SeguimientosList } from "@/components/seguimientos-list"
import { ModalExportacion } from "@/components/modal-exportacion"

// Tipos de seguimiento
const TIPOS_SEGUIMIENTO = [
  "Pendiente",
  "En progreso", 
  "Completado",
  "Cancelado",
  "En revisión"
]

// Prioridades
const PRIORIDADES = [
  "Alta",
  "Media", 
  "Baja"
]

// Tipos de sesión
const TIPOS_SESION = [
  "Sesión Ordinaria",
  "Sesión Extraordinaria",
  "Reunión de Trabajo",
  "Comité Técnico",
  "Asamblea General"
]

// Tipos de acuerdos ahora vienen del hook useAcuerdosSeguimiento

export function TableroAcuerdos() {
  const { user } = useAuth()
  const { 
    acuerdos, 
    loading, 
    error, 
    estadisticas, 
    deleteAcuerdo,
    updateAcuerdo 
  } = useAcuerdosSeguimiento()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todos")
  const [selectedAcuerdo, setSelectedAcuerdo] = useState<AcuerdoSeguimiento | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showSeguimientos, setShowSeguimientos] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingAcuerdo, setEditingAcuerdo] = useState<AcuerdoSeguimiento | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  
  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Los datos se cargan automáticamente con el hook
  // No necesitamos useEffect para cargar datos

  // Función para filtrar acuerdos
  const filteredAcuerdos = () => {
    let filtered = acuerdos

    // Filtro por término de búsqueda
    if (searchTerm.trim()) {
      const termino = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(acuerdo =>
        acuerdo.numeroSesion.toLowerCase().includes(termino) ||
        acuerdo.temaAgenda.toLowerCase().includes(termino) ||
        acuerdo.descripcionAcuerdo.toLowerCase().includes(termino) ||
        acuerdo.responsable.toLowerCase().includes(termino) ||
        acuerdo.area.toLowerCase().includes(termino)
      )
    }

    // Filtro por estado
    if (filtroEstado !== "todos") {
      filtered = filtered.filter(acuerdo => acuerdo.estado === filtroEstado)
    }

    // Filtro por prioridad
    if (filtroPrioridad !== "todos") {
      filtered = filtered.filter(acuerdo => acuerdo.prioridad === filtroPrioridad)
    }

    return filtered.sort((a, b) => {
      // IMPORTANTE: Ordenar por fecha de creación (más antiguo primero) para mantener 
      // el orden de captura original y asegurar que la numeración sea consistente
      // sin importar las modificaciones posteriores
      const fechaA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0
      const fechaB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0
      return fechaA - fechaB
    })
  }

  // Función para agrupar acuerdos por sesión
  const groupAcuerdosBySesion = () => {
    const filtered = filteredAcuerdos()
    const groups: { [key: string]: AcuerdoSeguimiento[] } = {}
    
    filtered.forEach(acuerdo => {
      const key = `${acuerdo.numeroSesion}-${acuerdo.tipoSesion}`
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(acuerdo)
    })
    
    // Ordenar los acuerdos dentro de cada grupo por fecha de creación
    // IMPORTANTE: Este ordenamiento asegura que la numeración de acuerdos dentro de cada sesión
    // respete el orden cronológico de creación, no de modificación
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        const fechaA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0
        const fechaB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0
        return fechaA - fechaB
      })
    })
    
    return groups
  }

  // Función para obtener los grupos paginados
  const getPaginatedGroups = () => {
    const allGroups = groupAcuerdosBySesion()
    const groupEntries = Object.entries(allGroups)
    
    // Calcular el total de acuerdos individuales para la paginación
    let totalItems = 0
    groupEntries.forEach(([_, acuerdos]) => {
      totalItems += acuerdos.length
    })
    
    // Si itemsPerPage es -1, mostrar todos
    if (itemsPerPage === -1) {
      // Para mostrar todos, también necesitamos calcular los índices de inicio
      const allGroupStartIndexes: { [key: string]: number } = {}
      for (const [sessionKey] of groupEntries) {
        allGroupStartIndexes[sessionKey] = 0
      }
      return { paginatedGroups: allGroups, totalItems, groupStartIndexes: allGroupStartIndexes }
    }
    
    // Aplicar paginación a nivel de acuerdos individuales
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    
    let currentCount = 0
    const paginatedGroups: { [key: string]: AcuerdoSeguimiento[] } = {}
    const groupStartIndexes: { [key: string]: number } = {}
    
    for (const [sessionKey, acuerdos] of groupEntries) {
      const sessionStartIndex = currentCount
      const sessionEndIndex = currentCount + acuerdos.length
      
      // Si este grupo tiene acuerdos en el rango actual
      if (sessionEndIndex > startIndex && sessionStartIndex < endIndex) {
        const groupStartIndex = Math.max(0, startIndex - sessionStartIndex)
        const groupEndIndex = Math.min(acuerdos.length, endIndex - sessionStartIndex)
        
        if (groupStartIndex < groupEndIndex) {
          paginatedGroups[sessionKey] = acuerdos.slice(groupStartIndex, groupEndIndex)
          // Guardar el índice de inicio del grupo para la numeración correcta
          groupStartIndexes[sessionKey] = groupStartIndex
        }
      }
      
      currentCount += acuerdos.length
    }
    
    return { paginatedGroups, totalItems, groupStartIndexes }
  }

  // Calcular información de paginación
  const { paginatedGroups, totalItems, groupStartIndexes } = getPaginatedGroups()
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(totalItems / itemsPerPage)

  // Función para cambiar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Función para cambiar items por página
  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = value === "todos" ? -1 : parseInt(value)
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Resetear a la primera página
  }

  // Resetear página cuando cambian los filtros
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  // Función para obtener el badge del estado
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Completado':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completado</Badge>
      case 'En progreso':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />En progreso</Badge>
      case 'Pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Pendiente</Badge>
      case 'Cancelado':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Cancelado</Badge>
      case 'En revisión':
        return <Badge className="bg-purple-100 text-purple-800"><Eye className="h-3 w-3 mr-1" />En revisión</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  // Función para obtener el badge de prioridad
  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case 'Alta':
        return <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 font-semibold">🔴 Alta</Badge>
      case 'Media':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800 font-semibold">🟡 Media</Badge>
      case 'Baja':
        return <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 font-semibold">🟢 Baja</Badge>
      default:
        return <Badge variant="outline">{prioridad}</Badge>
    }
  }

  // Función para formatear fecha sin problemas de zona horaria
  const formatFecha = (fecha: string | Date) => {
    const date = new Date(fecha)
    // Verificar si es una fecha válida
    if (isNaN(date.getTime())) return 'Fecha inválida'
    
    // Usar getFullYear, getMonth, getDate para evitar problemas de zona horaria
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()
    
    const monthNames = [
      'ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ]
    
    return `${day} ${monthNames[month]} ${year}`
  }

  // Función para calcular días restantes sin problemas de zona horaria
  const diasRestantes = (fechaCompromiso: string | Date) => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0) // Normalizar a medianoche
    
    const compromiso = new Date(fechaCompromiso)
    compromiso.setHours(0, 0, 0, 0) // Normalizar a medianoche
    
    const diferencia = Math.ceil((compromiso.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diferencia < 0) {
      return { texto: `${Math.abs(diferencia)} días de retraso`, clase: "text-red-600" }
    } else if (diferencia === 0) {
      return { texto: "Vence hoy", clase: "text-orange-600 font-medium" }
    } else if (diferencia <= 7) {
      return { texto: `${diferencia} días restantes`, clase: "text-yellow-600 font-medium" }
    } else {
      return { texto: `${diferencia} días restantes`, clase: "text-green-600" }
    }
  }

  // Funciones de manejo de modales

  const openDetails = (acuerdo: AcuerdoSeguimiento) => {
    setSelectedAcuerdo(acuerdo)
    setShowDetails(true)
    setShowSeguimientos(false)
    setShowEditForm(false)
  }

  const openSeguimientos = (acuerdo: AcuerdoSeguimiento) => {
    setSelectedAcuerdo(acuerdo)
    setShowSeguimientos(true)
    setShowDetails(false)
    setShowEditForm(false)
  }

  const openEditForm = (acuerdo: AcuerdoSeguimiento) => {
    setEditingAcuerdo(acuerdo)
    setSelectedAcuerdo(acuerdo)
    setShowEditForm(true)
    setShowDetails(false)
    setShowSeguimientos(false)
  }

  const closeDetails = () => {
    setSelectedAcuerdo(null)
    setShowDetails(false)
    setShowSeguimientos(false)
    setShowEditForm(false)
    setEditingAcuerdo(null)
  }

  const handleUpdateAcuerdo = async (formData: Partial<AcuerdoSeguimiento>) => {
    if (!editingAcuerdo?.id) return

    try {
      await updateAcuerdo(editingAcuerdo.id, formData)
      await showSuccess(
        '✅ Acuerdo actualizado',
        'El acuerdo se ha actualizado exitosamente.'
      )
      closeDetails()
    } catch (error) {
      console.error('Error actualizando acuerdo:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      await showError('Error', `No se pudo actualizar el acuerdo: ${errorMessage}`)
    }
  }

  const handleEliminarAcuerdo = async (id: number, tema: string) => {
    const result = await showConfirm(
      '¿Estás seguro?',
      `Se eliminará el acuerdo:\n\n"${tema}"`
    )

    if (result.isConfirmed) {
      try {
        // Cerrar el modal inmediatamente para mejor UX
        setShowDetails(false)
        setSelectedAcuerdo(null)
        
        // Mostrar notificación de progreso
        await deleteAcuerdo(id)
        
        // Mostrar éxito
        await showSuccess(
          '¡Eliminado!',
          'El acuerdo ha sido eliminado exitosamente.'
        )
      } catch (error) {
        console.error('Error eliminando acuerdo:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        await showError('Error', `No se pudo eliminar el acuerdo: ${errorMessage}`)
      }
    }
  }

  const limpiarFiltros = () => {
    setSearchTerm("")
    setFiltroEstado("todos")
    setFiltroPrioridad("todos")
    setCurrentPage(1)
  }

  // Función para eliminar seguimiento desde la modal de detalles
  const handleDeleteSeguimiento = async (seguimientoId: number, seguimientoTexto: string) => {
    const result = await showConfirm(
      '¿Estás seguro?',
      `Se eliminará el seguimiento:\n\n"${seguimientoTexto}"`
    )

    if (result.isConfirmed) {
      try {
        // Llamada directa al API para eliminar el seguimiento
        const response = await fetch(`/api/seguimientos/${seguimientoId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Error al eliminar seguimiento')
        }

        await showSuccess(
          '¡Eliminado!',
          'El seguimiento ha sido eliminado exitosamente.'
        )
        
        // Actualizar el acuerdo seleccionado removiendo el seguimiento eliminado
        if (selectedAcuerdo && selectedAcuerdo.seguimientos) {
          const seguimientosActualizados = selectedAcuerdo.seguimientos.filter(
            seg => seg.id !== seguimientoId
          )
          setSelectedAcuerdo({
            ...selectedAcuerdo,
            seguimientos: seguimientosActualizados
          })
        }
      } catch (error) {
        console.error('Error eliminando seguimiento:', error)
        await showError('Error', 'No se pudo eliminar el seguimiento')
      }
    }
  }

  // Estadísticas rápidas
  const totalAcuerdos = acuerdos.length
  const completados = acuerdos.filter(a => a.estado === 'Completado').length
  const enProgreso = acuerdos.filter(a => a.estado === 'En progreso').length
  const pendientes = acuerdos.filter(a => a.estado === 'Pendiente').length
  const vencidos = acuerdos.filter(a => {
    const hoy = new Date()
    const compromiso = new Date(a.fechaCompromiso)
    return compromiso < hoy && a.estado !== 'Completado'
  }).length

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-950 dark:via-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-3">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-blue-900 dark:text-blue-100">Total Acuerdos</CardTitle>
            <div className="p-1 sm:p-1.5 bg-blue-500/20 rounded-full">
              <FileText className="h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 pt-0">
            <div className="text-base sm:text-lg md:text-xl font-bold text-blue-900 dark:text-blue-100">{totalAcuerdos}</div>
            <p className="text-[9px] sm:text-xs text-blue-700 dark:text-blue-300 font-medium">
              Registrados en el sistema
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-800 border-emerald-200 dark:border-emerald-700 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-3">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-emerald-900 dark:text-emerald-100">Completados</CardTitle>
            <div className="p-1 sm:p-1.5 bg-emerald-500/20 rounded-full">
              <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 pt-0">
            <div className="text-base sm:text-lg md:text-xl font-bold text-emerald-700 dark:text-emerald-300">{completados}</div>
            <p className="text-[9px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {totalAcuerdos > 0 ? Math.round((completados / totalAcuerdos) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 dark:from-amber-950 dark:via-amber-900 dark:to-amber-800 border-amber-200 dark:border-amber-700 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-3">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-amber-900 dark:text-amber-100">En Progreso</CardTitle>
            <div className="p-1 sm:p-1.5 bg-amber-500/20 rounded-full">
              <Clock className="h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 pt-0">
            <div className="text-base sm:text-lg md:text-xl font-bold text-amber-700 dark:text-amber-300">{enProgreso}</div>
            <p className="text-[9px] sm:text-xs text-amber-600 dark:text-amber-400 font-medium">
              {totalAcuerdos > 0 ? Math.round((enProgreso / totalAcuerdos) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 via-rose-100 to-rose-200 dark:from-rose-950 dark:via-rose-900 dark:to-rose-800 border-rose-200 dark:border-rose-700 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-3">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-rose-900 dark:text-rose-100">Vencidos</CardTitle>
            <div className="p-1 sm:p-1.5 bg-rose-500/20 rounded-full">
              <AlertCircle className="h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 text-rose-600 dark:text-rose-400" />
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 pt-0">
            <div className="text-base sm:text-lg md:text-xl font-bold text-rose-700 dark:text-rose-300">{vencidos}</div>
            <p className="text-[9px] sm:text-xs text-rose-600 dark:text-rose-400 font-medium">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tablero principal */}
      <Card className="bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">{/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 via-indigo-200/20 to-purple-200/20 dark:from-blue-800/10 dark:via-indigo-800/10 dark:to-purple-800/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-200/20 via-teal-200/20 to-emerald-200/20 dark:from-cyan-800/10 dark:via-teal-800/10 dark:to-emerald-800/10 rounded-full blur-2xl -z-10"></div>
        
        <CardHeader className="relative z-10 border-b border-slate-200/60 dark:border-slate-600/60 pb-4 sm:pb-6 bg-gradient-to-r from-white/50 to-blue-50/50 dark:from-slate-800/50 dark:to-slate-700/50 backdrop-blur-sm">
          <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl text-slate-800 dark:text-slate-100">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-bold">
                Plataforma de Acuerdos y Seguimientos
              </span>
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {user && user.rol !== 'INVITADO' && (
                <>
                  <Link href="/dashboard/acuerdos/crear" className="w-full sm:w-auto">
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-200/50 dark:hover:shadow-blue-800/50 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 h-8 sm:h-9 text-xs sm:text-sm"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm">Nuevo Acuerdo</span>
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowExportModal(true)}
                    className="w-full sm:w-auto bg-white/70 hover:bg-blue-50/80 dark:bg-slate-800/70 dark:hover:bg-slate-700/90 hover:border-blue-300/60 dark:hover:border-blue-600/60 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 shadow-md hover:shadow-lg transition-all duration-300 h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Exportar</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 relative z-10">
          {/* Filtros */}
          <div className="relative overflow-hidden space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6 bg-gradient-to-r from-slate-50/80 via-blue-50/60 to-indigo-50/80 dark:from-slate-800/80 dark:via-slate-700/60 dark:to-slate-600/80 rounded-xl border border-slate-200/60 dark:border-slate-600/60 mb-4 sm:mb-6 backdrop-blur-sm shadow-lg">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 dark:from-blue-800/20 dark:to-purple-800/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-tr from-indigo-200/30 to-cyan-200/30 dark:from-indigo-800/20 dark:to-cyan-800/20 rounded-full blur-2xl -z-10"></div>
            
            <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4 relative z-10">
              {/* Campo de búsqueda */}
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none transition-colors duration-200">
                  <Search className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 group-focus-within:text-blue-500" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar por sesión, tema, responsable, área..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    handleFilterChange()
                  }}
                  className="pl-8 sm:pl-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 shadow-sm text-xs sm:text-sm h-8 sm:h-10"
                />
              </div>
              
              {/* Controles de filtro */}
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 lg:flex-row lg:space-x-2">
                <div className="relative">
                  <Select value={filtroEstado} onValueChange={(value) => {
                    setFiltroEstado(value)
                    handleFilterChange()
                  }}>
                    <SelectTrigger className="w-full sm:w-40 md:w-48 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 shadow-sm hover:bg-blue-50/50 dark:hover:bg-slate-700/80 transition-colors duration-200 h-8 sm:h-10 text-xs sm:text-sm">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-slate-200/60 dark:border-slate-600/60 shadow-xl">
                      <SelectItem value="todos" className="focus:bg-blue-50 dark:focus:bg-blue-900/30 text-xs sm:text-sm">Todos los estados</SelectItem>
                      {TIPOS_SEGUIMIENTO.map(estado => (
                        <SelectItem key={estado} value={estado} className="focus:bg-blue-50 dark:focus:bg-blue-900/30 text-xs sm:text-sm">{estado}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <Select value={filtroPrioridad} onValueChange={(value) => {
                    setFiltroPrioridad(value)
                    handleFilterChange()
                  }}>
                    <SelectTrigger className="w-full sm:w-40 md:w-48 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 shadow-sm hover:bg-blue-50/50 dark:hover:bg-slate-700/80 transition-colors duration-200 h-8 sm:h-10 text-xs sm:text-sm">
                      <SelectValue placeholder="Filtrar por prioridad" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-slate-200/60 dark:border-slate-600/60 shadow-xl">
                      <SelectItem value="todos" className="focus:bg-blue-50 dark:focus:bg-blue-900/30 text-xs sm:text-sm">Todas las prioridades</SelectItem>
                      {PRIORIDADES.map(prioridad => (
                        <SelectItem key={prioridad} value={prioridad} className="focus:bg-blue-50 dark:focus:bg-blue-900/30 text-xs sm:text-sm">{prioridad}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(searchTerm || filtroEstado !== "todos" || filtroPrioridad !== "todos") && (
                  <Button 
                    variant="outline" 
                    onClick={limpiarFiltros} 
                    className="w-full sm:w-auto bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 text-slate-700 dark:text-slate-300 shadow-sm hover:bg-blue-50/50 dark:hover:bg-slate-700/80 transition-colors duration-200 h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Limpiar</span>
                    <span className="sm:hidden">Limpiar</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="rounded-xl border border-slate-200/60 dark:border-slate-600/60 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-700/30 shadow-xl backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200/60 dark:border-slate-600/60 bg-gradient-to-r from-slate-50/80 via-blue-50/60 to-indigo-50/40 dark:from-slate-800/80 dark:via-slate-700/60 dark:to-slate-600/40">
                    <th className="h-12 px-4 text-center align-middle font-semibold text-slate-700 dark:text-slate-300">
                      Sesión
                    </th>
                    <th className="h-12 px-4 text-center align-middle font-semibold text-slate-700 dark:text-slate-300">
                      Tema/Acuerdo
                    </th>
                    <th className="h-12 px-4 text-center align-middle font-semibold text-slate-700 dark:text-slate-300">
                      Responsable
                    </th>
                    <th className="h-12 px-4 text-center align-middle font-semibold text-slate-700 dark:text-slate-300">
                      Estado/Prioridad
                    </th>
                    <th className="h-12 px-4 text-center align-middle font-semibold text-slate-700 dark:text-slate-300">
                      Fecha Compromiso
                    </th>
                    <th className="h-12 px-4 text-center align-middle font-semibold text-slate-700 dark:text-slate-300">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {totalItems === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <div className="text-center py-12">
                          <Calendar className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                          <h3 className="text-xl font-semibold text-foreground mb-3">
                            {searchTerm || filtroEstado !== "todos" || filtroPrioridad !== "todos" 
                              ? 'No se encontraron acuerdos' 
                              : 'No hay acuerdos registrados'}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
                            {searchTerm || filtroEstado !== "todos" || filtroPrioridad !== "todos"
                              ? 'Intenta ajustar los filtros de búsqueda.'
                              : 'Comienza creando tu primer acuerdo de sesión.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    Object.entries(paginatedGroups).map(([sessionKey, acuerdosGroup], groupIndex) => {
                      // Información de la sesión (tomamos el primer acuerdo del grupo)
                      const sessionInfo = acuerdosGroup[0]
                      
                      return (
                        <Fragment key={sessionKey}>
                          {/* Fila de encabezado del grupo */}
                          <tr className="bg-slate-100/80 dark:bg-slate-800/60 border-b border-slate-300/60 dark:border-slate-600/60">
                            <td colSpan={6} className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                  {sessionInfo.numeroSesion} - {sessionInfo.tipoSesion}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                  {formatFecha(sessionInfo.fechaSesion)}
                                </div>
                                <div className="ml-auto text-sm text-slate-500 dark:text-slate-400">
                                  {acuerdosGroup.length} acuerdo{acuerdosGroup.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Filas de acuerdos del grupo */}
                          {acuerdosGroup.map((acuerdo, acuerdoIndex) => {
                            const diasInfo = diasRestantes(acuerdo.fechaCompromiso)
                            // Número consecutivo dentro de la sesión considerando la paginación
                            const startIndex = groupStartIndexes?.[sessionKey] || 0
                            const numeroAbsoluto = startIndex + acuerdoIndex + 1
                            const numeroFormateado = numeroAbsoluto.toString().padStart(2, '0')
                            
                            return (
                              <tr key={acuerdo.id} className="border-b border-slate-200/40 dark:border-slate-600/40 cursor-pointer" onClick={() => openDetails(acuerdo)}>
                                <td className="p-4 align-middle pl-8">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                      Acuerdo {numeroFormateado}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  <div className="max-w-xs">
                                    <div className="font-medium text-sm text-slate-800 dark:text-slate-200">{acuerdo.temaAgenda}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{acuerdo.descripcionAcuerdo}</div>
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  <div>
                                    <div className="font-medium text-sm text-slate-800 dark:text-slate-200">{acuerdo.responsable}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{acuerdo.area}</div>
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  <div className="flex flex-col gap-1">
                                    {getEstadoBadge(acuerdo.estado)}
                                    {getPrioridadBadge(acuerdo.prioridad)}
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  <div>
                                    <div className="text-sm text-slate-800 dark:text-slate-200">{formatFecha(acuerdo.fechaCompromiso)}</div>
                                    <div className={`text-xs ${diasInfo.clase}`}>{diasInfo.texto}</div>
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  <div className="text-sm text-slate-600 dark:text-slate-400 max-w-xs break-words break-all">
                                    {acuerdo.observaciones || '-'}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </Fragment>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Vista móvil */}
            <div className="md:hidden">
              {totalItems === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {searchTerm || filtroEstado !== "todos" || filtroPrioridad !== "todos" 
                        ? 'No se encontraron acuerdos' 
                        : 'No hay acuerdos registrados'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                      {searchTerm || filtroEstado !== "todos" || filtroPrioridad !== "todos"
                        ? 'Intenta ajustar los filtros de búsqueda.'
                        : 'Comienza creando tu primer acuerdo de sesión.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-600">
                  {Object.entries(paginatedGroups).map(([sessionKey, acuerdosGroup], groupIndex) => {
                    const sessionInfo = acuerdosGroup[0]
                    
                    return (
                      <div key={sessionKey} className="space-y-3">
                        {/* Encabezado de sesión móvil */}
                        <div className="bg-slate-100/80 dark:bg-slate-800/60 p-3 border-b border-slate-300/60 dark:border-slate-600/60">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {sessionInfo.numeroSesion}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              - {sessionInfo.tipoSesion}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              {formatFecha(sessionInfo.fechaSesion)}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {acuerdosGroup.length} acuerdo{acuerdosGroup.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        
                        {/* Cards de acuerdos móvil */}
                        <div className="space-y-3 p-3">
                          {acuerdosGroup.map((acuerdo, acuerdoIndex) => {
                            const diasInfo = diasRestantes(acuerdo.fechaCompromiso)
                            // Número consecutivo dentro de la sesión considerando la paginación
                            const startIndex = groupStartIndexes?.[sessionKey] || 0
                            const numeroAbsoluto = startIndex + acuerdoIndex + 1
                            const numeroFormateado = numeroAbsoluto.toString().padStart(2, '0')
                            
                            return (
                              <div 
                                key={acuerdo.id} 
                                className="bg-white/60 dark:bg-slate-800/60 rounded-lg border border-slate-200/60 dark:border-slate-600/60 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => openDetails(acuerdo)}
                              >
                                {/* Header del acuerdo */}
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                      Acuerdo {numeroFormateado}
                                    </span>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    {getEstadoBadge(acuerdo.estado)}
                                    <div className="text-right">
                                      {getPrioridadBadge(acuerdo.prioridad)}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Tema y descripción */}
                                <div className="mb-3">
                                  <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 mb-1">
                                    {acuerdo.temaAgenda}
                                  </h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                    {acuerdo.descripcionAcuerdo}
                                  </p>
                                </div>
                                
                                {/* Responsable y área */}
                                <div className="mb-3">
                                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {acuerdo.responsable}
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {acuerdo.area}
                                  </div>
                                </div>
                                
                                {/* Fecha y observaciones */}
                                <div className="flex items-center justify-between text-xs">
                                  <div>
                                    <div className="text-slate-800 dark:text-slate-200 font-medium">
                                      {formatFecha(acuerdo.fechaCompromiso)}
                                    </div>
                                    <div className={diasInfo.clase}>
                                      {diasInfo.texto}
                                    </div>
                                  </div>
                                  {acuerdo.observaciones && (
                                    <div className="max-w-[100px] text-slate-600 dark:text-slate-400 truncate">
                                      {acuerdo.observaciones}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Paginación */}
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-slate-50/80 via-blue-50/60 to-indigo-50/80 dark:from-slate-800/80 dark:via-slate-700/60 dark:to-slate-600/80 rounded-xl border border-slate-200/60 dark:border-slate-600/60 backdrop-blur-sm shadow-lg">
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                <span className="whitespace-nowrap font-semibold">Mostrar:</span>
                <div className="relative">
                  <Select 
                    value={itemsPerPage === -1 ? "todos" : itemsPerPage.toString()} 
                    onValueChange={handleItemsPerPageChange}
                  >
                    <SelectTrigger className="w-14 sm:w-16 h-7 sm:h-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 text-slate-700 dark:text-slate-300 hover:bg-blue-50/50 dark:hover:bg-slate-700/80 transition-colors duration-200 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="min-w-[56px] sm:min-w-[64px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-slate-200/60 dark:border-slate-600/60 shadow-xl">
                      <SelectItem value="10" className="focus:bg-blue-50 dark:focus:bg-blue-900/30 text-xs sm:text-sm">10</SelectItem>
                      <SelectItem value="20" className="focus:bg-blue-50 dark:focus:bg-blue-900/30 text-xs sm:text-sm">20</SelectItem>
                      <SelectItem value="todos" className="focus:bg-blue-50 dark:focus:bg-blue-900/30 text-xs sm:text-sm">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {itemsPerPage !== -1 && (
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                  <span className="whitespace-nowrap font-semibold">Mostrando:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>
                  <span className="hidden sm:inline">de</span>
                  <span className="sm:hidden">/</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{totalItems}</span>
                  <span className="hidden sm:inline">acuerdos</span>
                </div>
              )}
              
              {itemsPerPage === -1 && (
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                  <span className="whitespace-nowrap font-semibold">Mostrando:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">todos los {totalItems}</span>
                  <span className="hidden sm:inline">acuerdos</span>
                </div>
              )}
            </div>
            
            {/* Controles de paginación */}
            {itemsPerPage !== -1 && totalPages > 1 && (
              <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50/50 dark:hover:bg-slate-700/80 transition-colors duration-200 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Anterior</span>
                  <span className="sm:hidden">Ant</span>
                </Button>
                
                <div className="flex items-center gap-1 justify-center overflow-x-auto">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page
                    if (totalPages <= 5) {
                      page = i + 1
                    } else if (currentPage <= 3) {
                      page = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i
                    } else {
                      page = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={
                          currentPage === page
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm p-0"
                            : "bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 text-slate-700 dark:text-slate-300 hover:bg-blue-50/50 dark:hover:bg-slate-700/80 transition-colors duration-200 w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm p-0"
                        }
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50/50 dark:hover:bg-slate-700/80 transition-colors duration-200 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <span className="sm:hidden">Sig</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      {showDetails && selectedAcuerdo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-300">
          <Card className="max-w-5xl w-full max-h-[95vh] overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-2xl backdrop-blur-sm animate-in zoom-in-95 duration-300 relative flex flex-col">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 via-purple-200/20 to-pink-200/20 dark:from-blue-800/10 dark:via-purple-800/10 dark:to-pink-800/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-200/20 via-emerald-200/20 to-teal-200/20 dark:from-cyan-800/10 dark:via-emerald-800/10 dark:to-teal-800/10 rounded-full blur-2xl -z-10"></div>
            
            <CardHeader className="relative z-10 border-b border-slate-200/60 dark:border-slate-600/60 pb-3 bg-gradient-to-r from-white/80 to-blue-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg sm:text-xl text-slate-800 dark:text-slate-100 font-bold">Detalles del Acuerdo</CardTitle>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Sesión {selectedAcuerdo.numeroSesion} • {selectedAcuerdo.tipoSesion}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={closeDetails} 
                  className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 py-4 relative z-10 overflow-y-auto flex-1 min-h-0">
              {/* Información principal - Primera fila: Sesión y Fechas */}
              <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <div className="p-3 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 dark:from-blue-900/20 dark:to-indigo-900/15 rounded-lg border border-blue-200/40 dark:border-blue-700/40 backdrop-blur-sm">
                  <Label className="text-xs sm:text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    Número de Sesión
                  </Label>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">{selectedAcuerdo.numeroSesion}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-50/80 to-pink-50/60 dark:from-purple-900/20 dark:to-pink-900/15 rounded-lg border border-purple-200/40 dark:border-purple-700/40 backdrop-blur-sm">
                  <Label className="text-xs sm:text-sm font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    Tipo de Sesión
                  </Label>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">{selectedAcuerdo.tipoSesion}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-50/80 to-teal-50/60 dark:from-emerald-900/20 dark:to-teal-900/15 rounded-lg border border-emerald-200/40 dark:border-emerald-700/40 backdrop-blur-sm">
                  <Label className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    Fecha de Sesión
                  </Label>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">{formatFecha(selectedAcuerdo.fechaSesion)}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-50/80 to-orange-50/60 dark:from-amber-900/20 dark:to-orange-900/15 rounded-lg border border-amber-200/40 dark:border-amber-700/40 backdrop-blur-sm">
                  <Label className="text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    Fecha de Compromiso
                  </Label>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">{formatFecha(selectedAcuerdo.fechaCompromiso)}</p>
                </div>
              </div>

              {/* Tercera fila: Tema de Agenda y Descripción del Acuerdo */}
              <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
                <div className="p-3 bg-gradient-to-br from-violet-50/80 to-purple-50/60 dark:from-violet-900/20 dark:to-purple-900/15 rounded-lg border border-violet-200/40 dark:border-violet-700/40 backdrop-blur-sm">
                  <Label className="text-xs sm:text-sm font-semibold text-violet-800 dark:text-violet-300 flex items-center gap-2">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    Tema de Agenda
                  </Label>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1 leading-relaxed">{selectedAcuerdo.temaAgenda}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-indigo-50/80 to-blue-50/60 dark:from-indigo-900/20 dark:to-blue-900/15 rounded-lg border border-indigo-200/40 dark:border-indigo-700/40 backdrop-blur-sm">
                  <Label className="text-xs sm:text-sm font-semibold text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    Descripción del Acuerdo
                  </Label>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1 leading-relaxed">{selectedAcuerdo.descripcionAcuerdo}</p>
                </div>
              </div>

              {/* Segunda fila: Responsable, Área, Estado y Prioridad */}
              <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <div className="p-3 bg-gradient-to-br from-cyan-50/80 to-blue-50/60 dark:from-cyan-900/20 dark:to-blue-900/15 rounded-lg border border-cyan-200/40 dark:border-cyan-700/40 backdrop-blur-sm">
                  <Label className="text-xs sm:text-sm font-semibold text-cyan-800 dark:text-cyan-300 flex items-center gap-2">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    Responsable
                  </Label>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">{selectedAcuerdo.responsable}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-rose-50/80 to-pink-50/60 dark:from-rose-900/20 dark:to-pink-900/15 rounded-lg border border-rose-200/40 dark:border-rose-700/40 backdrop-blur-sm">
                  <Label className="text-xs sm:text-sm font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-2">
                    <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                    Área
                  </Label>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">{selectedAcuerdo.area}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-50/80 to-emerald-50/60 dark:from-green-900/20 dark:to-emerald-900/15 rounded-lg border border-green-200/40 dark:border-green-700/40 backdrop-blur-sm">
                  <Label className="text-xs sm:text-sm font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    Estado
                  </Label>
                  <div className="mt-1">{getEstadoBadge(selectedAcuerdo.estado)}</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-50/80 to-red-50/60 dark:from-orange-900/20 dark:to-red-900/15 rounded-lg border border-orange-200/40 dark:border-orange-700/40 backdrop-blur-sm">
                  <Label className="text-xs sm:text-sm font-semibold text-orange-800 dark:text-orange-300 flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    Prioridad
                  </Label>
                  <div className="mt-1">{getPrioridadBadge(selectedAcuerdo.prioridad)}</div>
                </div>
              </div>

              {/* Cuarta fila: Observaciones */}
              {selectedAcuerdo.observaciones && (
                <div className="p-3 bg-gradient-to-br from-slate-50/80 to-gray-50/60 dark:from-slate-900/20 dark:to-gray-900/15 rounded-lg border border-slate-200/40 dark:border-slate-700/40 backdrop-blur-sm">
                  <Label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-2">
                    <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                    Observaciones
                  </Label>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1 leading-relaxed break-words break-all">{selectedAcuerdo.observaciones}</p>
                </div>
              )}

              {/* Sección de Seguimientos */}
              <div className="border-t border-slate-200/60 dark:border-slate-600/60 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm sm:text-lg font-semibold text-card-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Seguimientos
                    {selectedAcuerdo.seguimientos && selectedAcuerdo.seguimientos.length > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {selectedAcuerdo.seguimientos.length}
                      </Badge>
                    )}
                  </Label>
                  {user && user.rol !== 'INVITADO' && (
                    <Button 
                      onClick={() => openSeguimientos(selectedAcuerdo)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Agregar Seguimiento</span>
                      <span className="sm:hidden">Agregar</span>
                    </Button>
                  )}
                </div>
                
                {selectedAcuerdo.seguimientos && selectedAcuerdo.seguimientos.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {selectedAcuerdo.seguimientos
                      .sort((a, b) => new Date(b.fechaSeguimiento).getTime() - new Date(a.fechaSeguimiento).getTime())
                      .map((seguimiento, index) => (
                      <div key={seguimiento.id} className="p-3 bg-gradient-to-br from-slate-50/80 to-blue-50/60 dark:from-slate-800/60 dark:to-slate-700/40 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                #{selectedAcuerdo.seguimientos!.length - index}
                              </Badge>
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                {formatFecha(seguimiento.fechaSeguimiento.toString())}
                              </span>
                              {seguimiento.creadoPor && (
                                <span className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {seguimiento.creadoPor}
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-2 leading-relaxed break-words">
                              {seguimiento.seguimiento}
                            </p>
                            {seguimiento.accion && (
                              <div className="p-2 bg-green-50/80 dark:bg-green-900/20 rounded border border-green-200/40 dark:border-green-700/40">
                                <Label className="text-xs font-medium text-green-800 dark:text-green-300">Acción realizada:</Label>
                                <p className="text-xs text-green-700 dark:text-green-400 mt-1 leading-relaxed break-words">
                                  {seguimiento.accion}
                                </p>
                              </div>
                            )}
                          </div>
                          {user && user.rol !== 'INVITADO' && (
                            <div className="flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteSeguimiento(seguimiento.id, seguimiento.seguimiento)
                                }}
                                className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                title="Eliminar seguimiento"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 text-slate-400 dark:text-slate-600 mx-auto mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4">
                      No hay seguimientos registrados para este acuerdo
                    </p>
                    {user && user.rol !== 'INVITADO' && (
                      <Button 
                        onClick={() => openSeguimientos(selectedAcuerdo)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Agregar Primer Seguimiento
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Botones de acción fijos en la parte inferior */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-border mt-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm -mx-4 -mb-4 px-4 pb-4 flex-shrink-0">
                {user && user.rol !== 'INVITADO' && (
                  <>
                    <Button 
                      onClick={() => handleEliminarAcuerdo(selectedAcuerdo.id!, selectedAcuerdo.temaAgenda)}
                      variant="destructive"
                      className="text-xs sm:text-sm"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Eliminar Acuerdo
                    </Button>
                    <Button 
                      onClick={() => openEditForm(selectedAcuerdo)}
                      className="bg-primary text-primary-foreground text-xs sm:text-sm"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Editar Acuerdo
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de seguimientos */}
      {showSeguimientos && selectedAcuerdo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <Card className="max-w-5xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-2xl backdrop-blur-sm animate-in zoom-in-95 duration-300 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 via-purple-200/20 to-pink-200/20 dark:from-blue-800/10 dark:via-purple-800/10 dark:to-pink-800/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-200/20 via-emerald-200/20 to-teal-200/20 dark:from-cyan-800/10 dark:via-emerald-800/10 dark:to-teal-800/10 rounded-full blur-2xl -z-10"></div>
            
            <CardHeader className="relative z-10 border-b border-slate-200/60 dark:border-slate-600/60 pb-4 bg-gradient-to-r from-white/80 to-blue-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-slate-800 dark:text-slate-100 font-bold flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                    Seguimientos del Acuerdo
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Sesión {selectedAcuerdo.numeroSesion} • {selectedAcuerdo.tipoSesion}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={closeDetails} 
                  className="rounded-full p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 relative z-10">
              <SeguimientosList 
                acuerdoId={selectedAcuerdo.id!} 
                acuerdoTema={selectedAcuerdo.temaAgenda}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de edición */}
      {showEditForm && editingAcuerdo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-2xl backdrop-blur-sm animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <CardHeader className="relative z-10 border-b border-slate-200/60 dark:border-slate-600/60 pb-4 bg-gradient-to-r from-white/80 to-blue-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-slate-800 dark:text-slate-100 font-bold flex items-center gap-2">
                    <Edit className="h-6 w-6 text-blue-600" />
                    Editar Acuerdo
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Sesión {editingAcuerdo.numeroSesion}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={closeDetails} 
                  className="rounded-full p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 relative z-10">
              <FormularioEdicionAcuerdo 
                acuerdo={editingAcuerdo}
                onSave={handleUpdateAcuerdo}
                onCancel={closeDetails}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de exportación */}
      <ModalExportacion 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        acuerdos={acuerdos}
      />
    </div>
  )
}

// Componente para el formulario de edición
interface FormularioEdicionAcuerdoProps {
  acuerdo: AcuerdoSeguimiento
  onSave: (data: Partial<AcuerdoSeguimiento>) => Promise<void>
  onCancel: () => void
}

function FormularioEdicionAcuerdo({ acuerdo, onSave, onCancel }: FormularioEdicionAcuerdoProps) {
  // Función helper para formatear fechas para input sin problemas de zona horaria
  const formatDateForInput = (dateValue: string | Date) => {
    if (!dateValue) return ''
    const date = new Date(dateValue)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [formData, setFormData] = useState({
    numeroSesion: acuerdo.numeroSesion || '',
    tipoSesion: acuerdo.tipoSesion || '',
    fechaSesion: formatDateForInput(acuerdo.fechaSesion),
    temaAgenda: acuerdo.temaAgenda || '',
    descripcionAcuerdo: acuerdo.descripcionAcuerdo || '',
    responsable: acuerdo.responsable || '',
    area: acuerdo.area || '',
    fechaCompromiso: formatDateForInput(acuerdo.fechaCompromiso),
    prioridad: acuerdo.prioridad || '',
    estado: acuerdo.estado || '',
    observaciones: acuerdo.observaciones || ''
  })

  const [loading, setLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave({
        numeroSesion: formData.numeroSesion,
        tipoSesion: formData.tipoSesion,
        fechaSesion: formData.fechaSesion,
        temaAgenda: formData.temaAgenda,
        descripcionAcuerdo: formData.descripcionAcuerdo,
        responsable: formData.responsable,
        area: formData.area,
        fechaCompromiso: formData.fechaCompromiso,
        prioridad: formData.prioridad,
        estado: formData.estado,
        observaciones: formData.observaciones
      })
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="numeroSesion">Número de Sesión</Label>
          <Input
            id="numeroSesion"
            value={formData.numeroSesion}
            onChange={(e) => handleInputChange('numeroSesion', e.target.value)}
            required
            className="bg-white/70 dark:bg-slate-800/70"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipoSesion">Tipo de Sesión</Label>
          <Select value={formData.tipoSesion} onValueChange={(value) => handleInputChange('tipoSesion', value)}>
            <SelectTrigger className="bg-white/70 dark:bg-slate-800/70">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_SESION.map(tipo => (
                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fechaSesion">Fecha de Sesión</Label>
          <Input
            id="fechaSesion"
            type="date"
            value={formData.fechaSesion}
            onChange={(e) => handleInputChange('fechaSesion', e.target.value)}
            required
            className="bg-white/70 dark:bg-slate-800/70"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fechaCompromiso">Fecha de Compromiso</Label>
          <Input
            id="fechaCompromiso"
            type="date"
            value={formData.fechaCompromiso}
            onChange={(e) => handleInputChange('fechaCompromiso', e.target.value)}
            required
            className="bg-white/70 dark:bg-slate-800/70"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="temaAgenda">Tema de Agenda</Label>
        <Input
          id="temaAgenda"
          value={formData.temaAgenda}
          onChange={(e) => handleInputChange('temaAgenda', e.target.value)}
          required
          className="bg-white/70 dark:bg-slate-800/70"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcionAcuerdo">Descripción del Acuerdo</Label>
        <Input
          id="descripcionAcuerdo"
          value={formData.descripcionAcuerdo}
          onChange={(e) => handleInputChange('descripcionAcuerdo', e.target.value)}
          required
          className="bg-white/70 dark:bg-slate-800/70"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="responsable">Responsable</Label>
          <Input
            id="responsable"
            value={formData.responsable}
            onChange={(e) => handleInputChange('responsable', e.target.value)}
            required
            className="bg-white/70 dark:bg-slate-800/70"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="area">Área</Label>
          <Input
            id="area"
            value={formData.area}
            onChange={(e) => handleInputChange('area', e.target.value)}
            required
            className="bg-white/70 dark:bg-slate-800/70"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="prioridad">Prioridad</Label>
          <Select value={formData.prioridad} onValueChange={(value) => handleInputChange('prioridad', value)}>
            <SelectTrigger className="bg-white/70 dark:bg-slate-800/70">
              <SelectValue placeholder="Seleccionar prioridad" />
            </SelectTrigger>
            <SelectContent>
                           {PRIORIDADES.map(prioridad => (
                <SelectItem key={prioridad} value={prioridad}>{prioridad}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Select value={formData.estado} onValueChange={(value) => handleInputChange('estado', value)}>
            <SelectTrigger className="bg-white/70 dark:bg-slate-800/70">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_SEGUIMIENTO.map(estado => (
                <SelectItem key={estado} value={estado}>{estado}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Input
          id="observaciones"
          value={formData.observaciones}
          onChange={(e) => handleInputChange('observaciones', e.target.value)}
          placeholder="Observaciones adicionales (opcional)"
          className="bg-white/70 dark:bg-slate-800/70"
        />
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t border-slate-200/60 dark:border-slate-600/60">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-slate-200 dark:border-slate-600"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
       
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-green-600 to-emerald-600"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  )
}
