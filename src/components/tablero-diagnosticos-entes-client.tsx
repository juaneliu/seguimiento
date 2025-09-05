'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Building2, Calendar, ExternalLink, Edit, BarChart3, Trash2, UserCheck, Clock, CheckCircle2, ChevronDown, ChevronRight, FileCheck, AlertCircle, ExternalLink as LinkIcon, FileDown, Search } from "lucide-react"
import Link from "next/link"
import { DiagnosticoEnte } from "@/hooks/use-diagnosticos-entes"
import { showConfirm, showSuccess, showError } from "@/lib/notifications"
import { useToastContext } from "@/contexts/toast-context"
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"

// Función para obtener color basado en promedio
const getColorByPromedio = (promedio: number): string => {
  // Validar que promedio es un número válido
  if (typeof promedio !== 'number' || isNaN(promedio)) {
    return "#64748b" // slate-500 - Sin datos
  }
  
  if (promedio >= 95) return "#047857" // emerald-700 - Excelente
  if (promedio >= 90) return "#059669" // emerald-600 - Muy bueno
  if (promedio >= 85) return "#10b981" // emerald-500 - Bueno
  if (promedio >= 80) return "#34d399" // emerald-400 - Bueno
  if (promedio >= 75) return "#6ee7b7" // emerald-300 - Aceptable
  if (promedio >= 70) return "#f59e0b" // amber-500 - Regular
  if (promedio >= 65) return "#d97706" // amber-600 - Bajo
  if (promedio >= 60) return "#c2410c" // orange-600 - Muy bajo
  if (promedio >= 50) return "#dc2626" // red-600 - Crítico
  if (promedio > 0) return "#991b1b" // red-700 - Muy crítico
  return "#64748b" // slate-500 - Sin datos
}

// Componente para mostrar el ícono del poder del ente
const PoderIcon = ({ poder, className = "h-6 w-6" }: { poder: string; className?: string }) => {
  const getPoderIcon = (poder: string) => {
    switch (poder?.toLowerCase()) {
      case 'ejecutivo':
        return '/icons/ejecutivo.svg'
      case 'legislativo':
        return '/icons/legislativo.svg'  
      case 'judicial':
        return '/icons/judicial.svg'
      case 'autónomo':
        return '/icons/autonomo.svg'
      default:
        return '/icons/ejecutivo.svg'
    }
  }

  const getPoderColor = (poder: string) => {
    switch (poder?.toLowerCase()) {
      case 'ejecutivo':
        return 'bg-blue-100 border-blue-300'
      case 'legislativo':
        return 'bg-green-100 border-green-300'
      case 'judicial':
        return 'bg-purple-100 border-purple-300'
      case 'autónomo':
        return 'bg-orange-100 border-orange-300'
      default:
        return 'bg-slate-100 border-slate-300'
    }
  }

  return (
    <div className={`${className} relative overflow-hidden border rounded-md ${getPoderColor(poder)} flex items-center justify-center`}>
      <img
        src={getPoderIcon(poder)}
        alt={`Icono ${poder}`}
        className="w-4 h-4 object-contain"
      />
    </div>
  )
}

interface TableroDiagnosticosEntesProps {
  diagnosticos: DiagnosticoEnte[]
  loading: boolean
  onDiagnosticosUpdate?: () => void
}

