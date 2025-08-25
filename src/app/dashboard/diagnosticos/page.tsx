'use client'

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DiagnosticosList } from "@/components/diagnosticos-list"
import { TableroDiagnosticos } from "@/components/tablero-diagnosticos"
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Users,
  Trash2,
  Plus,
  MapPin,
  BarChart3,
  PieChart,
  Download,
  Printer,
  Calendar,
  Filter,
  Settings,
  Save,
  RefreshCw,
  Eye,
  Loader2,
  Activity,
  AlertCircle,
  Timer
} from "lucide-react"
import { showError, showSuccess, showConfirm } from "@/lib/notifications"
import { useDiagnosticosMunicipales } from "@/hooks/use-diagnosticos-municipales"
import { useAuth } from "@/contexts/auth-context"
import { useMetricasDiagnosticosMapa } from "@/hooks/use-metricas-diagnosticos-mapa"
import { useInformes } from "@/hooks/use-informes"
import { MapaMorelos } from "@/components/mapa-morelos"
import { 
  exportarDiagnosticosExcel, 
  generarReportePDF, 
  DiagnosticoData 
} from "@/lib/informes-service"

function DiagnosticosMunicipiosContent() {
  const { user } = useAuth()
  const { 
    diagnosticos, 
    loading, 
    error, 
    estadisticas, 
    fetchDiagnosticos 
  } = useDiagnosticosMunicipales()
  
  // Verificar si el usuario puede editar
  const canEdit = user?.rol !== 'INVITADO'
  
  // Hook para obtener métricas del mapa (para promedio general unificado)
  const { metricasMunicipios: metricasMapa } = useMetricasDiagnosticosMapa()
  
  // Hook para manejo de informes y filtros
  const {
    diagnosticosFiltrados,
    estadisticasFiltradas,
    filtros,
    municipiosUnicos,
    actualizarFiltro,
    resetearFiltros,
    aplicarFiltroTrimestre,
    aplicarFiltroMunicipio,
    aplicarFiltroEvaluacion,
    tendencias,
    comparativas,
    vistaPersonalizada,
    guardarVistaPersonalizada,
    cargarVistaPersonalizada,
    obtenerVistasGuardadas
  } = useInformes(diagnosticos || [])
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeView, setActiveView] = useState('resumen')
  
  // Estados para evitar errores de hidratación
  const [isClient, setIsClient] = useState(false)
  const [municipiosUnicosCount, setMunicipiosUnicosCount] = useState(0)
  const [diagnosticosCompletados, setDiagnosticosCompletados] = useState(0)
  const [promedioGeneralUnificado, setPromedioGeneralUnificado] = useState(0)
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false)
  const [nombreVistaPersonalizada, setNombreVistaPersonalizada] = useState('')
  const [procesandoExportacion, setProcesandoExportacion] = useState(false)

  // Detectar hidratación del cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Calcular métricas después del montaje para evitar hidratación
  useEffect(() => {
    if (isClient && diagnosticos) {
      setMunicipiosUnicosCount(new Set(diagnosticos.map(d => d.municipio)).size)
      setDiagnosticosCompletados(diagnosticos.filter(d => d.evaluacion === 100).length)
    }
  }, [isClient, diagnosticos])

  // Calcular promedio general unificado usando el mismo método que el mapa (promedio de promedios municipales)
  useEffect(() => {
    if (isClient && metricasMapa && metricasMapa.length > 0) {
      // Usar el mismo cálculo que el mapa: promedio de promedios municipales (incluye municipios sin diagnósticos)
      const sumaPromedios = metricasMapa.reduce((sum, m) => sum + m.promedioEvaluacion, 0)
      const promedio = sumaPromedios / metricasMapa.length
      setPromedioGeneralUnificado(promedio)
    } else if (isClient) {
      setPromedioGeneralUnificado(0)
    }
  }, [isClient, metricasMapa])

  // Leer parámetro de vista desde la URL al cargar la página
  useEffect(() => {
    if (isClient) {
      const viewFromUrl = searchParams.get('view')
      if (viewFromUrl && ['resumen', 'tablero', 'detalle'].includes(viewFromUrl)) {
        setActiveView(viewFromUrl)
      }
    }
  }, [isClient, searchParams])

  // Refrescar datos cuando se regresa al tablero después de eliminar
  useEffect(() => {
    if (isClient) {
      const viewFromUrl = searchParams.get('view')
      // Refrescar siempre que se acceda con view=tablero
      if (viewFromUrl === 'tablero') {
                        console.log('🔄 Refrescando diagnósticos al regresar a la plataforma...')
        // Pequeño delay para asegurar que la eliminación se completó
        setTimeout(() => {
          fetchDiagnosticos()
        }, 100)
      }
    }
  }, [isClient, searchParams, fetchDiagnosticos])

  // Función para cambiar de vista y actualizar la URL
  const changeView = (newView: string) => {
    setActiveView(newView)
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', newView)
    router.push(`/dashboard/diagnosticos?${params.toString()}`)
  }

  // Cargar estadísticas desde la API
  useEffect(() => {
    // Las estadísticas se cargan automáticamente con el hook
  }, [])

  // Funciones para exportación
  const manejarExportacionExcel = async (tipo: 'todos' | 'completados') => {
    setProcesandoExportacion(true)
    try {
      const resultado = exportarDiagnosticosExcel(diagnosticosFiltrados as DiagnosticoData[], tipo)
      if (resultado.success) {
        await showSuccess('¡Exportación exitosa!', resultado.message)
      } else {
        await showError('Error en exportación', resultado.message)
      }
    } catch (error) {
      await showError('Error al exportar', 'Error al exportar los diagnósticos')
    }
    setProcesandoExportacion(false)
  }

  const manejarGeneracionPDF = async (tipo: 'ejecutivo' | 'detallado') => {
    setProcesandoExportacion(true)
    try {
      const resultado = await generarReportePDF(
        diagnosticosFiltrados as DiagnosticoData[], 
        estadisticasFiltradas, 
        tipo
      )
      if (resultado.success) {
        await showSuccess('¡PDF generado!', resultado.message)
      } else {
        await showError('Error en PDF', resultado.message)
      }
    } catch (error) {
      await showError('Error al generar PDF', 'Error al generar el reporte PDF')
    }
    setProcesandoExportacion(false)
  }

  // Función para guardar vista personalizada
  const manejarGuardarVista = async () => {
    if (!nombreVistaPersonalizada.trim()) {
      await showError('Campo requerido', 'Por favor ingresa un nombre para la vista')
      return
    }
    
    const metricasSeleccionadas = [
      'total', 'completados', 'enProceso', 'pendientes', 'promedioGeneral'
    ]
    
    guardarVistaPersonalizada(nombreVistaPersonalizada, metricasSeleccionadas)
    await showSuccess('¡Vista guardada!', `Vista "${nombreVistaPersonalizada}" guardada exitosamente`)
    setNombreVistaPersonalizada('')
  }

  // Mostrar loader durante la hidratación
  if (!isClient) {
    return (
      <main className="w-full">
        <ScrollArea className="h-full">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                <p className="text-sm text-slate-500">Cargando diagnósticos...</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </main>
    )
  }

  return (
    <main className="w-full">
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Diagnósticos Municipios
              </h2>
              <p className="text-muted-foreground">
                Monitorea el estado y avance de los diagnósticos municipales
              </p>
            </div>
          </div>

          {/* Estadísticas principales - usando estilos de Acuerdos */}
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 dark:from-purple-950 dark:via-purple-900 dark:to-purple-800 border-purple-200 dark:border-purple-700 shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-3">
                <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Con Diagnósticos</CardTitle>
                <div className="p-1 bg-purple-500/20 rounded-full">
                  <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent className="py-1 px-3">
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{municipiosUnicosCount}</div>
                <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                  entes municipales capturados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-800 border-emerald-200 dark:border-emerald-700 shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-3">
                <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Total Registros</CardTitle>
                <div className="p-1 bg-emerald-500/20 rounded-full">
                  <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent className="py-1 px-3">
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{estadisticas.total || diagnosticos.length}</div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Diagnósticos registrados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 dark:from-amber-950 dark:via-amber-900 dark:to-amber-800 border-amber-200 dark:border-amber-700 shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-3">
                <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">En Proceso</CardTitle>
                <div className="p-1 bg-amber-500/20 rounded-full">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent className="py-1 px-3">
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{estadisticas.enProceso}</div>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {estadisticas.totalMunicipios > 0 ? Math.round((estadisticas.enProceso / estadisticas.totalMunicipios) * 100) : 0}% del total
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-green-950 dark:via-green-900 dark:to-green-800 border-green-200 dark:border-green-700 shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-3">
                <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Concluidos</CardTitle>
                <div className="p-1 bg-green-500/20 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent className="py-1 px-3">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {diagnosticosCompletados}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Diagnósticos al 100%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 via-red-100 to-red-200 dark:from-red-950 dark:via-red-900 dark:to-red-800 border-red-200 dark:border-red-700 shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-3">
                <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">Pendientes</CardTitle>
                <div className="p-1 bg-red-500/20 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
              </CardHeader>
              <CardContent className="py-1 px-3">
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">{estadisticas.pendientes}</div>
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  Sin avance registrado
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 dark:from-orange-950 dark:via-orange-900 dark:to-orange-800 border-orange-200 dark:border-orange-700 shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-3">
                <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">Promedio General</CardTitle>
                <div className="p-1 bg-orange-500/20 rounded-full">
                  <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent className="py-1 px-3">
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {promedioGeneralUnificado.toFixed(1)}%
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  Calificación promedio
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sistema de navegación integrado con tarjetas */}
          <div className="space-y-6">
            {/* Navegación con tarjetas elegantes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => changeView('resumen')}
                className={`group relative p-6 rounded-xl transition-all duration-300 ${
                  activeView === 'resumen'
                    ? 'bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-950 dark:via-blue-900 dark:to-blue-800 border-2 border-blue-300 dark:border-blue-600 shadow-xl'
                    : 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg shadow-lg transition-all duration-300 ${
                    activeView === 'resumen'
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      : 'bg-gradient-to-br from-slate-400 to-slate-500 group-hover:from-blue-400 group-hover:to-blue-500'
                  }`}>
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className={`font-semibold transition-colors duration-300 ${
                      activeView === 'resumen'
                        ? 'text-blue-800 dark:text-blue-200'
                        : 'text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`}>
                      Resumen General
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      activeView === 'resumen'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      Estadísticas y progreso global
                    </p>
                  </div>
                </div>
                {activeView === 'resumen' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-b-xl"></div>
                )}
              </button>

              <button
                onClick={() => changeView('tablero')}
                className={`group relative p-6 rounded-xl transition-all duration-300 ${
                  activeView === 'tablero'
                    ? 'bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-800 border-2 border-emerald-300 dark:border-emerald-600 shadow-xl'
                    : 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg shadow-lg transition-all duration-300 ${
                    activeView === 'tablero'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                      : 'bg-gradient-to-br from-slate-400 to-slate-500 group-hover:from-emerald-400 group-hover:to-emerald-500'
                  }`}>
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className={`font-semibold transition-colors duration-300 ${
                      activeView === 'tablero'
                        ? 'text-emerald-800 dark:text-emerald-200'
                        : 'text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                    }`}>
                      Vista Detallada
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      activeView === 'tablero'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      Visualizaciones avanzadas
                    </p>
                  </div>
                </div>
                {activeView === 'tablero' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-b-xl"></div>
                )}
              </button>

              {canEdit && (
                <button
                  onClick={() => changeView('informes')}
                  className={`group relative p-6 rounded-xl transition-all duration-300 ${
                    activeView === 'informes'
                      ? 'bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 dark:from-purple-950 dark:via-purple-900 dark:to-purple-800 border-2 border-purple-300 dark:border-purple-600 shadow-xl'
                      : 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 shadow-md hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg shadow-lg transition-all duration-300 ${
                      activeView === 'informes'
                        ? 'bg-gradient-to-br from-purple-500 to-violet-600'
                        : 'bg-gradient-to-br from-slate-400 to-slate-500 group-hover:from-purple-400 group-hover:to-purple-500'
                    }`}>
                      <Download className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className={`font-semibold transition-colors duration-300 ${
                        activeView === 'informes'
                          ? 'text-purple-800 dark:text-purple-200'
                          : 'text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                      }`}>
                        Informes
                      </h3>
                      <p className={`text-sm transition-colors duration-300 ${
                        activeView === 'informes'
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        Reportes y exportaciones
                      </p>
                    </div>
                  </div>
                  {activeView === 'informes' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-violet-600 rounded-b-xl"></div>
                  )}
                </button>
              )}
            </div>

            {/* Contenido dinámico */}
            <div className="transition-all duration-500 ease-in-out">
              {activeView === 'resumen' && (
                <div className="space-y-4">
                  {/* Gráficos de estadísticas - usando estilos de Acuerdos con gradientes y efectos */}
              {canEdit && (
                <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2">
                  {/* Card de Diagnósticos Críticos y Alertas de Cumplimiento */}
                  <Card className="bg-gradient-to-br from-white via-slate-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-200/20 via-orange-200/20 to-yellow-200/20 dark:from-red-800/10 dark:via-orange-800/10 dark:to-yellow-800/10 rounded-full blur-3xl -z-10"></div>
                  <CardHeader className="relative z-10 pb-2">
                    <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100 text-base">
                      <div className="p-1.5 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg shadow-lg">
                        <AlertTriangle className="h-4 w-4 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-red-700 via-orange-700 to-yellow-700 dark:from-red-400 dark:via-orange-400 dark:to-yellow-400 bg-clip-text text-transparent font-bold">
                        Diagnósticos Críticos y Alertas
                      </span>
                    </CardTitle>
                    
                    {/* Descripción */}
                    <div className="mt-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Diagnósticos pendientes que requieren atención urgente y próximos a vencimiento
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-2">
                    <div className="space-y-4">
                      {(() => {
                        // Calcular diagnósticos críticos (pendientes sin avance)
                        const diagnosticosCriticos = diagnosticos.filter(d => d.evaluacion === 0)
                        
                        // Calcular alertas de cumplimiento (evaluación baja)
                        const alertasCumplimiento = diagnosticos.filter(d => d.evaluacion > 0 && d.evaluacion < 30)
                        
                        // Diagnósticos en riesgo (evaluación entre 30-50%)
                        const diagnosticosEnRiesgo = diagnosticos.filter(d => d.evaluacion >= 30 && d.evaluacion < 50)
                        
                        // Calcular estadísticas por municipio para identificar los más críticos
                        const estadisticasPorMunicipio = diagnosticos.reduce((acc: any, d) => {
                          const municipio = d.municipio || 'Sin especificar'
                          if (!acc[municipio]) {
                            acc[municipio] = { 
                              total: 0, 
                              criticos: 0, 
                              alertas: 0, 
                              enRiesgo: 0,
                              promedioEvaluacion: 0,
                              sumaEvaluaciones: 0
                            }
                          }
                          acc[municipio].total++
                          acc[municipio].sumaEvaluaciones += d.evaluacion
                          
                          if (d.evaluacion === 0) acc[municipio].criticos++
                          else if (d.evaluacion < 30) acc[municipio].alertas++
                          else if (d.evaluacion < 50) acc[municipio].enRiesgo++
                          
                          return acc
                        }, {})
                        
                        // Calcular promedios por municipio
                        Object.keys(estadisticasPorMunicipio).forEach(municipio => {
                          const stats = estadisticasPorMunicipio[municipio]
                          stats.promedioEvaluacion = stats.sumaEvaluaciones / stats.total
                        })
                        
                        // Obtener los municipios más críticos
                        const municipiosCriticos = Object.entries(estadisticasPorMunicipio)
                          .sort(([,a]: any, [,b]: any) => {
                            const criticidadA = (a.criticos * 3) + (a.alertas * 2) + (a.enRiesgo * 1)
                            const criticidadB = (b.criticos * 3) + (b.alertas * 2) + (b.enRiesgo * 1)
                            return criticidadB - criticidadA
                          })
                          .slice(0, 3)
                        
                        return (
                          <>
                            {/* Métricas principales de criticidad */}
                            <div className="grid grid-cols-3 gap-3">
                              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">Críticos</span>
                                </div>
                                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                                  {diagnosticosCriticos.length}
                                </div>
                                <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                                  Sin avance (0%)
                                </div>
                              </div>
                              
                              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Alertas</span>
                                </div>
                                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                  {alertasCumplimiento.length}
                                </div>
                                <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                  Avance muy bajo (&lt;30%)
                                </div>
                              </div>
                              
                              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-center gap-2 mb-2">
                                  <Timer className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                  <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">En Riesgo</span>
                                </div>
                                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                                  {diagnosticosEnRiesgo.length}
                                </div>
                                <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                  Avance insuficiente (30-50%)
                                </div>
                              </div>
                            </div>
                            
                            {/* Gráfico de distribución de criticidad */}
                            <div className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200/80 dark:border-slate-600/80">
                              <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-red-600" />
                                Nivel de Criticidad General
                              </h4>
                              <div className="flex items-center justify-center mb-4">
                                <div className="relative w-32 h-32">
                                  <svg viewBox="0 0 42 42" className="w-32 h-32 transform -rotate-90">
                                    <circle cx="21" cy="21" r="15.915494309189533" fill="transparent" stroke="#e5e7eb" strokeWidth="3"></circle>
                                    {(() => {
                                      const total = diagnosticos.length;
                                      if (total === 0) return null;
                                      
                                      const criticosPercent = (diagnosticosCriticos.length / total) * 100;
                                      const alertasPercent = (alertasCumplimiento.length / total) * 100;
                                      const riesgoPercent = (diagnosticosEnRiesgo.length / total) * 100;
                                      
                                      const offset = 0;
                                      const radius = 15.915494309189533;
                                      
                                      return (
                                        <>
                                          {diagnosticosCriticos.length > 0 && (
                                            <circle
                                              cx="21" cy="21" r={radius} fill="transparent"
                                              stroke="#dc2626" strokeWidth="3"
                                              strokeDasharray={`${criticosPercent} ${100 - criticosPercent}`}
                                              strokeDashoffset={offset}
                                              className="transition-all duration-500"
                                            />
                                          )}
                                          {alertasCumplimiento.length > 0 && (
                                            <circle
                                              cx="21" cy="21" r={radius} fill="transparent"
                                              stroke="#ea580c" strokeWidth="3"
                                              strokeDasharray={`${alertasPercent} ${100 - alertasPercent}`}
                                              strokeDashoffset={offset - criticosPercent}
                                              className="transition-all duration-500"
                                            />
                                          )}
                                          {diagnosticosEnRiesgo.length > 0 && (
                                            <circle
                                              cx="21" cy="21" r={radius} fill="transparent"
                                              stroke="#ca8a04" strokeWidth="3"
                                              strokeDasharray={`${riesgoPercent} ${100 - riesgoPercent}`}
                                              strokeDashoffset={offset - criticosPercent - alertasPercent}
                                              className="transition-all duration-500"
                                            />
                                          )}
                                        </>
                                      );
                                    })()}
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                        {diagnosticosCriticos.length + alertasCumplimiento.length + diagnosticosEnRiesgo.length}
                                      </div>
                                      <div className="text-xs text-slate-600 dark:text-slate-400">Requieren atención</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Leyenda del gráfico */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                  <span className="text-sm text-slate-600 dark:text-slate-400">Críticos</span>
                                  <span className="text-sm font-semibold text-red-600 ml-auto">{diagnosticosCriticos.length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                  <span className="text-sm text-slate-600 dark:text-slate-400">Alertas</span>
                                  <span className="text-sm font-semibold text-orange-600 ml-auto">{alertasCumplimiento.length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                  <span className="text-sm text-slate-600 dark:text-slate-400">En Riesgo</span>
                                  <span className="text-sm font-semibold text-yellow-600 ml-auto">{diagnosticosEnRiesgo.length}</span>
                                </div>
                              </div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Card de Municipios que Requieren Atención Urgente */}
                <Card className="bg-gradient-to-br from-white via-slate-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-red-200/20 via-orange-200/20 to-yellow-200/20 dark:from-red-800/10 dark:via-orange-800/10 dark:to-yellow-800/10 rounded-full blur-3xl -z-10"></div>
                  <CardHeader className="relative z-10 pb-2">
                    <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100 text-base">
                      <div className="p-1.5 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg shadow-lg">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-red-700 via-orange-700 to-yellow-700 dark:from-red-400 dark:via-orange-400 dark:to-yellow-400 bg-clip-text text-transparent font-bold">
                        Municipios Urgentes
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-2">
                    <div className="space-y-3">
                      {(() => {
                        // Calcular estadísticas críticas por municipio
                        const estadisticasPorMunicipio = diagnosticos.reduce((acc: any, d) => {
                          const municipio = d.municipio || 'Sin especificar'
                          if (!acc[municipio]) {
                            acc[municipio] = { 
                              total: 0, 
                              criticos: 0, 
                              alertas: 0, 
                              enRiesgo: 0,
                              promedioEvaluacion: 0,
                              sumaEvaluaciones: 0
                            }
                          }
                          acc[municipio].total++
                          acc[municipio].sumaEvaluaciones += d.evaluacion
                          
                          if (d.evaluacion === 0) acc[municipio].criticos++
                          else if (d.evaluacion < 30) acc[municipio].alertas++
                          else if (d.evaluacion < 50) acc[municipio].enRiesgo++
                          
                          return acc
                        }, {})
                        
                        // Calcular promedios y ordenar por criticidad
                        const municipiosUrgentes = Object.entries(estadisticasPorMunicipio)
                          .map(([municipio, stats]: any) => {
                            stats.promedioEvaluacion = stats.sumaEvaluaciones / stats.total
                            const criticidadScore = (stats.criticos * 3) + (stats.alertas * 2) + (stats.enRiesgo * 1)
                            return { municipio, ...stats, criticidadScore }
                          })
                          .filter(m => m.criticidadScore > 0)
                          .sort((a, b) => b.criticidadScore - a.criticidadScore)
                          .slice(0, 5)
                        
                        return (
                          <>
                            {/* Top municipios críticos */}
                            {municipiosUrgentes.length > 0 ? (
                              <div className="space-y-2">
                                {municipiosUrgentes.map((municipio, index) => (
                                  <div key={municipio.municipio} className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200/60">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                          index === 0 ? 'bg-red-500' : 
                                          index === 1 ? 'bg-orange-500' : 
                                          index === 2 ? 'bg-yellow-500' : 'bg-slate-500'
                                        }`}>
                                          {index + 1}
                                        </div>
                                        <div>
                                          <div className="font-medium text-sm text-slate-800 dark:text-slate-200">
                                            {municipio.municipio.length > 20 ? `${municipio.municipio.slice(0, 20)}...` : municipio.municipio}
                                          </div>
                                          <div className="text-xs text-slate-600 dark:text-slate-400">
                                            Promedio: {municipio.promedioEvaluacion.toFixed(1)}%
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {municipio.criticos > 0 && (
                                          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 text-xs">
                                            C:{municipio.criticos}
                                          </Badge>
                                        )}
                                        {municipio.alertas > 0 && (
                                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 text-xs">
                                            A:{municipio.alertas}
                                          </Badge>
                                        )}
                                        {municipio.enRiesgo > 0 && (
                                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 text-xs">
                                            R:{municipio.enRiesgo}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Barra de progreso del municipio */}
                                    <div className="mt-2">
                                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                        <div 
                                          className={`h-1.5 rounded-full transition-all duration-500 ${
                                            municipio.promedioEvaluacion >= 75 ? 'bg-green-500' :
                                            municipio.promedioEvaluacion >= 50 ? 'bg-yellow-500' :
                                            municipio.promedioEvaluacion >= 30 ? 'bg-orange-500' : 'bg-red-500'
                                          }`}
                                          style={{ width: `${municipio.promedioEvaluacion}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <h4 className="text-md font-medium text-green-700 dark:text-green-300 mb-1">
                                  ¡Excelente trabajo!
                                </h4>
                                <p className="text-sm text-green-600 dark:text-green-400">
                                  No hay municipios que requieran atención urgente
                                </p>
                              </div>
                            )}
                            
                            {/* Resumen de criticidad */}
                            {municipiosUrgentes.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-600">
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div className="text-center">
                                    <div className="text-red-600 dark:text-red-400 font-bold">
                                      {municipiosUrgentes.reduce((sum, m) => sum + m.criticos, 0)}
                                    </div>
                                    <div className="text-slate-500 dark:text-slate-400">Críticos</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-orange-600 dark:text-orange-400 font-bold">
                                      {municipiosUrgentes.reduce((sum, m) => sum + m.alertas, 0)}
                                    </div>
                                    <div className="text-slate-500 dark:text-slate-400">Alertas</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-yellow-600 dark:text-yellow-400 font-bold">
                                      {municipiosUrgentes.reduce((sum, m) => sum + m.enRiesgo, 0)}
                                    </div>
                                    <div className="text-slate-500 dark:text-slate-400">En Riesgo</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Card de Tipos de Diagnóstico */}
                <Card className="bg-gradient-to-br from-white via-slate-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-200/20 via-violet-200/20 to-fuchsia-200/20 dark:from-purple-800/10 dark:via-violet-800/10 dark:to-fuchsia-800/10 rounded-full blur-3xl -z-10"></div>
                  <CardHeader className="relative z-10 pb-2">
                    <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100 text-base">
                      <div className="p-1.5 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-lg">
                        <PieChart className="h-4 w-4 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-purple-700 via-violet-700 to-fuchsia-700 dark:from-purple-400 dark:via-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent font-bold">
                        Tipos de Diagnóstico
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-2">
                    <div className="space-y-3">
                      {/* Tipos de diagnósticos más frecuentes */}
                      <div className="space-y-2">
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Más frecuentes:</div>
                        {diagnosticos && diagnosticos.length > 0 ? (() => {
                          const tiposCount = diagnosticos.reduce((acc: any, diag: any) => {
                            const actividad = diag.actividad || 'Sin especificar'
                            acc[actividad] = (acc[actividad] || 0) + 1
                            return acc
                          }, {})
                          
                          const tiposArray = Object.entries(tiposCount).sort((a: any, b: any) => b[1] - a[1]).slice(0, 4) as [string, number][]
                          
                          return tiposArray.map(([tipo, count], index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg border border-slate-200/60">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-violet-600"></div>
                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                  {tipo.length > 20 ? `${tipo.slice(0, 20)}...` : tipo}
                                </span>
                              </div>
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">
                                {count}
                              </Badge>
                            </div>
                          ))
                        })() : (
                          <div className="text-center py-4">
                            <PieChart className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">No hay tipos registrados</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Diagnósticos por municipio */}
                      {diagnosticos && diagnosticos.length > 0 && (
                        <div className="pt-3 border-t border-slate-200/60 dark:border-slate-600/60">
                          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-2">Municipios más activos:</div>
                          {(() => {
                            const municipiosCount = diagnosticos.reduce((acc: any, diag: any) => {
                              const municipio = diag.municipio || 'Sin especificar'
                              if (!acc[municipio]) {
                                acc[municipio] = { count: 0, promedio: 0, sumaEvaluaciones: 0 }
                              }
                              acc[municipio].count++
                              acc[municipio].sumaEvaluaciones += diag.evaluacion
                              acc[municipio].promedio = acc[municipio].sumaEvaluaciones / acc[municipio].count
                              return acc
                            }, {})
                            
                            // Crear un algoritmo de scoring que considere tanto cantidad como cumplimiento
                            const municipiosArray = Object.entries(municipiosCount)
                              .map(([municipio, data]: [string, any]) => {
                                // Score combinado: cantidad de diagnósticos * factor de cumplimiento
                                const factorCumplimiento = data.promedio / 100 // Convertir porcentaje a factor (0-1)
                                const scoreActividad = data.count * (1 + factorCumplimiento) // Peso mayor a mayor cumplimiento
                                return [municipio, { ...data, scoreActividad }]
                              })
                              .sort((a: any, b: any) => b[1].scoreActividad - a[1].scoreActividad)
                              .slice(0, 5) as [string, any][]
                            
                            return municipiosArray.map(([municipio, data], index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10 rounded-lg border border-purple-200/60">
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                    index === 0 ? 'bg-purple-500' : 
                                    index === 1 ? 'bg-violet-500' : 
                                    index === 2 ? 'bg-fuchsia-500' :
                                    index === 3 ? 'bg-indigo-500' :
                                    'bg-pink-500'
                                  }`}>
                                    {index + 1}
                                  </div>
                                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                                    {municipio.length > 15 ? `${municipio.slice(0, 15)}...` : municipio}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {data.count}
                                  </Badge>
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs ${
                                      data.promedio >= 75 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                                      data.promedio >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                    }`}
                                  >
                                    {Math.round(data.promedio)}%
                                  </Badge>
                                </div>
                              </div>
                            ))
                          })()}
                        </div>
                      )}
                      
                      {/* Resumen estadístico */}
                      {diagnosticos && diagnosticos.length > 0 && (
                        <div className="pt-3 border-t border-slate-200/60 dark:border-slate-600/60">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-700">
                              <div className="font-bold text-purple-700 dark:text-purple-300">
                                {diagnosticos.length}
                              </div>
                              <div className="text-slate-600 dark:text-slate-400">Total diagnósticos</div>
                            </div>
                            <div className="text-center p-2 bg-violet-50 dark:bg-violet-900/20 rounded border border-violet-200 dark:border-violet-700">
                              <div className="font-bold text-violet-700 dark:text-violet-300">
                                {new Set(diagnosticos.map(d => d.municipio)).size}
                              </div>
                              <div className="text-slate-600 dark:text-slate-400">Municipios activos</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                </div>
              )}

              {/* Mapa de Morelos - Promedio por Municipio */}
              <MapaMorelos />
                </div>
              )}

              {activeView === 'tablero' && (
                <div className="space-y-4">
                  <TableroDiagnosticos 
                    diagnosticos={diagnosticos}
                    loading={loading}
                    onDiagnosticosUpdate={fetchDiagnosticos}
                  />
                </div>
              )}

              {activeView === 'informes' && (
                <div className="space-y-6">
                  {/* Panel de Filtros Avanzados */}
                  <Card className="bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600 shadow-xl backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-600">
                      <CardTitle className="text-slate-800 dark:text-slate-200 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                          <Settings className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">Centro de Control de Informes</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">
                            Configuración avanzada de filtros y generación de reportes
                          </p>
                        </div>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        {mostrarFiltrosAvanzados ? 'Ocultar' : 'Mostrar'} Filtros
                      </Button>
                    </CardHeader>
                    {mostrarFiltrosAvanzados && (
                      <CardContent className="space-y-6 bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-800/50 dark:to-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                          {/* Filtro por Trimestre */}
                          <div className="space-y-2">
                            <Label htmlFor="trimestre" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              📅 Período de Análisis
                            </Label>
                            <Select
                              value={filtros.trimestre}
                              onValueChange={(value) => aplicarFiltroTrimestre(value)}
                            >
                              <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm">
                                <SelectValue placeholder="Seleccionar trimestre" />
                              </SelectTrigger>
                              <SelectContent>
                                                                  <SelectItem value="todos">Todos los períodos</SelectItem>
                                  <SelectItem value="Q1">Q1 2025 (Ene-Mar)</SelectItem>
                            <SelectItem value="Q2">Q2 2025 (Abr-Jun)</SelectItem>
                                  <SelectItem value="Q3">Q3 2025 (Jul-Sep)</SelectItem>
                                  <SelectItem value="Q4">Q4 2025 (Oct-Dic)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Filtro por Municipio */}
                          <div className="space-y-2">
                            <Label htmlFor="municipio" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              🏛️ Municipio
                            </Label>
                            <Select
                              value={filtros.municipio}
                              onValueChange={(value) => aplicarFiltroMunicipio(value)}
                            >
                              <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm">
                                <SelectValue placeholder="Seleccionar municipio" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="todos">🌐 Todos los municipios</SelectItem>
                                {municipiosUnicos.map(municipio => (
                                  <SelectItem key={municipio} value={municipio}>
                                    📍 {municipio}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Filtro por Evaluación Mínima */}
                          <div className="space-y-2">
                            <Label htmlFor="evalMin" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              📊 Evaluación Mínima (%)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={filtros.evaluacionMin}
                              onChange={(e) => actualizarFiltro('evaluacionMin', Number(e.target.value))}
                              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm"
                              placeholder="0"
                            />
                          </div>

                          {/* Filtro por Evaluación Máxima */}
                          <div className="space-y-2">
                            <Label htmlFor="evalMax" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              📈 Evaluación Máxima (%)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={filtros.evaluacionMax}
                              onChange={(e) => actualizarFiltro('evaluacionMax', Number(e.target.value))}
                              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm"
                              placeholder="100"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                          <Button 
                            variant="outline" 
                            onClick={resetearFiltros}
                            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Resetear Filtros
                          </Button>
                          
                          <div className="flex gap-2 sm:ml-auto">
                            <Input
                              placeholder="💾 Nombre de la vista personalizada..."
                              value={nombreVistaPersonalizada}
                              onChange={(e) => setNombreVistaPersonalizada(e.target.value)}
                              className="w-full sm:w-64 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                            />
                            <Button 
                              onClick={manejarGuardarVista}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Guardar Vista
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Resultados de Filtros */}
                  {(filtros.trimestre !== 'todos' || filtros.municipio !== 'todos' || 
                    filtros.evaluacionMin > 0 || filtros.evaluacionMax < 100) && (
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-900 border-blue-200 dark:border-blue-700">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                              Datos Filtrados
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              Mostrando {diagnosticosFiltrados.length} de {diagnosticos.length} diagnósticos
                            </p>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                {estadisticasFiltradas.total}
                              </div>
                              <div className="text-xs text-blue-700 dark:text-blue-300">Total</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-green-600">
                                {estadisticasFiltradas.completados}
                              </div>
                              <div className="text-xs text-blue-700 dark:text-blue-300">Completados</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-amber-600">
                                {estadisticasFiltradas.enProceso}
                              </div>
                              <div className="text-xs text-blue-700 dark:text-blue-300">En Proceso</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-orange-600">
                                {estadisticasFiltradas.promedioGeneral.toFixed(1)}%
                              </div>
                              <div className="text-xs text-blue-700 dark:text-blue-300">Promedio</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Sección de Informes y Reportes */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    
                    {/* Exportar a Excel */}
                    <Card className="bg-gradient-to-br from-emerald-50 via-green-100 to-emerald-200 dark:from-emerald-950 dark:via-green-900 dark:to-emerald-800 border-emerald-200 dark:border-emerald-700 shadow-xl overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-green-300/20 rounded-full blur-3xl -z-10"></div>
                      <CardHeader className="pb-4 relative z-10">
                        <CardTitle className="flex items-center gap-4 text-emerald-800 dark:text-emerald-200">
                          <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                            <Download className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">Exportación a Excel</h3>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-normal">
                              Reportes avanzados multipágina
                            </p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 relative z-10">
                        <div className="bg-white/70 dark:bg-emerald-900/30 backdrop-blur-sm rounded-lg p-4 border border-emerald-200/50">
                          <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
                            Genera archivos Excel profesionales con múltiples hojas:<br/>
                            • Resumen ejecutivo con métricas clave<br/>
                            • Análisis detallado por municipios<br/>
                            • Tendencias y distribuciones<br/>
                            • Datos completos ({diagnosticosFiltrados.length} registros)
                          </p>
                        </div>
                        <div className="space-y-3">
                          <Button 
                            className="w-full bg-gradient-to-r from-emerald-600 to-green-700 text-white font-semibold py-3 shadow-lg"
                            onClick={() => manejarExportacionExcel('todos')}
                            disabled={procesandoExportacion}
                          >
                            {procesandoExportacion ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Generando Excel...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Exportar Reporte Completo
                              </div>
                            )}
                          </Button>
                          <Button 
                            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-3 shadow-lg"
                            onClick={() => manejarExportacionExcel('completados')}
                            disabled={procesandoExportacion}
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Solo Completados ({estadisticasFiltradas.completados})
                            </div>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Imprimir Reportes */}
                    <Card className="bg-gradient-to-br from-blue-50 via-indigo-100 to-blue-200 dark:from-blue-950 dark:via-indigo-900 dark:to-blue-800 border-blue-200 dark:border-blue-700 shadow-xl overflow-hidden relative">
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-200/30 to-indigo-300/20 rounded-full blur-3xl -z-10"></div>
                      <CardHeader className="pb-4 relative z-10">
                        <CardTitle className="flex items-center gap-4 text-blue-800 dark:text-blue-200">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                            <Printer className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">Reportes PDF</h3>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-normal">
                              Documentos corporativos profesionales
                            </p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 relative z-10">
                        <div className="bg-white/70 dark:bg-blue-900/30 backdrop-blur-sm rounded-lg p-4 border border-blue-200/50">
                          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                            Genera reportes PDF con diseño corporativo:<br/>
                            • Encabezados con branding institucional<br/>
                            • Métricas visuales con códigos de color<br/>
                            • Análisis detallado por municipios<br/>
                            • Recomendaciones estratégicas
                          </p>
                        </div>
                        <div className="space-y-3">
                          <Button 
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold py-3 shadow-lg"
                            onClick={() => manejarGeneracionPDF('ejecutivo')}
                            disabled={procesandoExportacion}
                          >
                            {procesandoExportacion ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Generando PDF...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Reporte Ejecutivo
                              </div>
                            )}
                          </Button>
                          <Button 
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 shadow-lg"
                            onClick={() => manejarGeneracionPDF('detallado')}
                            disabled={procesandoExportacion}
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Reporte Detallado
                            </div>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Filtros Temporales */}
                    <Card className="bg-gradient-to-br from-purple-50 via-violet-100 to-purple-200 dark:from-purple-950 dark:via-violet-900 dark:to-purple-800 border-purple-200 dark:border-purple-700 shadow-xl overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-violet-300/20 rounded-full blur-3xl -z-10"></div>
                      <CardHeader className="pb-4 relative z-10">
                        <CardTitle className="flex items-center gap-4 text-purple-800 dark:text-purple-200">
                          <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
                            <Calendar className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">Análisis Temporal</h3>
                            <p className="text-sm text-purple-600 dark:text-purple-400 font-normal">
                              Filtros por períodos específicos
                            </p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 relative z-10">
                        <div className="bg-white/70 dark:bg-purple-900/30 backdrop-blur-sm rounded-lg p-4 border border-purple-200/50">
                          <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                            Analiza tendencias por períodos:<br/>
                            • Filtros por trimestres automáticos<br/>
                            • Comparativas temporales<br/>
                            • Evolución de métricas<br/>
                            • Identificación de patrones estacionales
                          </p>
                        </div>
                        <div className="space-y-3">
                          <Button 
                            className={`w-full font-semibold py-3 shadow-lg ${
                              filtros.trimestre === 'Q1' 
                                ? 'bg-gradient-to-r from-purple-700 to-violet-800 text-white' 
                                : 'bg-gradient-to-r from-purple-600 to-violet-700 text-white'
                            }`}
                            onClick={() => aplicarFiltroTrimestre('Q1')}
                          >
                            <div className="flex items-center gap-2">
                              Q1 2025 (Ene-Mar) {filtros.trimestre === 'Q1' && '✓'}
                            </div>
                          </Button>
                          <Button 
                            className={`w-full font-semibold py-3 shadow-lg ${
                              filtros.trimestre === 'Q2' 
                                ? 'bg-gradient-to-r from-purple-700 to-violet-800 text-white' 
                                : 'bg-gradient-to-r from-purple-500 to-violet-600 text-white'
                            }`}
                            onClick={() => aplicarFiltroTrimestre('Q2')}
                          >
                            <div className="flex items-center gap-2">
                              Q2 2025 (Abr-Jun) {filtros.trimestre === 'Q2' && '✓'}
                            </div>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Análisis Avanzado */}
                    <Card className="bg-gradient-to-br from-amber-50 via-orange-100 to-amber-200 dark:from-amber-950 dark:via-orange-900 dark:to-amber-800 border-amber-200 dark:border-amber-700 shadow-xl overflow-hidden relative">
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-200/30 to-orange-300/20 rounded-full blur-3xl -z-10"></div>
                      <CardHeader className="pb-4 relative z-10">
                        <CardTitle className="flex items-center gap-4 text-amber-800 dark:text-amber-200">
                          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                            <BarChart3 className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">Análisis Avanzado</h3>
                            <p className="text-sm text-amber-600 dark:text-amber-400 font-normal">
                              Inteligencia de datos predictiva
                            </p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 relative z-10">
                        <div className="bg-white/70 dark:bg-amber-900/30 backdrop-blur-sm rounded-lg p-4 border border-amber-200/50">
                          <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                            Análisis inteligente de patrones:<br/>
                            • Tendencias históricas automáticas<br/>
                            • Ranking de desempeño municipal<br/>
                            • Identificación de oportunidades<br/>
                            • Predicciones de completitud
                          </p>
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {tendencias.length > 0 && (
                              <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg border border-amber-200">
                                <span className="font-semibold text-amber-800 dark:text-amber-200">Tendencias</span>
                                <div className="text-amber-600 dark:text-amber-400">
                                  {tendencias.length} períodos analizados
                                </div>
                              </div>
                            )}
                            {comparativas.length > 0 && (
                              <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg border border-amber-200">
                                <span className="font-semibold text-amber-800 dark:text-amber-200">Líder</span>
                                <div className="text-amber-600 dark:text-amber-400 truncate">
                                  {comparativas[0]?.municipio}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Filtros Personalizados */}
                    <Card className="bg-gradient-to-br from-rose-50 via-pink-100 to-rose-200 dark:from-rose-950 dark:via-pink-900 dark:to-rose-800 border-rose-200 dark:border-rose-700 shadow-xl overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/30 to-pink-300/20 rounded-full blur-3xl -z-10"></div>
                      <CardHeader className="pb-4 relative z-10">
                        <CardTitle className="flex items-center gap-4 text-rose-800 dark:text-rose-200">
                          <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg">
                            <Filter className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">Filtros Inteligentes</h3>
                            <p className="text-sm text-rose-600 dark:text-rose-400 font-normal">
                              Segmentación estratégica
                            </p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 relative z-10">
                        <div className="bg-white/70 dark:bg-rose-900/30 backdrop-blur-sm rounded-lg p-4 border border-rose-200/50">
                          <p className="text-sm text-rose-700 dark:text-rose-300 leading-relaxed">
                            Filtros preconfigurados estratégicos:<br/>
                            • Alto desempeño (80-100%)<br/>
                            • Necesidad de atención (0-30%)<br/>
                            • Filtros dinámicos por criterios<br/>
                            • Segmentación automática
                          </p>
                        </div>
                        <div className="space-y-3">
                          <Button 
                            className="w-full bg-gradient-to-r from-rose-600 to-pink-700 text-white font-semibold py-3 shadow-lg"
                            onClick={() => aplicarFiltroEvaluacion(80, 100)}
                          >
                            <div className="flex items-center gap-2">
                              Alto Desempeño (80-100%)
                            </div>
                          </Button>
                          <Button 
                            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold py-3 shadow-lg"
                            onClick={() => aplicarFiltroEvaluacion(0, 30)}
                          >
                            <div className="flex items-center gap-2">
                              Requiere Atención (0-30%)
                            </div>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Dashboard Personalizado */}
                    <Card className="bg-gradient-to-br from-teal-50 via-cyan-100 to-teal-200 dark:from-teal-950 dark:via-cyan-900 dark:to-teal-800 border-teal-200 dark:border-teal-700 shadow-xl overflow-hidden relative">
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-200/30 to-cyan-300/20 rounded-full blur-3xl -z-10"></div>
                      <CardHeader className="pb-4 relative z-10">
                        <CardTitle className="flex items-center gap-4 text-teal-800 dark:text-teal-200">
                          <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                            <Eye className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">Vistas Personalizadas</h3>
                            <p className="text-sm text-teal-600 dark:text-teal-400 font-normal">
                              Configuraciones guardadas
                            </p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 relative z-10">
                        <div className="bg-white/70 dark:bg-teal-900/30 backdrop-blur-sm rounded-lg p-4 border border-teal-200/50">
                          <p className="text-sm text-teal-700 dark:text-teal-300 leading-relaxed">
                            Gestión de configuraciones personalizadas:<br/>
                            • Guarda filtros frecuentes<br/>
                            • Restaura vistas rápidamente<br/>
                            • Comparte configuraciones<br/>
                            • Historial de análisis
                          </p>
                        </div>
                        <div className="space-y-3">
                          {obtenerVistasGuardadas().length > 0 ? (
                            obtenerVistasGuardadas().slice(0, 2).map((vista: any, index: number) => (
                              <Button 
                                key={index}
                                className="w-full bg-gradient-to-r from-teal-600 to-cyan-700 text-white font-semibold py-3 shadow-lg"
                                onClick={() => cargarVistaPersonalizada(vista)}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="truncate">{vista.nombre}</span>
                                </div>
                              </Button>
                            ))
                          ) : (
                            <div className="text-center py-6">
                              <div className="text-sm text-teal-600 dark:text-teal-400 leading-relaxed">
                                No hay vistas guardadas<br/>
                                <span className="text-xs">Configura filtros y guarda tu primera vista arriba</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                  </div>

                  {/* Estadísticas Profesionales para Informes */}
                  <Card className="bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600 shadow-xl backdrop-blur-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full blur-3xl -z-10"></div>
                    <CardHeader className="border-b border-slate-200 dark:border-slate-600 relative z-10">
                      <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                        <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg shadow-lg">
                          <PieChart className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">Dashboard de Métricas Filtradas</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">
                            Indicadores clave de rendimiento en tiempo real
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 relative z-10">
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Total Filtrados */}
                        <div className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200 dark:border-blue-700 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                                <FileText className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Total Filtrados</span>
                            </div>
                            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                              {diagnosticosFiltrados.length}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              de {diagnosticos.length} registros totales
                            </div>
                            <div className="mt-2 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(diagnosticosFiltrados.length / diagnosticos.length) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Completados */}
                        <div className="group bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/50 dark:to-green-800/50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-200 dark:border-emerald-700 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-emerald-500 rounded-lg shadow-md">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Completados</span>
                            </div>
                            <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">
                              {estadisticasFiltradas.completados}
                            </div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400">
                              {estadisticasFiltradas.total > 0 ? ((estadisticasFiltradas.completados / estadisticasFiltradas.total) * 100).toFixed(1) : 0}% de completitud
                            </div>
                            <div className="mt-2 w-full bg-emerald-200 dark:bg-emerald-800 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${estadisticasFiltradas.total > 0 ? (estadisticasFiltradas.completados / estadisticasFiltradas.total) * 100 : 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* En Proceso */}
                        <div className="group bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-800/50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-200 dark:border-amber-700 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-amber-500 rounded-lg shadow-md">
                                <Clock className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">En Proceso</span>
                            </div>
                            <div className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-2">
                              {estadisticasFiltradas.enProceso}
                            </div>
                            <div className="text-xs text-amber-600 dark:text-amber-400">
                              {estadisticasFiltradas.total > 0 ? ((estadisticasFiltradas.enProceso / estadisticasFiltradas.total) * 100).toFixed(1) : 0}% en desarrollo
                            </div>
                            <div className="mt-2 w-full bg-amber-200 dark:bg-amber-800 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-amber-500 to-yellow-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${estadisticasFiltradas.total > 0 ? (estadisticasFiltradas.enProceso / estadisticasFiltradas.total) * 100 : 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Pendientes */}
                        <div className="group bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/50 dark:to-rose-800/50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-red-200 dark:border-red-700 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-red-500 rounded-lg shadow-md">
                                <AlertTriangle className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-sm font-semibold text-red-700 dark:text-red-300">Pendientes</span>
                            </div>
                            <div className="text-3xl font-bold text-red-900 dark:text-red-100 mb-2">
                              {estadisticasFiltradas.pendientes}
                            </div>
                            <div className="text-xs text-red-600 dark:text-red-400">
                              {estadisticasFiltradas.total > 0 ? ((estadisticasFiltradas.pendientes / estadisticasFiltradas.total) * 100).toFixed(1) : 0}% sin iniciar
                            </div>
                            <div className="mt-2 w-full bg-red-200 dark:bg-red-800 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-red-500 to-rose-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${estadisticasFiltradas.total > 0 ? (estadisticasFiltradas.pendientes / estadisticasFiltradas.total) * 100 : 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Métricas Adicionales */}
                      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-600">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Promedio General</div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                              {estadisticasFiltradas.promedioGeneral.toFixed(1)}%
                            </div>
                          </div>
                          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Municipios Activos</div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                              {new Set(diagnosticosFiltrados.map(d => d.municipio)).size}
                            </div>
                          </div>
                          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Filtros Activos</div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                              {(filtros.trimestre !== 'todos' ? 1 : 0) + 
                               (filtros.municipio !== 'todos' ? 1 : 0) + 
                               (filtros.evaluacionMin > 0 || filtros.evaluacionMax < 100 ? 1 : 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </main>
  )
}

export default function DiagnosticosMunicipiosPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <DiagnosticosMunicipiosContent />
    </Suspense>
  )
}