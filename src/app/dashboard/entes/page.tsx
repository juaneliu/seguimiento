'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Download, 
  Search, 
  Users, 
  Shield, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  FileText,
  ExternalLink,
  X,
  ChevronDown,
  ChevronRight,
  Loader2
} from "lucide-react"
import { showError, showSuccess, showConfirm } from "@/lib/notifications"
import { useEntes } from "@/hooks/use-entes"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { DatabaseStatus } from "@/components/database-status"

// Forzar renderizado dinámico para evitar caché estático
export const dynamic = 'force-dynamic'

export default function EntesPage() {
  return (
    <ProtectedRoute allowedRoles={['INVITADO', 'OPERATIVO', 'ADMINISTRADOR', 'SEGUIMIENTO']}>
      <EntesPageContent />
    </ProtectedRoute>
  )
}

function EntesPageContent() {
  const { entes, loading, error, deleteEnte } = useEntes()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeView, setActiveView] = useState('sujetos-obligados')
  const [sistemaFilter, setSistemaFilter] = useState('sistema1')
  
  // Estado para filas expandidas de oficios
  const [entesExpandidos, setEntesExpandidos] = useState<{[key: string]: {
    ente: any,
    sistema: string,
    oficios: any[],
    loading: boolean
  }}>({})
  const [loadingOficios, setLoadingOficios] = useState(false)
  
  // Timestamp para invalidar caché del navegador
  const [buildTime] = useState(() => Date.now())
  
  // Función para verificar si un ente tiene el sistema seleccionado
  const hasSelectedSystem = (ente: any) => {
    switch (sistemaFilter) {
      case 'sistema1': return ente.sistema1 === true
      case 'sistema2': return ente.sistema2 === true
      case 'sistema3': return ente.sistema3 === true
      case 'sistema6': return ente.sistema6 === true
      default: return false
    }
  }

  // Función para calcular porcentaje de cumplimiento
  const calculatePercentage = (poder: string, ambito?: string) => {
    const filteredEntes = entes.filter(e => {
      if (ambito) {
        return e.poderGobierno === poder && e.ambitoGobierno === ambito
      }
      return e.poderGobierno === poder
    })
    
    if (filteredEntes.length === 0) return 0
    
    const withSystems = filteredEntes.filter(hasSelectedSystem).length
    return Math.round((withSystems / filteredEntes.length) * 100)
  }

  // Verificar si el usuario puede editar/eliminar
  const canEdit = user?.rol !== 'INVITADO'
  
  // Función para filtrar entes según el término de búsqueda
  const filtrarEntes = (entes: any[]) => {
    if (!searchTerm.trim()) return entes
    
    const termino = searchTerm.toLowerCase().trim()
    return entes.filter(ente => 
      ente.nombre.toLowerCase().includes(termino) ||
      ente.poderGobierno.toLowerCase().includes(termino) ||
      ente.ambitoGobierno.toLowerCase().includes(termino) ||
      ente.entidad.nombre.toLowerCase().includes(termino) ||
      (ente.municipio && ente.municipio.toLowerCase().includes(termino))
    )
  }
  
  // Filtrar entes según su tipo y luego aplicar búsqueda
  const sujetosObligados = filtrarEntes(entes.filter(ente => !ente.controlOIC))
  const autoridadesResolutoras = filtrarEntes(entes.filter(ente => ente.controlOIC))

  const limpiarBusqueda = () => {
    setSearchTerm("")
  }

  const handleEliminarEnte = async (id: number, nombre: string) => {
    const result = await showConfirm(
      '¿Estás seguro?',
      `Se eliminará el ente público:\n\n"${nombre}"`
    )

    if (result.isConfirmed) {
      try {
        await deleteEnte(id)
        await showSuccess(
          '¡Eliminado!',
          'El ente público ha sido eliminado exitosamente.'
        )
      } catch (error) {
        console.error('Error eliminando ente:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        await showError('Error', `No se pudo eliminar el ente: ${errorMessage}`)
      }
    }
  }

  // Función para expandir/contraer oficios de un ente (solo uno a la vez)
  const handleToggleOficios = async (ente: any, sistema: string) => {
    const key = `${ente.id}-${sistema}`
    
    // Si ya está expandido, contraer
    if (entesExpandidos[key]) {
      setEntesExpandidos({})
      return
    }
    
    // Contraer todos los demás y expandir solo el seleccionado
    setEntesExpandidos({
      [key]: {
        ente,
        sistema,
        oficios: [],
        loading: true
      }
    })
    
    try {
      const response = await fetch(`/api/oficios-seguimiento?enteId=${ente.id}&sistema=${sistema}`)
      if (response.ok) {
        const data = await response.json()
        setEntesExpandidos({
          [key]: {
            ente,
            sistema,
            oficios: data,
            loading: false
          }
        })
      } else {
        setEntesExpandidos({
          [key]: {
            ente,
            sistema,
            oficios: [],
            loading: false
          }
        })
      }
    } catch (error) {
      console.error('Error cargando oficios:', error)
      setEntesExpandidos({
        [key]: {
          ente,
          sistema,
          oficios: [],
          loading: false
        }
      })
    }
  }

  if (loading) {
    return (
      <main className="w-full">
        <ScrollArea className="h-full">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Entes Públicos
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Gestiona y administra los entes públicos del estado
                </p>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-3xl">⏳</span>
                  </div>
                  <p className="text-lg">Cargando entes públicos...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </main>
    )
  }

  if (error) {
    return (
      <main className="w-full">
        <ScrollArea className="h-full">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Entes Públicos</h2>
                <p className="text-muted-foreground">
                  Gestiona y administra los entes públicos del estado
                </p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Error al cargar datos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </main>
    )
  }

  return (
    <main className="w-full">
      <ScrollArea className="h-full">
        {/* Timestamp para invalidar caché: {buildTime} */}
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          {/* Header responsive */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                Entes Públicos
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Gestiona y administra los entes públicos del estado
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 sm:flex-shrink-0">
              {canEdit && (
                <>
                  <Link href="/dashboard/entes/importar">
                    <Button variant="outline" className="w-full sm:w-auto bg-gradient-to-r from-slate-600 to-gray-600 text-white shadow-lg">
                      <Download className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Importar Datos</span>
                      <span className="sm:hidden">Importar</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/entes/crear">
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                      <Plus className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Crear Ente Público</span>
                      <span className="sm:hidden">Crear Ente</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <DatabaseStatus />

          {/* Estadísticas de Cumplimiento por Poder/Ámbito */}
          <Card className="bg-white flex flex-col min-h-[400px]">
            <CardHeader className="pb-2 sm:pb-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 tracking-wide flex items-center gap-2">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Porcentaje de Cumplimiento de Sistemas por Poder/Ámbito
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs text-slate-500 tracking-wide">
                    Última actualización: {new Date().toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long', 
                      year: 'numeric'
                    })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-0 sm:pl-2 flex-1 flex flex-col">
              <div className="space-y-6 p-4">
                {/* Filtro de sistema */}
                <div className="flex justify-end">
                  <select 
                    value={sistemaFilter}
                    onChange={(e) => setSistemaFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-md bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="sistema1">Sistema 1</option>
                    <option value="sistema2">Sistema 2</option>
                    <option value="sistema3">Sistema 3</option>
                    <option value="sistema6">Sistema 6</option>
                  </select>
                </div>

                {/* Gráfico de barras */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Ejecutivo */}
                  <div className="space-y-2">
                    <div className="h-48 bg-slate-50 rounded-lg relative overflow-hidden shadow-sm border border-slate-100">
                      <div className="absolute inset-0 w-full flex flex-col">
                        {/* Barra de no cumplimiento (parte superior - rojo) */}
                        <div 
                          className="bg-gradient-to-t from-red-500 to-red-400 w-full transition-all duration-1000 ease-out"
                          style={{ 
                            height: `${100 - calculatePercentage('Ejecutivo', 'Estatal')}%`
                          }}
                        />
                        {/* Barra de cumplimiento (parte inferior - verde) */}
                        <div 
                          className="bg-gradient-to-t from-emerald-600 to-emerald-500 w-full transition-all duration-1000 ease-out"
                          style={{ 
                            height: `${calculatePercentage('Ejecutivo', 'Estatal')}%`
                          }}
                        />
                      </div>
                      {/* Porcentaje */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg drop-shadow-lg">
                          {calculatePercentage('Ejecutivo', 'Estatal')}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-center text-slate-700">Ejecutivo</p>
                  </div>

                  {/* Legislativo */}
                  <div className="space-y-2">
                    <div className="h-48 bg-slate-50 rounded-lg relative overflow-hidden shadow-sm border border-slate-100">
                      <div className="absolute inset-0 w-full flex flex-col">
                        <div 
                          className="bg-gradient-to-t from-red-500 to-red-400 w-full transition-all duration-1000 ease-out"
                          style={{ 
                            height: `${100 - calculatePercentage('Legislativo')}%`
                          }}
                        />
                        <div 
                          className="bg-gradient-to-t from-emerald-600 to-emerald-500 w-full transition-all duration-1000 ease-out"
                          style={{ 
                            height: `${calculatePercentage('Legislativo')}%`
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg drop-shadow-lg">
                          {calculatePercentage('Legislativo')}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-center text-slate-700">Legislativo</p>
                  </div>

                  {/* Judicial */}
                  <div className="space-y-2">
                    <div className="h-48 bg-slate-50 rounded-lg relative overflow-hidden shadow-sm border border-slate-100">
                      <div className="absolute inset-0 w-full flex flex-col">
                        <div 
                          className="bg-gradient-to-t from-red-500 to-red-400 w-full transition-all duration-1000 ease-out"
                          style={{ 
                            height: `${100 - calculatePercentage('Judicial')}%`
                          }}
                        />
                        <div 
                          className="bg-gradient-to-t from-emerald-600 to-emerald-500 w-full transition-all duration-1000 ease-out"
                          style={{ 
                            height: `${calculatePercentage('Judicial')}%`
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg drop-shadow-lg">
                          {calculatePercentage('Judicial')}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-center text-slate-700">Judicial</p>
                  </div>

                  {/* Autónomo (OCA) */}
                  <div className="space-y-2">
                    <div className="h-48 bg-slate-50 rounded-lg relative overflow-hidden shadow-sm border border-slate-100">
                      <div className="absolute inset-0 w-full flex flex-col">
                        <div 
                          className="bg-gradient-to-t from-red-500 to-red-400 w-full transition-all duration-1000 ease-out"
                          style={{ 
                            height: `${100 - calculatePercentage('Autónomo')}%`
                          }}
                        />
                        <div 
                          className="bg-gradient-to-t from-emerald-600 to-emerald-500 w-full transition-all duration-1000 ease-out"
                          style={{ 
                            height: `${calculatePercentage('Autónomo')}%`
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg drop-shadow-lg">
                          {calculatePercentage('Autónomo')}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-center text-slate-700">OCA</p>
                  </div>

                  {/* Ejecutivo Municipal */}
                  <div className="space-y-2">
                    <div className="h-48 bg-slate-50 rounded-lg relative overflow-hidden shadow-sm border border-slate-100">
                      <div className="absolute inset-0 w-full flex flex-col">
                        <div 
                          className="bg-gradient-to-t from-red-500 to-red-400 w-full transition-all duration-1000 ease-out"
                          style={{ 
                            height: `${100 - calculatePercentage('Ejecutivo', 'Municipal')}%`
                          }}
                        />
                        <div 
                          className="bg-gradient-to-t from-emerald-600 to-emerald-500 w-full transition-all duration-1000 ease-out"
                          style={{ 
                            height: `${calculatePercentage('Ejecutivo', 'Municipal')}%`
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg drop-shadow-lg">
                          {calculatePercentage('Ejecutivo', 'Municipal')}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-center text-slate-700">Ejecutivo Municipal</p>
                  </div>
                </div>

                {/* Leyenda */}
                <div className="flex justify-center gap-6 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-emerald-600 to-emerald-500 rounded shadow-sm"></div>
                    <span className="text-sm font-medium text-slate-700">Interconectados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-red-500 to-red-400 rounded shadow-sm"></div>
                    <span className="text-sm font-medium text-slate-700">No conectados</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Navegación - Pestañas Responsivas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => setActiveView('sujetos-obligados')}
              className={`p-3 sm:p-4 lg:p-6 rounded-xl transition-all duration-300 border-2 ${
                activeView === 'sujetos-obligados'
                  ? 'bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/40 dark:from-blue-900/20 dark:via-indigo-900/15 dark:to-purple-900/10 border-blue-300/80 dark:border-blue-600/80 shadow-xl backdrop-blur-sm ring-2 ring-blue-200/50'
                  : 'bg-gradient-to-br from-white/70 via-slate-50/60 to-gray-50/40 dark:from-slate-800/70 dark:via-slate-700/60 dark:to-slate-600/40 border-slate-200/60 dark:border-slate-600/60 shadow-lg backdrop-blur-sm hover:border-blue-200/60'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="p-2 sm:p-2.5 lg:p-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h3 className="font-semibold text-xs sm:text-sm lg:text-base bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent truncate">
                    Sujetos Obligados
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                    {sujetosObligados.length} entes registrados
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveView('autoridades-resolutoras')}
              className={`p-3 sm:p-4 lg:p-6 rounded-xl transition-all duration-300 border-2 ${
                activeView === 'autoridades-resolutoras'
                  ? 'bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-teal-50/40 dark:from-green-900/20 dark:via-emerald-900/15 dark:to-teal-900/10 border-green-300/80 dark:border-green-600/80 shadow-xl backdrop-blur-sm ring-2 ring-green-200/50'
                  : 'bg-gradient-to-br from-white/70 via-slate-50/60 to-gray-50/40 dark:from-slate-800/70 dark:via-slate-700/60 dark:to-slate-600/40 border-slate-200/60 dark:border-slate-600/60 shadow-lg backdrop-blur-sm hover:border-green-200/60'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="p-2 sm:p-2.5 lg:p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg flex-shrink-0">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h3 className="font-semibold text-xs sm:text-sm lg:text-base bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent truncate">
                    Autoridades Resolutoras
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                    {autoridadesResolutoras.length} autoridades registradas
                  </p>
                </div>
              </div>
            </button>
          </div>
          
          {/* Bloque de búsqueda */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-white/70 to-slate-50/70 dark:from-slate-800/70 dark:to-slate-700/70 backdrop-blur-sm rounded-lg border border-slate-200/60 dark:border-slate-600/60 shadow-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar entes por nombre, poder, ámbito..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 shadow-sm text-sm sm:text-base"
              />
            </div>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={limpiarBusqueda}
                className="w-full sm:w-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 shadow-sm text-sm"
              >
                Limpiar
              </Button>
            )}
          </div>
          
          {/* Resultados de búsqueda */}
          {searchTerm && (
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 px-3 sm:px-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-200/60 dark:border-slate-600/60">
              {sujetosObligados.length + autoridadesResolutoras.length > 0 ? (
                <>
                  Mostrando <span className="font-medium">{sujetosObligados.length + autoridadesResolutoras.length}</span> resultado(s) para "<span className="font-medium">{searchTerm}</span>"
                </>
              ) : (
                <>
                  No se encontraron resultados para "<span className="font-medium">{searchTerm}</span>"
                </>
              )}
            </div>
          )}

          {/* Contenido */}
          <div className="transition-all duration-500 ease-in-out">
            {activeView === 'sujetos-obligados' && (
              <Card className="bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 via-indigo-200/20 to-purple-200/20 dark:from-blue-800/10 dark:via-indigo-800/10 dark:to-purple-800/10 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-200/20 via-blue-200/20 to-cyan-200/20 dark:from-indigo-800/10 dark:via-blue-800/10 dark:to-cyan-800/10 rounded-full blur-2xl -z-10"></div>
                
                <CardHeader className="relative z-10 border-b border-slate-200/60 dark:border-slate-600/60 pb-4 sm:pb-6 bg-gradient-to-r from-white/50 to-blue-50/50 dark:from-slate-800/50 dark:to-slate-700/50 backdrop-blur-sm">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl text-slate-800 dark:text-slate-100">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-bold">
                      Sujetos Obligados ({sujetosObligados.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 relative z-10">
                  {sujetosObligados.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-slate-400" />
                      <p className="text-sm sm:text-base text-slate-600">No hay sujetos obligados registrados aún.</p>
                    </div>
                  ) : (
                    <TablaSujetosObligados 
                      entes={sujetosObligados} 
                      onEliminar={handleEliminarEnte} 
                      onToggleOficios={handleToggleOficios}
                      entesExpandidos={entesExpandidos}
                      canEdit={canEdit} 
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {activeView === 'autoridades-resolutoras' && (
              <Card className="bg-gradient-to-br from-white via-slate-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/20 via-emerald-200/20 to-teal-200/20 dark:from-green-800/10 dark:via-emerald-800/10 dark:to-teal-800/10 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-200/20 via-green-200/20 to-lime-200/20 dark:from-emerald-800/10 dark:via-green-800/10 dark:to-lime-800/10 rounded-full blur-2xl -z-10"></div>
                
                <CardHeader className="relative z-10 border-b border-slate-200/60 dark:border-slate-600/60 pb-6 bg-gradient-to-r from-white/50 to-green-50/50 dark:from-slate-800/50 dark:to-slate-700/50 backdrop-blur-sm">
                  <CardTitle className="flex items-center gap-3 text-xl text-slate-800 dark:text-slate-100">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent font-bold">
                      Autoridades Resolutoras ({autoridadesResolutoras.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 relative z-10">
                  {autoridadesResolutoras.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600 dark:text-slate-400">No hay autoridades resolutoras registradas aún.</p>
                    </div>
                  ) : (
                    <TablaAutoridadesResolutoras 
                      entes={autoridadesResolutoras} 
                      onEliminar={handleEliminarEnte} 
                      onToggleOficios={handleToggleOficios}
                      entesExpandidos={entesExpandidos}
                      canEdit={canEdit} 
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ScrollArea>
    </main>
  )
}

// Componente para la tabla de Sujetos Obligados - Responsive
const TablaSujetosObligados = ({ entes, onEliminar, onToggleOficios, entesExpandidos, canEdit }: { 
  entes: any[], 
  onEliminar: (id: number, nombre: string) => void, 
  onToggleOficios: (ente: any, sistema: string) => void,
  entesExpandidos: {[key: string]: {ente: any, sistema: string, oficios: any[], loading: boolean}},
  canEdit: boolean 
}) => (
  <>
    {/* Vista desktop */}
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200/60 dark:border-slate-600/60">
            <th className="text-left p-3 lg:p-4 font-semibold bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200">Nombre</th>
            <th className="text-center p-3 lg:p-4 font-semibold bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200">Tipo</th>
            <th className="text-center p-3 lg:p-4 font-semibold bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200">Nivel</th>
            <th className="text-center p-3 lg:p-4 font-semibold bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200">S1</th>
            <th className="text-center p-3 lg:p-4 font-semibold bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200">S2</th>
            <th className="text-center p-3 lg:p-4 font-semibold bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200">S6</th>
            {canEdit && (
              <th className="text-center p-3 lg:p-4 font-semibold bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody>
          {entes.map((ente) => (
            <>
              <tr key={ente.id} className="border-b border-slate-100/60 dark:border-slate-700/60 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="p-3 lg:p-4">
                  <div>
                    <div className="font-medium text-sm lg:text-base text-slate-900 dark:text-slate-100">{ente.nombre}</div>
                    {ente.municipio && (
                      <div className="text-xs lg:text-sm text-slate-600 dark:text-slate-400">{ente.municipio}</div>
                    )}
                    <div className="text-xs text-slate-500 dark:text-slate-500">{ente.entidad.nombre}</div>
                  </div>
                </td>
                <td className="p-3 lg:p-4 text-center">
                  <div className="text-xs lg:text-sm text-slate-700 dark:text-slate-300">{ente.poderGobierno}</div>
                </td>
                <td className="p-3 lg:p-4 text-center">
                  <div className="text-xs lg:text-sm text-slate-700 dark:text-slate-300">{ente.ambitoGobierno}</div>
                </td>
                <td className="p-3 lg:p-4 text-center">
                  <button
                    onClick={() => onToggleOficios(ente, 'sistema1')}
                    className="inline-flex items-center justify-center w-6 h-6 lg:w-8 lg:h-8 rounded-full transition-all hover:scale-110 cursor-pointer"
                    title={`Ver oficios de seguimiento - Sistema 1`}
                  >
                    {ente.sistema1 ? (
                      <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-100 to-rose-100 border-2 border-red-300 rounded-full flex items-center justify-center">
                        <XCircle className="h-3 w-3 lg:h-4 lg:w-4 text-red-600" />
                      </div>
                    )}
                  </button>
                </td>
                <td className="p-3 lg:p-4 text-center">
                  <button
                    onClick={() => onToggleOficios(ente, 'sistema2')}
                    className="inline-flex items-center justify-center w-6 h-6 lg:w-8 lg:h-8 rounded-full transition-all hover:scale-110 cursor-pointer"
                    title={`Ver oficios de seguimiento - Sistema 2`}
                  >
                    {ente.sistema2 ? (
                      <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-100 to-rose-100 border-2 border-red-300 rounded-full flex items-center justify-center">
                        <XCircle className="h-3 w-3 lg:h-4 lg:w-4 text-red-600" />
                      </div>
                    )}
                  </button>
                </td>
                <td className="p-3 lg:p-4 text-center">
                  <button
                    onClick={() => onToggleOficios(ente, 'sistema6')}
                    className="inline-flex items-center justify-center w-6 h-6 lg:w-8 lg:h-8 rounded-full transition-all hover:scale-110 cursor-pointer"
                    title={`Ver oficios de seguimiento - Sistema 6`}
                  >
                    {ente.sistema6 ? (
                      <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-100 to-rose-100 border-2 border-red-300 rounded-full flex items-center justify-center">
                        <XCircle className="h-3 w-3 lg:h-4 lg:w-4 text-red-600" />
                      </div>
                    )}
                  </button>
                </td>
                {canEdit && (
                  <td className="p-3 lg:p-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60">
                        <DropdownMenuLabel className="text-slate-700 dark:text-slate-300">Acciones</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/entes/editar/${ente.id}`} className="flex items-center cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onEliminar(ente.id!, ente.nombre)}
                          className="text-red-600 focus:text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                )}
              </tr>
              
              {/* Filas expandidas para oficios de seguimiento */}
              {Object.entries(entesExpandidos).map(([key, expanded]) => {
                if (!key.startsWith(`${ente.id}-`)) return null
                
                const sistema = expanded.sistema
                const colSpan = canEdit ? 7 : 6
                
                return (
                  <tr key={key} className="bg-slate-50/50 dark:bg-slate-800/50">
                    <td colSpan={colSpan} className="p-4 border-b border-slate-200/60 dark:border-slate-600/60">
                      <div className="flex items-center gap-2 mb-3">
                        <button
                          onClick={() => onToggleOficios(ente, sistema)}
                          className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <ChevronDown className="h-4 w-4" />
                          Oficios de Seguimiento - {sistema.charAt(0).toUpperCase() + sistema.slice(1)}
                        </button>
                      </div>
                      
                      {expanded.loading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                          <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Cargando oficios...</span>
                        </div>
                      ) : expanded.oficios.length === 0 ? (
                        <div className="text-center py-4">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">No hay oficios de seguimiento registrados para este sistema.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {expanded.oficios.map((oficio: any) => (
                            <div key={oficio.id} className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200/60 dark:border-slate-600/60 shadow-sm">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-1">{oficio.titulo}</h4>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                    Fecha: {new Date(oficio.fechaOficio).toLocaleDateString('es-ES')}
                                  </p>
                                  {oficio.descripcion && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{oficio.descripcion}</p>
                                  )}
                                </div>
                                {oficio.urlPdf && (
                                  <a
                                    href={oficio.urlPdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Ver PDF
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </>
          ))}
        </tbody>
      </table>
    </div>

    {/* Vista móvil */}
    <div className="lg:hidden space-y-3">
      {entes.map((ente) => (
        <Card key={ente.id} className="p-3 sm:p-4 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 border-slate-200/60 dark:border-slate-600/60 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">{ente.nombre}</div>
              {ente.municipio && (
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">{ente.municipio}</div>
              )}
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">{ente.entidad.nombre}</div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3">
                <div className="text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Tipo:</span> <span className="text-slate-600 dark:text-slate-400">{ente.poderGobierno}</span>
                </div>
                <div className="text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Nivel:</span> <span className="text-slate-600 dark:text-slate-400">{ente.ambitoGobierno}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">S1:</span>
                  <button
                    onClick={() => onToggleOficios(ente, 'sistema1')}
                    className="transition-all hover:scale-110 cursor-pointer"
                    title="Ver oficios de seguimiento - Sistema 1"
                  >
                    {ente.sistema1 ? (
                      <div className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-green-100 to-emerald-100 border border-green-300 rounded-full">
                        <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-red-100 to-rose-100 border border-red-300 rounded-full">
                        <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-600" />
                      </div>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">S2:</span>
                  <button
                    onClick={() => onToggleOficios(ente, 'sistema2')}
                    className="transition-all hover:scale-110 cursor-pointer"
                    title="Ver oficios de seguimiento - Sistema 2"
                  >
                    {ente.sistema2 ? (
                      <div className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-green-100 to-emerald-100 border border-green-300 rounded-full">
                        <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-red-100 to-rose-100 border border-red-300 rounded-full">
                        <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-600" />
                      </div>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">S6:</span>
                  <button
                    onClick={() => onToggleOficios(ente, 'sistema6')}
                    className="transition-all hover:scale-110 cursor-pointer"
                    title="Ver oficios de seguimiento - Sistema 6"
                  >
                    {ente.sistema6 ? (
                      <div className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-green-100 to-emerald-100 border border-green-300 rounded-full">
                        <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-red-100 to-rose-100 border border-red-300 rounded-full">
                        <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-600" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
            {canEdit && (
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-slate-600">
                  <Link href={`/dashboard/entes/editar/${ente.id}`}>
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600 dark:text-slate-300" />
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-slate-600">
                      <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600 dark:text-slate-300" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60">
                    <DropdownMenuLabel className="text-slate-700 dark:text-slate-300">Acciones</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/entes/editar/${ente.id}`} className="flex items-center cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onEliminar(ente.id!, ente.nombre)}
                      className="text-red-600 focus:text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  </>
)

// Componente para la tabla de Autoridades Resolutoras - Responsive
const TablaAutoridadesResolutoras = ({ entes, onEliminar, onToggleOficios, entesExpandidos, canEdit }: { 
  entes: any[], 
  onEliminar: (id: number, nombre: string) => void, 
  onToggleOficios: (ente: any, sistema: string) => void,
  entesExpandidos: {[key: string]: {ente: any, sistema: string, oficios: any[], loading: boolean}},
  canEdit: boolean 
}) => (
  <>
    {/* Vista desktop */}
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200/60 dark:border-slate-600/60">
            <th className="text-center p-4 font-semibold bg-gradient-to-r from-slate-50 to-green-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200">Nombre</th>
            <th className="text-center p-4 font-semibold bg-gradient-to-r from-slate-50 to-green-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200">Tipo</th>
            <th className="text-center p-4 font-semibold bg-gradient-to-r from-slate-50 to-green-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200">Nivel</th>
            <th className="text-center p-4 font-semibold bg-gradient-to-r from-slate-50 to-green-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200">S3</th>
            {canEdit && (
              <th className="text-center p-4 font-semibold bg-gradient-to-r from-slate-50 to-green-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody>
          {entes.map((ente) => (
            <>
              <tr key={ente.id} className="border-b border-slate-100/60 dark:border-slate-700/60">
                <td className="p-4">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{ente.nombre}</div>
                    {ente.municipio && (
                      <div className="text-sm text-slate-600 dark:text-slate-400">{ente.municipio}</div>
                    )}
                    <div className="text-xs text-slate-500 dark:text-slate-500">{ente.entidad.nombre}</div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="text-slate-700 dark:text-slate-300">{ente.poderGobierno}</div>
                </td>
                <td className="p-4 text-center">
                  <div className="text-slate-700 dark:text-slate-300">{ente.ambitoGobierno}</div>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => onToggleOficios(ente, 'sistema3')}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110 cursor-pointer"
                    title={`Ver oficios de seguimiento - Sistema 3`}
                  >
                    {ente.sistema3 ? (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-300 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-100 to-rose-100 border-2 border-red-300 rounded-full flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-red-600" />
                      </div>
                    )}
                  </button>
                </td>
                {canEdit && (
                  <td className="p-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60">
                        <DropdownMenuLabel className="text-slate-700 dark:text-slate-300">Acciones</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/entes/editar/${ente.id}`} className="flex items-center cursor-pointer hover:bg-green-50 dark:hover:bg-slate-700">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onEliminar(ente.id!, ente.nombre)}
                          className="text-red-600 focus:text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                )}
              </tr>
              
              {/* Filas expandidas para oficios de seguimiento */}
              {Object.entries(entesExpandidos).map(([key, expanded]) => {
                if (!key.startsWith(`${ente.id}-`)) return null
                
                const sistema = expanded.sistema
                const colSpan = canEdit ? 5 : 4
                
                return (
                  <tr key={key} className="bg-slate-50/50 dark:bg-slate-800/50">
                    <td colSpan={colSpan} className="p-4 border-b border-slate-200/60 dark:border-slate-600/60">
                      <div className="flex items-center gap-2 mb-3">
                        <button
                          onClick={() => onToggleOficios(ente, sistema)}
                          className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400"
                        >
                          <ChevronDown className="h-4 w-4" />
                          Oficios de Seguimiento - {sistema.charAt(0).toUpperCase() + sistema.slice(1)}
                        </button>
                      </div>
                      
                      {expanded.loading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                          <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Cargando oficios...</span>
                        </div>
                      ) : expanded.oficios.length === 0 ? (
                        <div className="text-center py-4">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">No hay oficios de seguimiento registrados para este sistema.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {expanded.oficios.map((oficio: any) => (
                            <div key={oficio.id} className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200/60 dark:border-slate-600/60 shadow-sm">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-1">{oficio.titulo}</h4>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                    Fecha: {new Date(oficio.fechaOficio).toLocaleDateString('es-ES')}
                                  </p>
                                  {oficio.descripcion && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{oficio.descripcion}</p>
                                  )}
                                </div>
                                {oficio.urlPdf && (
                                  <a
                                    href={oficio.urlPdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Ver PDF
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </>
          ))}
        </tbody>
      </table>
    </div>

    {/* Vista móvil */}
    <div className="lg:hidden space-y-3">
      {entes.map((ente) => (
        <Card key={ente.id} className="p-3 sm:p-4 bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 border-slate-200/60 dark:border-slate-600/60 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">{ente.nombre}</div>
              {ente.municipio && (
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">{ente.municipio}</div>
              )}
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">{ente.entidad.nombre}</div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3">
                <div className="text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Tipo:</span> <span className="text-slate-600 dark:text-slate-400">{ente.poderGobierno}</span>
                </div>
                <div className="text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Nivel:</span> <span className="text-slate-600 dark:text-slate-400">{ente.ambitoGobierno}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">S3:</span>
                  {ente.sistema3 ? (
                    <div className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-300 rounded-full">
                      <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-red-100 to-rose-100 border border-red-300 rounded-full">
                      <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            {canEdit && (
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-slate-600">
                  <Link href={`/dashboard/entes/editar/${ente.id}`}>
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600 dark:text-slate-300" />
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-slate-600">
                      <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600 dark:text-slate-300" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60">
                    <DropdownMenuLabel className="text-slate-700 dark:text-slate-300">Acciones</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/entes/editar/${ente.id}`} className="flex items-center cursor-pointer hover:bg-green-50 dark:hover:bg-slate-700">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onEliminar(ente.id!, ente.nombre)}
                      className="text-red-600 focus:text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  </>
) 