export default function TableroDiagnosticosEntesClient({
  diagnosticos,
  loading,
  onDiagnosticosUpdate
}: TableroDiagnosticosEntesProps) {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedEnte, setSelectedEnte] = useState('')
  const [selectedEstado, setSelectedEstado] = useState('')
  const [selectedPoder, setSelectedPoder] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  
  // Permisos de edición
  const canEdit = user?.rol === 'ADMINISTRADOR' || user?.rol === 'SEGUIMIENTO' || user?.rol === 'OPERATIVO'

  useEffect(() => {
    setMounted(true)
  }, [])

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Función para expandir/colapsar filas
  const toggleRowExpansion = useCallback((diagnosticoId: number) => {
    setExpandedRows(prevSet => {
      const newSet = new Set(prevSet)
      if (newSet.has(diagnosticoId)) {
        newSet.delete(diagnosticoId)
      } else {
        newSet.add(diagnosticoId)
      }
      return newSet
    })
  }, [])

  // Componente para mostrar las acciones expandidas
  const AccionesExpandidas = ({ diagnostico }: { diagnostico: DiagnosticoEnte }) => {
    const acciones = diagnostico.acciones || []
    const hasPDFs = diagnostico.solicitudUrl || diagnostico.respuestaUrl
    
    return (
      <div className="bg-gray-50 border-t">
        <div className="p-6">
          {/* Grid de 2 columnas para PDFs y Acciones */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Sección de Documentos PDF */}
            {hasPDFs && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <FileDown className="h-5 w-5 mr-2 text-red-600" />
                  Documentos PDF
                </h4>
                <div className="space-y-3">
                  {diagnostico.solicitudUrl && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <FileDown className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Solicitud</p>
                            <p className="text-sm text-gray-600">Documento de solicitud</p>
                          </div>
                        </div>
                        <a
                          href={diagnostico.solicitudUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Abrir PDF
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {diagnostico.respuestaUrl && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <FileDown className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Respuesta</p>
                            <p className="text-sm text-gray-600">Documento de respuesta</p>
                          </div>
                        </div>
                        <a
                          href={diagnostico.respuestaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:text-green-700 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Abrir PDF
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sección de Acciones */}
            <div className={!hasPDFs ? "lg:col-span-2" : ""}>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FileCheck className="h-5 w-5 mr-2 text-blue-600" />
                Acciones del Diagnóstico ({acciones.length})
              </h4>
              
              {acciones.length === 0 ? (
                <div className="bg-white p-6 rounded-lg border border-gray-200 text-center text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No hay acciones registradas para este diagnóstico</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {acciones.map((accion: any, index: number) => (
                    <div key={accion.id || index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge 
                              variant={accion.completada ? "default" : "secondary"}
                              className={accion.completada ? "bg-green-100 text-green-800" : ""}
                            >
                              {accion.completada ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Completada
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pendiente
                                </>
                              )}
                            </Badge>
                            <Badge variant="outline">
                              {accion.descripcion || 'Sin tipo especificado'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            {accion.fechaLimite && (
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>Fecha límite: {new Date(accion.fechaLimite).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                            {(accion.urlAccion || accion.responsable) && (
                              <div className="flex items-center text-gray-600">
                                <LinkIcon className="h-4 w-4 mr-2" />
                                <a
                                  href={accion.urlAccion || accion.responsable}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  Ver documento de acción
                                </a>
                              </div>
                            )}
                            
                            {accion.completada && accion.urlRespuesta && (
                              <div className="flex items-center text-green-600">
                                <FileCheck className="h-4 w-4 mr-2" />
                                <a
                                  href={accion.urlRespuesta}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-800 hover:underline font-medium"
                                >
                                  Ver respuesta de acción (PDF)
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          {accion.completada ? (
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Función para eliminar diagnóstico
  const handleEliminarDiagnostico = useCallback(async (diagnostico: DiagnosticoEnte) => {
    try {
      const confirmed = await showConfirm(
        'Confirmar eliminación',
        `¿Estás seguro de que deseas eliminar el diagnóstico "${diagnostico.nombreActividad}" del ente ${diagnostico.entePublico}?\n\nEsta acción no se puede deshacer.`,
        'Eliminar',
        'Cancelar'
      )

      if (confirmed) {
        const response = await fetch(`/api/diagnosticos-entes/${diagnostico.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Error al eliminar el diagnóstico')
        }

        await showSuccess(
          '¡Diagnóstico eliminado!',
          `El diagnóstico "${diagnostico.nombreActividad}" ha sido eliminado exitosamente.`
        )

        // Actualizar la lista de diagnósticos
        if (onDiagnosticosUpdate) {
          onDiagnosticosUpdate()
        }
      }
    } catch (error) {
      console.error('Error al eliminar diagnóstico:', error)
      await showError(
        'Error al eliminar',
        'No se pudo eliminar el diagnóstico. Por favor, inténtalo de nuevo.'
      )
    }
  }, [onDiagnosticosUpdate])

  // Memoizar datos filtrados para evitar recálculos innecesarios
  const filteredDiagnosticos = useMemo(() => {
    if (!mounted || !diagnosticos || !Array.isArray(diagnosticos)) return []
    
    return diagnosticos.filter(diagnostico => {
      const searchMatch = !debouncedSearchTerm || 
        diagnostico.entePublico?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        diagnostico.actividad?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        diagnostico.nombreActividad?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        diagnostico.poder?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        diagnostico.organo?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      
      const enteMatch = !selectedEnte || selectedEnte === '' || diagnostico.entePublico === selectedEnte
      const estadoMatch = !selectedEstado || selectedEstado === '' || diagnostico.estado === selectedEstado
      const poderMatch = !selectedPoder || selectedPoder === '' || diagnostico.poder === selectedPoder
      
      return searchMatch && enteMatch && estadoMatch && poderMatch
    })
  }, [mounted, diagnosticos, debouncedSearchTerm, selectedEnte, selectedEstado, selectedPoder])

  // Memoizar agrupación por ente
  const diagnosticosPorEnte = useMemo(() => {
    if (!mounted) return {}
    
    return filteredDiagnosticos.reduce((acc: any, diagnostico) => {
      const ente = diagnostico.entePublico
      if (!acc[ente]) {
        acc[ente] = {
          ente,
          poder: diagnostico.poder,
          organo: diagnostico.organo,
          diagnosticos: [],
          promedioEvaluacion: 0,
          totalAcciones: 0,
          accionesCompletadas: 0
        }
      }
      
      acc[ente].diagnosticos.push(diagnostico)
      
      // Calcular métricas
      const evaluaciones = acc[ente].diagnosticos.map((d: any) => d.evaluacion || 0)
      acc[ente].promedioEvaluacion = evaluaciones.reduce((sum: number, val: number) => sum + val, 0) / evaluaciones.length
      
      acc[ente].totalAcciones = acc[ente].diagnosticos.reduce((sum: number, d: any) => 
        sum + (d.acciones?.length || 0), 0)
      acc[ente].accionesCompletadas = acc[ente].diagnosticos.reduce((sum: number, d: any) => 
        sum + (d.acciones?.filter((a: any) => a.completada).length || 0), 0)
      
      return acc
    }, {})
  }, [mounted, filteredDiagnosticos])

  const gruposEntes = useMemo(() => {
    if (!mounted) return []
    
    return Object.values(diagnosticosPorEnte)
      .filter((grupo: any) => grupo && grupo.ente)
      .sort((a: any, b: any) => a.ente.localeCompare(b.ente))
  }, [mounted, diagnosticosPorEnte])

  // Memoizar entes únicos para el filtro
  const entesUnicos = useMemo(() => {
    if (!mounted) return []
    return [...new Set(diagnosticos.map(d => d.entePublico).filter(Boolean))].sort()
  }, [mounted, diagnosticos])

  // Memoizar estados únicos para el filtro
  const estadosUnicos = useMemo(() => {
    if (!mounted) return []
    return [...new Set(diagnosticos.map(d => d.estado).filter(Boolean))].sort()
  }, [mounted, diagnosticos])

  // Memoizar poderes únicos para el filtro
  const poderesUnicos = useMemo(() => {
    if (!mounted) return []
    return [...new Set(diagnosticos.map(d => d.poder).filter(Boolean))].sort()
  }, [mounted, diagnosticos])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros skeleton */}
            <div className="flex flex-wrap gap-4 mb-6">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
            </div>
            
            {/* Tabla skeleton */}
            <TableSkeleton rows={8} columns={6} />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mostrar loading mientras el componente se está montando
  if (!mounted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros skeleton */}
            <div className="flex flex-wrap gap-4 mb-6">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
            </div>
            
            {/* Contenido skeleton */}
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>
      {/* Header con gradiente igual al de municipales */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">
                Diagnósticos de Entes
              </CardTitle>
              <p className="text-blue-100 mt-2">
                {filteredDiagnosticos?.length || 0} diagnósticos en {gruposEntes?.length || 0} entes
              </p>
            </div>
            {canEdit && (
              <Link href="/dashboard/diagnosticos-entes/crear">
                <Button variant="secondary" size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Nuevo Diagnóstico
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Filtros con el mismo diseño que municipales */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200 shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">Buscar</label>
              <input
                type="text"
                placeholder="Buscar por ente, actividad..."
                value={searchTerm || ''}
                onChange={(e) => setSearchTerm(e.target.value || '')}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                suppressHydrationWarning
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">Ente</label>
              <select
                value={selectedEnte || ''}
                onChange={(e) => setSelectedEnte(e.target.value || '')}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                suppressHydrationWarning
              >
                <option value="">Todos los entes</option>
                {(entesUnicos || []).map(ente => (
                  <option key={ente} value={ente}>{ente}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">Estado</label>
              <select
                value={selectedEstado || ''}
                onChange={(e) => setSelectedEstado(e.target.value || '')}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                suppressHydrationWarning
              >
                <option value="">Todos los estados</option>
                {(estadosUnicos || []).map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">Poder</label>
              <select
                value={selectedPoder || ''}
                onChange={(e) => setSelectedPoder(e.target.value || '')}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                suppressHydrationWarning
              >
                <option value="">Todos los poderes</option>
                {(poderesUnicos || []).map(poder => (
                  <option key={poder} value={poder}>{poder}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de entes con diseño similar al de municipales */}
      <div className="space-y-6">
        {gruposEntes.map((grupo: any) => {
          return (
            <Card key={grupo.ente} className="overflow-hidden shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <PoderIcon poder={grupo.poder} className="h-12 w-12" />
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-800 mb-1">
                        {grupo.ente}
                      </CardTitle>
                      <div className="flex items-center space-x-3 text-sm text-slate-600">
                        <span className="flex items-center bg-white px-2 py-1 rounded-lg shadow-sm border">
                          <Building2 className="h-4 w-4 mr-1" />
                          {grupo.poder}
                        </span>
                        <span className="flex items-center bg-white px-2 py-1 rounded-lg shadow-sm border">
                          <FileText className="h-4 w-4 mr-1" />
                          {grupo.diagnosticos.length} diagnóstico{grupo.diagnosticos.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div 
                        className="text-3xl font-bold"
                        style={{ color: getColorByPromedio(grupo.promedioEvaluacion) }}
                      >
                        {grupo.promedioEvaluacion.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-600 uppercase tracking-wide">Promedio Evaluación</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-700">
                        {grupo.accionesCompletadas}/{grupo.totalAcciones}
                      </div>
                      <div className="text-xs text-slate-600 uppercase tracking-wide">Acciones</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {grupo.diagnosticos.map((diagnostico: DiagnosticoEnte, index: number) => {
                    const isExpanded = expandedRows.has(diagnostico.id)
                    const hasAcciones = diagnostico.acciones && diagnostico.acciones.length > 0
                    
                    return (
                      <div key={diagnostico.id} className={`${index > 0 ? 'border-t border-slate-100' : ''}`}>
                        <div 
                          className={`p-6 transition-all duration-200 cursor-pointer hover:bg-slate-50 ${
                            hasAcciones ? 'hover:bg-blue-50' : ''
                          }`}
                          onClick={() => hasAcciones && toggleRowExpansion(diagnostico.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 pr-4">
                              {/* Badges arriba del título */}
                              <div className="flex items-center space-x-2 mb-3">
                                <Badge 
                                  variant="outline"
                                  className="bg-purple-100 text-purple-800 border-purple-300 text-xs font-medium px-2 py-1"
                                >
                                  Diagnóstico
                                </Badge>
                                <Badge 
                                  variant="outline"
                                  className={`text-xs font-medium px-2 py-1 ${
                                    diagnostico.estado === 'Completado' 
                                      ? 'bg-green-100 text-green-800 border-green-300' 
                                      : diagnostico.estado === 'En Proceso'
                                      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                      : 'bg-gray-100 text-gray-600 border-gray-300'
                                  }`}
                                >
                                  {diagnostico.estado}
                                </Badge>
                                <Badge 
                                  variant="outline"
                                  className="bg-blue-100 text-blue-800 border-blue-300 text-xs font-medium px-2 py-1"
                                >
                                  {diagnostico.acciones?.length || 0} {diagnostico.acciones?.length === 1 ? 'acción' : 'acciones'}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                {hasAcciones && (
                                  <span className="mr-2">
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-blue-600" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-400" />
                                    )}
                                  </span>
                                )}
                                {diagnostico.nombreActividad}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {diagnostico.unidadAdministrativa}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <BarChart3 className="h-4 w-4 mr-1" />
                                  {diagnostico.evaluacion}%
                                </span>
                                <span className="flex items-center">
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  {diagnostico.acciones?.length || 0} acciones
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(diagnostico.fechaCreacion).toLocaleDateString()}
                                </span>
                                {hasAcciones && (
                                  <span className="text-blue-600 text-xs">
                                    Click para {isExpanded ? 'ocultar' : 'ver'} acciones
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {/* Cuadro del promedio con diseño elegante */}
                              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm min-w-[80px]">
                                <div className="text-center">
                                  <div 
                                    className="text-2xl font-bold mb-1"
                                    style={{ color: getColorByPromedio(diagnostico.evaluacion) }}
                                  >
                                    {diagnostico.evaluacion}%
                                  </div>
                                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                                    Promedio
                                  </div>
                                </div>
                              </div>
                              {canEdit && (
                                <Link 
                                  href={`/dashboard/diagnosticos-entes/editar/${diagnostico.id}`}
                                  onClick={(e) => e.stopPropagation()} // Evita que se expanda al hacer click en editar
                                >
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-1" />
                                    Editar
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Fila expandida con acciones */}
                        {isExpanded && <AccionesExpandidas diagnostico={diagnostico} />}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {!mounted ? (
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      ) : (filteredDiagnosticos?.length === 0) ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron diagnósticos
            </h3>
            <p className="text-gray-600 mb-4">
              No hay diagnósticos que coincidan con los filtros seleccionados.
            </p>
            {canEdit && (
              <Link href="/dashboard/diagnosticos-entes/crear">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer diagnóstico
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
