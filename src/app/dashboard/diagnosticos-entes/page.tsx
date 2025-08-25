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
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Users,
  Trash2,
  Plus,
  Building2,
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
  Activity
} from "lucide-react"
import { showError, showSuccess, showConfirm } from "@/lib/notifications"
import { useDiagnosticosEntes } from "@/hooks/use-diagnosticos-entes"
import { useDiagnosticosMunicipales } from "@/hooks/use-diagnosticos-municipales"
import { useAuth } from "@/contexts/auth-context"
import { useInformesEntes } from "@/hooks/use-informes-entes"
import { TableroDiagnosticosEntes } from "@/components/tablero-diagnosticos-entes"
import { EstadisticasEntes } from "@/components/estadisticas-entes"

// Componente específico para estadísticas de la página diagnosticos-entes
function EstadisticasEntesEspecificas() {
  const [stats, setStats] = useState<{
    total: number
    estatales: number
    municipales: number
  }>({
    total: 0,
    estatales: 0,
    municipales: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Obtener datos de diagnósticos estatales (diagnosticos-entes)
        const responseEstatales = await fetch('/api/diagnosticos-entes')
        const dataEstatales = await responseEstatales.json()
        
        // Obtener datos de diagnósticos municipales (diagnosticos) 
        const responseMunicipales = await fetch('/api/diagnosticos')
        const dataMunicipales = await responseMunicipales.json()
        
        // Contar entes únicos por tipo
        const entesEstatales = new Set()
        const entesMunicipales = new Set()
        
        // Procesar diagnósticos estatales - extraer array de datos correctamente
        const diagnosticosEstatales = dataEstatales.data || (Array.isArray(dataEstatales) ? dataEstatales : [])
        if (Array.isArray(diagnosticosEstatales)) {
          diagnosticosEstatales.forEach((diag: any) => {
            if (diag.entePublico) {
              entesEstatales.add(diag.entePublico)
            }
          })
        }
        
        // Procesar diagnósticos municipales - extraer array de datos correctamente  
        const diagnosticosMunicipales = dataMunicipales.data || (Array.isArray(dataMunicipales) ? dataMunicipales : [])
        if (Array.isArray(diagnosticosMunicipales)) {
          diagnosticosMunicipales.forEach((diag: any) => {
            if (diag.municipio) {
              entesMunicipales.add(diag.municipio)
            }
          })
        }
        
        const estatalesCount = entesEstatales.size
        const municipalesCount = entesMunicipales.size
        const total = estatalesCount + municipalesCount
        
        setStats({
          total,
          estatales: estatalesCount,
          municipales: municipalesCount
        })
      } catch (error) {
        console.error('Error loading statistics:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-4 md:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Cargando...</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const AMBITO_COLORS = {
    'Estatal': '#F29888',
    'Municipal': '#B25FAC'
  }

  return (
    <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total de Entes */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-4 md:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
            <div 
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: '#3B82F6' }}
            ></div>
            <span className="truncate">Total de Entes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600">
            {stats.total}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Total de entes con diagnósticos
          </p>
        </CardContent>
      </Card>

      {/* Entes Estatales */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-4 md:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
            <div 
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: AMBITO_COLORS['Estatal'] }}
            ></div>
            <span className="truncate">Entes Estatales</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold" style={{ color: AMBITO_COLORS['Estatal'] }}>
            {stats.estatales}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Diagnósticos de entes públicos capturados
          </p>
        </CardContent>
      </Card>

      {/* Entes Municipales */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-4 md:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
            <div 
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: AMBITO_COLORS['Municipal'] }}
            ></div>
            <span className="truncate">Entes Municipales</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold" style={{ color: AMBITO_COLORS['Municipal'] }}>
            {stats.municipales}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Diagnósticos municipales capturados
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function DiagnosticosEntesContent() {
  const { user } = useAuth()
  const { 
    diagnosticos, 
    loading, 
    error, 
    fetchDiagnosticos 
  } = useDiagnosticosEntes()

  // Hook para diagnósticos municipales (para datos unificados)
  const { 
    diagnosticos: diagnosticosMunicipales,
    loading: loadingMunicipales 
  } = useDiagnosticosMunicipales()
  
  // Verificar si el usuario puede editar
  const canEdit = user?.rol !== 'INVITADO'
  
  // Hook para manejo de informes y filtros
  const {
    diagnosticosFiltrados,
    filtros,
    aplicarFiltroTrimestre,
    aplicarFiltroEntePublico,
    aplicarFiltroEvaluacion,
    resetearFiltros,
    actualizarFiltro,
    guardarVistaPersonalizada,
    cargarVistaPersonalizada,
    obtenerVistasGuardadas,
    formatearPeriodo
  } = useInformesEntes(diagnosticos || [])
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeView, setActiveView] = useState('resumen')
  
  // Estados para evitar errores de hidratación
  const [isClient, setIsClient] = useState(false)
  const [entesUnicosCount, setEntesUnicosCount] = useState(0)
  const [diagnosticosCompletados, setDiagnosticosCompletados] = useState(0)
  const [promedioGeneralUnificado, setPromedioGeneralUnificado] = useState(0)
  const [promedioGlobalUnificado, setPromedioGlobalUnificado] = useState(0)
  const [datosUnificadosEntes, setDatosUnificadosEntes] = useState<any[]>([])
  const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState<string>('')
  const [diagnosticosDisponibles, setDiagnosticosDisponibles] = useState<any[]>([])
  const [datosPorDiagnostico, setDatosPorDiagnostico] = useState<any[]>([])
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false)
  const [nombreVistaPersonalizada, setNombreVistaPersonalizada] = useState('')
  const [procesandoExportacion, setProcesandoExportacion] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<number>(0)

  // Detectar hidratación del cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Calcular métricas después del montaje para evitar hidratación
  useEffect(() => {
    if (isClient && diagnosticos && Array.isArray(diagnosticos)) {
      setEntesUnicosCount(new Set(diagnosticos.map(d => d.entePublico)).size)
      setDiagnosticosCompletados(diagnosticos.filter(d => d.evaluacion === 100).length)
      
      // Calcular promedio general
      if (diagnosticos.length > 0) {
        const sumaEvaluaciones = diagnosticos.reduce((sum, d) => sum + d.evaluacion, 0)
        setPromedioGeneralUnificado(sumaEvaluaciones / diagnosticos.length)
      } else {
        setPromedioGeneralUnificado(0)
      }
    }
  }, [isClient, diagnosticos])

  // Función para obtener promedio global unificado (promedio de entes + municipales)
  const obtenerPromedioGlobalUnificado = async () => {
    try {
      // Obtener diagnósticos municipales
      const resDiagnosticosMunicipales = await fetch('/api/diagnosticos')
      const diagnosticosMunicipales = await resDiagnosticosMunicipales.json()
      
      // Calcular promedios individuales en porcentajes
      let promedioEntes = 0
      let promedioMunicipales = 0
      
      if (diagnosticos && diagnosticos.length > 0) {
        const sumaEntes = diagnosticos.reduce((sum: number, d: any) => sum + d.evaluacion, 0)
        promedioEntes = sumaEntes / diagnosticos.length
      }
      
      if (diagnosticosMunicipales && diagnosticosMunicipales.length > 0) {
        const sumaMunicipales = diagnosticosMunicipales.reduce((sum: number, d: any) => sum + d.evaluacion, 0)
        promedioMunicipales = sumaMunicipales / diagnosticosMunicipales.length
      }
      
      // Promedio de ambos promedios (no suma)
      const promedioUnificado = (promedioEntes + promedioMunicipales) / 2
      setPromedioGlobalUnificado(promedioUnificado)
      
    } catch (error) {
      console.error('Error al obtener promedio global unificado:', error)
      setPromedioGlobalUnificado(0)
    }
  }

  // Función para obtener datos unificados de entes (combinando diagnósticos entes y municipales)
  const obtenerDatosUnificadosEntes = async () => {
    try {
      // Obtener diagnósticos municipales
      const resDiagnosticosMunicipales = await fetch('/api/diagnosticos')
      const diagnosticosMunicipales = await resDiagnosticosMunicipales.json()
      
      // Obtener información de entes
      const resEntes = await fetch('/api/entes')
      const entes = await resEntes.json()
      
      // Obtener lista única de diagnósticos disponibles
      const diagnosticosUnicos: any = {}
      
      // Agregar diagnósticos de entes
      if (diagnosticos && Array.isArray(diagnosticos)) {
        diagnosticos.forEach((diag: any) => {
          if (diag.nombreActividad && diag.actividad) {
            const key = `${diag.nombreActividad} - ${diag.actividad}`
            diagnosticosUnicos[key] = {
              nombre: diag.nombreActividad,
              actividad: diag.actividad,
              descripcion: key, // Usar la misma clave para consistencia
              id: diag.id
            }
          }
        })
      }
      
      // Agregar diagnósticos municipales
      if (diagnosticosMunicipales && Array.isArray(diagnosticosMunicipales)) {
        diagnosticosMunicipales.forEach((diag: any) => {
          if (diag.nombreActividad && diag.actividad) {
            const key = `${diag.nombreActividad} - ${diag.actividad}`
            if (!diagnosticosUnicos[key]) {
              diagnosticosUnicos[key] = {
                nombre: diag.nombreActividad,
                actividad: diag.actividad,
                descripcion: key, // Usar la misma clave para consistencia
                id: diag.id
              }
            }
          }
        })
      }
      
      // Ordenar alfabéticamente por nombre antes de establecer en el estado
      const diagnosticosOrdenados = Object.values(diagnosticosUnicos).sort((a: any, b: any) => 
        a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
      )
      
      setDiagnosticosDisponibles(diagnosticosOrdenados)
      
      // Si hay diagnóstico seleccionado, obtener datos específicos
      if (diagnosticoSeleccionado) {
        obtenerDatosPorDiagnostico(diagnosticoSeleccionado)
      }
      
    } catch (error) {
      console.error('Error al obtener datos unificados de entes:', error)
      setDatosUnificadosEntes([])
      setDiagnosticosDisponibles([])
    }
  }

  // Función para obtener datos por diagnóstico específico
  const obtenerDatosPorDiagnostico = async (diagnosticoNombre: string) => {
    try {
      console.log('🔍 Filtrando diagnóstico:', diagnosticoNombre);
      
      // Obtener diagnósticos municipales
      const resDiagnosticosMunicipales = await fetch('/api/diagnosticos')
      const diagnosticosMunicipales = await resDiagnosticosMunicipales.json()
      
      // Obtener información de entes
      const resEntes = await fetch('/api/entes')
      const entes = await resEntes.json()
      
      // Filtrar por el diagnóstico seleccionado
      const entesConDiagnostico: any[] = []
      
      // Buscar en diagnósticos de entes
      if (diagnosticos && Array.isArray(diagnosticos)) {
        diagnosticos.forEach((diag: any) => {
          const nombreCompleto = `${diag.nombreActividad} - ${diag.actividad}`
          console.log('Comparando:', { nombreCompleto, diagnosticoNombre });
          
          if (nombreCompleto === diagnosticoNombre) {
            const enteInfo = entes.find((e: any) => e.nombre === diag.entePublico)
            entesConDiagnostico.push({
              nombre: diag.entePublico || 'Sin especificar',
              evaluacion: diag.evaluacion,
              estado: diag.evaluacion === 100 ? 'Completo' : diag.evaluacion > 0 ? 'En Proceso' : 'Pendiente',
              fuente: 'Diagnósticos Entes',
              tipoPoder: diag.poder || 'Sin clasificar',
              organo: diag.organo || 'Sin órgano',
              tipoEnte: 'Estatal',
              municipio: enteInfo?.municipio || 'No aplica',
              fechaCreacion: diag.fechaCreacion,
              fechaUltimaModificacion: diag.fechaUltimaModificacion
            })
            console.log('✅ Encontrado en entes:', diag.entePublico);
          }
        })
      }
      
      // Buscar en diagnósticos municipales
      if (diagnosticosMunicipales && Array.isArray(diagnosticosMunicipales)) {
        diagnosticosMunicipales.forEach((diag: any) => {
          const nombreCompleto = `${diag.nombreActividad} - ${diag.actividad}`
          console.log('Comparando municipal:', { nombreCompleto, diagnosticoNombre });
          
          if (nombreCompleto === diagnosticoNombre) {
            entesConDiagnostico.push({
              nombre: diag.municipio || 'Sin especificar',
              evaluacion: diag.evaluacion,
              estado: diag.evaluacion === 100 ? 'Completo' : diag.evaluacion > 0 ? 'En Proceso' : 'Pendiente',
              fuente: 'Diagnósticos Municipales',
              tipoPoder: diag.poder || 'Sin clasificar',
              organo: diag.organo || 'Sin órgano',
              tipoEnte: 'Municipal',
              municipio: diag.municipio || 'Sin especificar',
              fechaCreacion: diag.fechaCreacion,
              fechaUltimaModificacion: diag.fechaUltimaModificacion
            })
            console.log('✅ Encontrado en municipales:', diag.municipio);
          }
        })
      }
      
      console.log(`📊 Total encontrados: ${entesConDiagnostico.length} entes`);
      
      // Ordenar por evaluación descendente
      entesConDiagnostico.sort((a, b) => b.evaluacion - a.evaluacion)
      
      setDatosPorDiagnostico(entesConDiagnostico)
      
    } catch (error) {
      console.error('Error al obtener datos por diagnóstico:', error)
      setDatosPorDiagnostico([])
    }
  }

  // Calcular promedio global unificado cuando se cargan los datos
  useEffect(() => {
    if (isClient && diagnosticos) {
      obtenerPromedioGlobalUnificado()
      obtenerDatosUnificadosEntes()
    }
  }, [isClient, diagnosticos])

  // Efecto para cargar datos por diagnóstico cuando se selecciona uno
  useEffect(() => {
    if (diagnosticoSeleccionado) {
      obtenerDatosPorDiagnostico(diagnosticoSeleccionado)
    }
  }, [diagnosticoSeleccionado])

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
      const now = Date.now()
      // Refrescar siempre que se acceda con view=tablero, pero no más de una vez cada 5 segundos
      if (viewFromUrl === 'tablero' && !loading && (now - lastRefresh > 5000)) {
        console.log('🔄 Refrescando diagnósticos de entes al regresar a la plataforma...')
        setLastRefresh(now)
        // Pequeño delay para asegurar que la eliminación se completó
        const timeoutId = setTimeout(() => {
          fetchDiagnosticos()
        }, 100)
        
        return () => clearTimeout(timeoutId)
      }
    }
  }, [isClient, searchParams, loading, lastRefresh, fetchDiagnosticos])

  // Función para cambiar de vista y actualizar la URL
  const changeView = (newView: string) => {
    setActiveView(newView)
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', newView)
    router.push(`/dashboard/diagnosticos-entes?${params.toString()}`)
  }

  // Funciones para exportación (simuladas para diagnósticos de entes)
  const manejarExportacionExcel = async (tipo: 'todos' | 'completados') => {
    setProcesandoExportacion(true)
    try {
      // Simular proceso de exportación
      await new Promise(resolve => setTimeout(resolve, 2000))
      await showSuccess('¡Exportación exitosa!', `Archivo Excel generado con ${diagnosticosFiltrados.length} registros`)
    } catch (error) {
      await showError('Error al exportar', 'Error al exportar los diagnósticos')
    }
    setProcesandoExportacion(false)
  }

  const manejarGeneracionPDF = async (tipo: 'ejecutivo' | 'detallado') => {
    setProcesandoExportacion(true)
    try {
      // Simular proceso de generación PDF
      await new Promise(resolve => setTimeout(resolve, 2000))
      await showSuccess('¡PDF generado!', `Reporte ${tipo} generado exitosamente`)
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
                Diagnósticos Entes Estatales
              </h2>
              <p className="text-muted-foreground">
                Monitorea el estado y avance de los diagnósticos por ente estatal
              </p>
            </div>
          </div>

          {/* Estadísticas principales - usando estilos de Acuerdos */}
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 dark:from-purple-950 dark:via-purple-900 dark:to-purple-800 border-purple-200 dark:border-purple-700 shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-3">
                <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Con Diagnósticos</CardTitle>
                <div className="p-1 bg-purple-500/20 rounded-full">
                  <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent className="py-1 px-3">
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{entesUnicosCount}</div>
                <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                  entes capturados
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
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{diagnosticos.length}</div>
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
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {(diagnosticos && Array.isArray(diagnosticos)) ? diagnosticos.filter(d => d.evaluacion > 0 && d.evaluacion < 100).length : 0}
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Con avance parcial
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
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {(diagnosticos && Array.isArray(diagnosticos)) ? diagnosticos.filter(d => d.evaluacion === 0).length : 0}
                </div>
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
                      Listado completo de diagnósticos
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
                  {/* Funciones para calcular estadísticas reales */}
                  {(() => {
                    // Calcular estadísticas basadas en datos reales
                    const totalDiagnosticos = diagnosticosFiltrados.length
                    const completados = diagnosticosFiltrados.filter(d => d.evaluacion === 100).length
                    const enProceso = diagnosticosFiltrados.filter(d => d.evaluacion > 0 && d.evaluacion < 100).length
                    const pendientes = diagnosticosFiltrados.filter(d => d.evaluacion === 0).length
                    
                    // Estadísticas de acciones
                    const totalAcciones = diagnosticosFiltrados.reduce((total, d) => total + (d.acciones?.length || 0), 0)
                    const accionesCompletadas = diagnosticosFiltrados.reduce((total, d) => 
                      total + (d.acciones?.filter((a: any) => a.completada)?.length || 0), 0)
                    
                    // Estadísticas por ente público
                    const estadisticasPorPoder = diagnosticosFiltrados.reduce((acc: any, d) => {
                      const poder = d.entePublico || 'Sin especificar'
                      if (!acc[poder]) {
                        acc[poder] = { total: 0, completados: 0, promedio: 0 }
                      }
                      acc[poder].total++
                      if (d.evaluacion === 100) acc[poder].completados++
                      acc[poder].promedio += d.evaluacion
                      return acc
                    }, {})
                    
                    // Calcular promedios por poder
                    Object.keys(estadisticasPorPoder).forEach(poder => {
                      estadisticasPorPoder[poder].promedio = 
                        estadisticasPorPoder[poder].promedio / estadisticasPorPoder[poder].total
                    })
                    
                    // Promedio general de evaluaciones
                    const promedioGeneral = totalDiagnosticos > 0 ? 
                      diagnosticosFiltrados.reduce((sum, d) => sum + d.evaluacion, 0) / totalDiagnosticos : 0
                    
                    return null // No renderizar nada aquí, solo calcular
                  })()}

                  {/* Gráficos de estadísticas - usando datos reales */}
              {canEdit && (
                <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2">
                  {/* Gráfico de Progreso Global Unificado - usando datos reales */}
                  <Card className="bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 via-indigo-200/20 to-purple-200/20 dark:from-blue-800/10 dark:via-indigo-800/10 dark:to-purple-800/10 rounded-full blur-3xl -z-10"></div>
                  <CardHeader className="relative z-10 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100 text-base">
                        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                          <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-bold">
                          Progreso Global Unificado
                        </span>
                      </CardTitle>
                    </div>
                    
                    {/* Descripción */}
                    <div className="mt-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Promedio unificado de diagnósticos entes y municipales
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-2">
                    <div className="flex items-center gap-6">
                      {/* Gráfica extra grande */}
                      <div className="flex-1 flex items-center justify-center">
                        <div className="relative w-40 h-40">
                          <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              stroke="currentColor"
                              strokeWidth="10"
                              fill="transparent"
                              className="text-gray-200"
                            />
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              stroke="url(#gradient1)"
                              strokeWidth="10"
                              fill="transparent"
                              strokeDasharray={`${(promedioGlobalUnificado / 100) * 439.82} 439.82`}
                            />
                            <defs>
                              <linearGradient id="gradient1">
                                <stop offset="0%" stopColor="#3B82F6" />
                                <stop offset="100%" stopColor="#8B5CF6" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {promedioGlobalUnificado.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Valores en columna lateral */}
                      <div className="flex flex-col space-y-3 min-w-[120px]">
                        <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Promedio Entes</span>
                          <span className="text-xl font-bold text-blue-700 dark:text-blue-300">{promedioGeneralUnificado.toFixed(1)}%</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Promedio Municipal</span>
                          <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{((promedioGlobalUnificado * 2) - promedioGeneralUnificado).toFixed(1)}%</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Promedio Unificado</span>
                          <span className="text-xl font-bold text-purple-700 dark:text-purple-300">{promedioGlobalUnificado.toFixed(1)}%</span>
                        </div>
                        
                        {/* Información adicional */}
                        <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="text-xs text-slate-600 dark:text-slate-400 text-center">
                            <div className="font-medium">Eficiencia Global</div>
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{promedioGlobalUnificado.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card de Estadísticas de Acciones */}
                <Card className="bg-gradient-to-br from-white via-slate-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-indigo-200/20 via-blue-200/20 to-cyan-200/20 dark:from-indigo-800/10 dark:via-blue-800/10 dark:to-cyan-800/10 rounded-full blur-3xl -z-10"></div>
                  <CardHeader className="relative z-10 pb-2">
                    <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100 text-base">
                      <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg shadow-lg">
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-700 dark:from-indigo-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent font-bold">
                        Acciones de Seguimiento
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-2">
                    <div className="space-y-3">
                      {(() => {
                        // Combinar datos de entes y municipales para estadísticas unificadas
                        const diagnosticosUnificados = [
                          ...(diagnosticosFiltrados || []),
                          ...(diagnosticosMunicipales || [])
                        ]
                        
                        const totalAcciones = diagnosticosUnificados.reduce((total, d) => total + (d.acciones?.length || 0), 0)
                        const accionesCompletadas = diagnosticosUnificados.reduce((total, d) => 
                          total + (d.acciones?.filter((a: any) => a.completada)?.length || 0), 0)
                        const accionesPendientes = totalAcciones - accionesCompletadas
                        const porcentajeCompletadas = totalAcciones > 0 ? Math.round((accionesCompletadas / totalAcciones) * 100) : 0
                        
                        // Estadísticas por tipo de acción unificadas
                        const tiposAcciones = diagnosticosUnificados.reduce((acc: any, d) => {
                          d.acciones?.forEach((a: any) => {
                            const tipo = a.descripcion || 'Sin especificar'
                            if (!acc[tipo]) acc[tipo] = { total: 0, completadas: 0 }
                            acc[tipo].total++
                            if (a.completada) acc[tipo].completadas++
                          })
                          return acc
                        }, {})
                        
                        return (
                          <>
                            {/* Métricas principales de acciones */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Acciones</div>
                                <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                  {totalAcciones}
                                </div>
                              </div>
                              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Efectividad</div>
                                <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                                  {porcentajeCompletadas}%
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="text-xs text-green-600 dark:text-green-400 font-medium">Completadas</div>
                                <div className="text-lg font-bold text-green-700 dark:text-green-300">
                                  {accionesCompletadas}
                                </div>
                              </div>
                              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">Pendientes</div>
                                <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
                                  {accionesPendientes}
                                </div>
                              </div>
                            </div>
                            
                            {/* Barra de progreso de acciones */}
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                                <span>Progreso de acciones unificadas</span>
                                <span>{totalAcciones} acciones registradas</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-indigo-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${porcentajeCompletadas}%` 
                                  }}
                                />
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
                                {accionesCompletadas} de {totalAcciones} acciones completadas (Entes + Municipales)
                              </div>
                            </div>
                            
                            {/* Top tipos de acciones */}
                            {Object.keys(tiposAcciones).length > 0 && (
                              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-600">
                                <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">Tipos más frecuentes (Unificado):</div>
                                <div className="space-y-1">
                                  {Object.entries(tiposAcciones)
                                    .sort(([,a]: any, [,b]: any) => b.total - a.total)
                                    .slice(0, 3)
                                    .map(([tipo, stats]: any) => (
                                      <div key={tipo} className="flex items-center justify-between text-xs">
                                        <span className="text-slate-700 dark:text-slate-300 truncate">{tipo}</span>
                                        <Badge variant="secondary" className="text-xs">
                                          {stats.completadas}/{stats.total}
                                        </Badge>
                                      </div>
                                    ))
                                  }
                                </div>
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Card de Métricas de Evaluación */}
                <Card className="bg-gradient-to-br from-white via-slate-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 via-green-200/20 to-teal-200/20 dark:from-emerald-800/10 dark:via-green-800/10 dark:to-teal-800/10 rounded-full blur-3xl -z-10"></div>
                  <CardHeader className="relative z-10 pb-2">
                    <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100 text-base">
                      <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-lg">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-emerald-700 via-green-700 to-teal-700 dark:from-emerald-400 dark:via-green-400 dark:to-teal-400 bg-clip-text text-transparent font-bold">
                        Métricas de Evaluación
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-2">
                    <div className="space-y-3">
                      {(() => {
                        // Combinar datos de entes y municipales para estadísticas unificadas
                        const diagnosticosUnificados = [
                          ...(diagnosticosFiltrados || []),
                          ...(diagnosticosMunicipales || [])
                        ]
                        
                        const promedioGeneral = diagnosticosUnificados.length > 0 ? 
                          diagnosticosUnificados.reduce((sum, d) => sum + d.evaluacion, 0) / diagnosticosUnificados.length : 0
                        
                        // Estadísticas por tipo de actividad unificadas
                        const estadisticasPorActividad = diagnosticosUnificados.reduce((acc: any, d) => {
                          const actividad = d.actividad || 'Sin especificar'
                          if (!acc[actividad]) {
                            acc[actividad] = { total: 0, sumaEvaluaciones: 0, promedio: 0 }
                          }
                          acc[actividad].total++
                          acc[actividad].sumaEvaluaciones += d.evaluacion
                          return acc
                        }, {})
                        
                        // Calcular promedios por actividad
                        Object.keys(estadisticasPorActividad).forEach(actividad => {
                          estadisticasPorActividad[actividad].promedio = 
                            Math.round(estadisticasPorActividad[actividad].sumaEvaluaciones / estadisticasPorActividad[actividad].total)
                        })
                        
                        // Clasificar evaluaciones por rangos (datos unificados)
                        const excelentes = diagnosticosUnificados.filter(d => d.evaluacion >= 90).length
                        const buenos = diagnosticosUnificados.filter(d => d.evaluacion >= 70 && d.evaluacion < 90).length
                        const regulares = diagnosticosUnificados.filter(d => d.evaluacion >= 50 && d.evaluacion < 70).length
                        const bajos = diagnosticosUnificados.filter(d => d.evaluacion > 0 && d.evaluacion < 50).length
                        const sinEvaluar = diagnosticosUnificados.filter(d => d.evaluacion === 0).length
                        
                        return (
                          <>
                            {/* Métrica principal */}
                            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Promedio General Unificado</div>
                              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                {promedioGeneral.toFixed(1)}%
                              </div>
                              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                Basado en {diagnosticosUnificados.length} diagnósticos (Entes + Municipales)
                              </div>
                            </div>
                            
                            {/* Distribución por rangos de calificación */}
                            <div className="space-y-2">
                              <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">Distribución por calidad (Unificado):</div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                                  <span className="text-green-700 dark:text-green-300">Excelente</span>
                                  <span className="font-bold text-green-800 dark:text-green-200">{excelentes}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                                  <span className="text-blue-700 dark:text-blue-300">Bueno</span>
                                  <span className="font-bold text-blue-800 dark:text-blue-200">{buenos}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                                  <span className="text-yellow-700 dark:text-yellow-300">Regular</span>
                                  <span className="font-bold text-yellow-800 dark:text-yellow-200">{regulares}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                  <span className="text-red-700 dark:text-red-300">Bajo</span>
                                  <span className="font-bold text-red-800 dark:text-red-200">{bajos}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Top actividades por promedio */}
                            {Object.keys(estadisticasPorActividad).length > 0 && (
                              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-600">
                                <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">Promedio por tipo (Unificado):</div>
                                <div className="space-y-1">
                                  {Object.entries(estadisticasPorActividad)
                                    .sort(([,a]: any, [,b]: any) => b.promedio - a.promedio)
                                    .slice(0, 3)
                                    .map(([actividad, stats]: any) => (
                                      <div key={actividad} className="flex items-center justify-between p-2 bg-white/60 dark:bg-slate-800/60 rounded border border-slate-200/60">
                                        <span className="text-xs text-slate-700 dark:text-slate-300 truncate">{actividad}</span>
                                        <div className="flex items-center gap-1">
                                          <Badge variant="outline" className="text-xs">
                                            {stats.total}
                                          </Badge>
                                          <Badge 
                                            variant="secondary" 
                                            className={`text-xs ${
                                              stats.promedio >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                              stats.promedio >= 70 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                              stats.promedio >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}
                                          >
                                            {stats.promedio}%
                                          </Badge>
                                        </div>
                                      </div>
                                    ))
                                  }
                                </div>
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </CardContent>
                </Card>
                </div>
              )}

              {/* Card de Distribución Unificada de Entes - Ocupa toda la fila */}
              <Card className="bg-gradient-to-br from-white via-slate-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tr from-purple-200/20 via-violet-200/20 to-fuchsia-200/20 dark:from-purple-800/10 dark:via-violet-800/10 dark:to-fuchsia-800/10 rounded-full blur-3xl -z-10"></div>
                  <CardHeader className="relative z-10 pb-4">
                    <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100 text-lg">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-lg">
                        <PieChart className="h-5 w-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-purple-700 via-violet-700 to-fuchsia-700 dark:from-purple-400 dark:via-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent font-bold">
                        Distribución Unificada por Diagnósticos
                      </span>
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      Selecciona un diagnóstico específico para ver qué entes lo tienen capturado y su progreso
                    </p>
                    
                    {/* Selector de diagnóstico */}
                    <div className="mt-4">
                      <Label htmlFor="diagnosticoSelector" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                        🔍 Seleccionar Diagnóstico:
                      </Label>
                      <Select
                        value={diagnosticoSeleccionado}
                        onValueChange={setDiagnosticoSeleccionado}
                      >
                        <SelectTrigger className="w-full bg-white/80 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600 shadow-sm min-h-[60px] px-4 py-3">
                          <SelectValue placeholder="Elige un diagnóstico para analizar..." className="text-left">
                            {diagnosticoSeleccionado && (
                              <div className="flex flex-col gap-1 text-left w-full">
                                <span className="font-medium text-sm leading-tight truncate block" title={diagnosticosDisponibles.find(d => d.descripcion === diagnosticoSeleccionado)?.nombre}>
                                  {(() => {
                                    const nombreCompleto = diagnosticosDisponibles.find(d => d.descripcion === diagnosticoSeleccionado)?.nombre || '';
                                    return nombreCompleto.length > 60 
                                      ? `${nombreCompleto.substring(0, 60)}...` 
                                      : nombreCompleto;
                                  })()}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                  {diagnosticosDisponibles.find(d => d.descripcion === diagnosticoSeleccionado)?.actividad}
                                </span>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-80 w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
                          {diagnosticosDisponibles.map((diag: any, index: number) => (
                            <SelectItem 
                              key={index} 
                              value={diag.descripcion}
                              className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 p-3 h-[65px] flex items-center"
                            >
                              <div className="flex flex-col gap-1 w-full">
                                <span 
                                  className="font-medium text-sm leading-tight block truncate" 
                                  title={diag.nombre}
                                >
                                  {diag.nombre.length > 130 ? `${diag.nombre.substring(0, 130)}...` : diag.nombre}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">
                                  {diag.actividad.length > 80 ? `${diag.actividad.substring(0, 80)}...` : diag.actividad}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="space-y-4">
                      {diagnosticoSeleccionado && datosPorDiagnostico.length > 0 ? (
                        <>
                          {/* Título del diagnóstico seleccionado */}
                          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-500 rounded-lg shadow-md flex-shrink-0">
                                <FileText className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-1">
                                  Diagnóstico Seleccionado
                                </h3>
                                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                                  {diagnosticosDisponibles.find(d => d.descripcion === diagnosticoSeleccionado)?.nombre}
                                </p>
                                <div className="mt-2 inline-flex px-2 py-1 bg-blue-100 dark:bg-blue-800/50 text-xs font-medium text-blue-700 dark:text-blue-300 rounded-full">
                                  {diagnosticosDisponibles.find(d => d.descripcion === diagnosticoSeleccionado)?.actividad}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Gráficas */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Gráfico de dona - Estados */}
                            <div className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200/80 dark:border-slate-600/80">
                              <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                <PieChart className="h-4 w-4 text-purple-600" />
                                Distribución por Estado
                              </h4>
                              <div className="flex items-center justify-center">
                                <div className="relative w-32 h-32">
                                  <svg viewBox="0 0 42 42" className="w-32 h-32 transform -rotate-90">
                                    {(() => {
                                      const total = datosPorDiagnostico.length;
                                      const completos = datosPorDiagnostico.filter(e => e.estado === 'Completo').length;
                                      const enProceso = datosPorDiagnostico.filter(e => e.estado === 'En Proceso').length;
                                      const pendientes = datosPorDiagnostico.filter(e => e.estado === 'Pendiente').length;
                                      
                                      const completosPercent = (completos / total) * 100;
                                      const enProcesoPercent = (enProceso / total) * 100;
                                      const pendientesPercent = (pendientes / total) * 100;
                                      
                                      const currentOffset = 0;
                                      const radius = 15.915494309189533; // Para circunferencia de 100
                                      
                                      return (
                                        <>
                                          <circle cx="21" cy="21" r={radius} fill="transparent" stroke="#e5e7eb" strokeWidth="3"></circle>
                                          {completos > 0 && (
                                            <circle
                                              cx="21" cy="21" r={radius} fill="transparent"
                                              stroke="#10b981" strokeWidth="3"
                                              strokeDasharray={`${completosPercent} ${100 - completosPercent}`}
                                              strokeDashoffset={currentOffset}
                                              className="transition-all duration-300"
                                            />
                                          )}
                                          {enProceso > 0 && (
                                            <circle
                                              cx="21" cy="21" r={radius} fill="transparent"
                                              stroke="#f59e0b" strokeWidth="3"
                                              strokeDasharray={`${enProcesoPercent} ${100 - enProcesoPercent}`}
                                              strokeDashoffset={currentOffset - completosPercent}
                                              className="transition-all duration-300"
                                            />
                                          )}
                                          {pendientes > 0 && (
                                            <circle
                                              cx="21" cy="21" r={radius} fill="transparent"
                                              stroke="#6b7280" strokeWidth="3"
                                              strokeDasharray={`${pendientesPercent} ${100 - pendientesPercent}`}
                                              strokeDashoffset={currentOffset - completosPercent - enProcesoPercent}
                                              className="transition-all duration-300"
                                            />
                                          )}
                                        </>
                                      );
                                    })()}
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{datosPorDiagnostico.length}</div>
                                      <div className="text-xs text-slate-600 dark:text-slate-400">Total</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className="text-sm text-slate-600 dark:text-slate-400">Completos</span>
                                  <span className="text-sm font-semibold text-green-600 ml-auto">{datosPorDiagnostico.filter(e => e.estado === 'Completo').length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                                  <span className="text-sm text-slate-600 dark:text-slate-400">En Proceso</span>
                                  <span className="text-sm font-semibold text-amber-600 ml-auto">{datosPorDiagnostico.filter(e => e.estado === 'En Proceso').length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                                  <span className="text-sm text-slate-600 dark:text-slate-400">Pendientes</span>
                                  <span className="text-sm font-semibold text-slate-600 ml-auto">{datosPorDiagnostico.filter(e => e.estado === 'Pendiente').length}</span>
                                </div>
                              </div>
                            </div>

                            {/* Gráfico de barras - Promedio resaltado */}
                            <div className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200/80 dark:border-slate-600/80">
                              <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-indigo-600" />
                                Promedio de Cumplimiento
                              </h4>
                              <div className="flex items-center justify-center">
                                {(() => {
                                  const promedio = datosPorDiagnostico.length > 0 ? 
                                    Math.round(datosPorDiagnostico.reduce((sum, e) => sum + e.evaluacion, 0) / datosPorDiagnostico.length) : 0;
                                  
                                  return (
                                    <div className="relative w-32 h-32">
                                      <svg viewBox="0 0 42 42" className="w-32 h-32 transform -rotate-90">
                                        <circle cx="21" cy="21" r="15.915494309189533" fill="transparent" stroke="#e5e7eb" strokeWidth="3"></circle>
                                        <circle
                                          cx="21" cy="21" r="15.915494309189533" fill="transparent"
                                          stroke={promedio >= 75 ? "#10b981" : promedio >= 50 ? "#f59e0b" : "#ef4444"}
                                          strokeWidth="3"
                                          strokeDasharray={`${promedio} ${100 - promedio}`}
                                          strokeDashoffset="0"
                                          className="transition-all duration-1000"
                                        />
                                      </svg>
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                          <div className={`text-2xl font-bold ${promedio >= 75 ? 'text-green-600' : promedio >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {promedio}%
                                          </div>
                                          <div className="text-xs text-slate-600 dark:text-slate-400">Promedio</div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                              <div className="mt-4">
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                                  <div 
                                    className={`h-3 rounded-full transition-all duration-1000 ${
                                      (() => {
                                        const promedio = datosPorDiagnostico.length > 0 ? 
                                          Math.round(datosPorDiagnostico.reduce((sum, e) => sum + e.evaluacion, 0) / datosPorDiagnostico.length) : 0;
                                        return promedio >= 75 ? 'bg-green-500' : promedio >= 50 ? 'bg-amber-500' : 'bg-red-500';
                                      })()
                                    }`}
                                    style={{ 
                                      width: `${datosPorDiagnostico.length > 0 ? 
                                        Math.round(datosPorDiagnostico.reduce((sum, e) => sum + e.evaluacion, 0) / datosPorDiagnostico.length) : 0
                                      }%` 
                                    }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  <span>0%</span>
                                  <span>50%</span>
                                  <span>100%</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Estadísticas del diagnóstico seleccionado */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{datosPorDiagnostico.length}</div>
                              <div className="text-xs text-purple-600 dark:text-purple-400">Total Entes</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-700 dark:text-green-300">
                                {datosPorDiagnostico.filter(e => e.estado === 'Completo').length}
                              </div>
                              <div className="text-xs text-green-600 dark:text-green-400">Completos</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
                                {datosPorDiagnostico.filter(e => e.estado === 'En Proceso').length}
                              </div>
                              <div className="text-xs text-amber-600 dark:text-amber-400">En Proceso</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                {datosPorDiagnostico.filter(e => e.estado === 'Pendiente').length}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">Pendientes</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                                {datosPorDiagnostico.length > 0 ? 
                                  Math.round(datosPorDiagnostico.reduce((sum, e) => sum + e.evaluacion, 0) / datosPorDiagnostico.length) : 0
                                }%
                              </div>
                              <div className="text-xs text-indigo-600 dark:text-indigo-400">Promedio</div>
                            </div>
                          </div>
                          
                          {/* Lista de entes con el diagnóstico agrupados por porcentaje */}
                          <div className="space-y-6">
                            {(() => {
                              // Agrupar entes por porcentaje de evaluación
                              const entesAgrupados = datosPorDiagnostico.reduce((grupos: any, ente: any) => {
                                const porcentaje = ente.evaluacion;
                                if (!grupos[porcentaje]) {
                                  grupos[porcentaje] = [];
                                }
                                grupos[porcentaje].push(ente);
                                return grupos;
                              }, {});

                              // Ordenar los grupos por porcentaje (descendente) y dentro de cada grupo por nombre
                              return Object.entries(entesAgrupados)
                                .sort(([a]: any, [b]: any) => parseInt(b) - parseInt(a))
                                .map(([porcentaje, entes]: [string, any]) => {
                                  const entesOrdenados = entes.sort((a: any, b: any) => 
                                    a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
                                  );
                                  
                                  return (
                                    <div key={porcentaje} className="space-y-3">
                                      {/* Header del grupo por porcentaje */}
                                      <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-600">
                                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                          parseInt(porcentaje) >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' :
                                          parseInt(porcentaje) >= 70 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200' :
                                          parseInt(porcentaje) >= 50 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200' :
                                          parseInt(porcentaje) > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200' :
                                          'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-200'
                                        }`}>
                                          {porcentaje}% de cumplimiento
                                        </div>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                          {entes.length} {entes.length === 1 ? 'ente' : 'entes'}
                                        </span>
                                      </div>
                                      
                                      {/* Grid de entes del mismo porcentaje */}
                                      <div className="grid gap-3 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                                        {entesOrdenados.map((ente: any, index: number) => (
                                          <div key={`${porcentaje}-${index}`} className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200/80 dark:border-slate-600/80 hover:shadow-lg transition-all duration-300">
                                            {/* Header del ente */}
                                            <div className="flex items-start justify-between mb-3">
                                              <div className="flex-1">
                                                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm line-clamp-2">
                                                  {ente.nombre}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                  <Badge 
                                                    variant="outline" 
                                                    className="text-xs px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700"
                                                  >
                                                    {ente.fuente === 'Diagnósticos Entes' ? 'Entes' : 'Municipal'}
                                                  </Badge>
                                                  <Badge 
                                                    variant="secondary" 
                                                    className={`text-xs px-2 py-0.5 ${
                                                      ente.estado === 'Completo' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' :
                                                      ente.estado === 'En Proceso' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200' :
                                                      'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-200'
                                                    }`}
                                                  >
                                                    {ente.estado}
                                                  </Badge>
                                                </div>
                                              </div>
                                              <div className="ml-2">
                                                <div className="text-right">
                                                  <div className={`text-lg font-bold ${
                                                    parseInt(porcentaje) >= 90 ? 'text-green-700 dark:text-green-300' :
                                                    parseInt(porcentaje) >= 70 ? 'text-blue-700 dark:text-blue-300' :
                                                    parseInt(porcentaje) >= 50 ? 'text-amber-700 dark:text-amber-300' :
                                                    parseInt(porcentaje) > 0 ? 'text-red-700 dark:text-red-300' :
                                                    'text-slate-700 dark:text-slate-300'
                                                  }`}>
                                                    {ente.evaluacion}%
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            
                                            {/* Información del ente */}
                                            <div className="space-y-2 text-xs">
                                              <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">Tipo de Poder:</span>
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{ente.tipoPoder}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">Órgano:</span>
                                                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-24" title={ente.organo}>
                                                  {ente.organo.length > 15 ? `${ente.organo.slice(0, 15)}...` : ente.organo}
                                                </span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">Tipo de Ente:</span>
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{ente.tipoEnte}</span>
                                              </div>
                                              {ente.municipio !== 'No aplica' && ente.tipoEnte !== 'Municipal' && (
                                                <div className="flex justify-between">
                                                  <span className="text-slate-600 dark:text-slate-400">Municipio:</span>
                                                  <span className="font-medium text-slate-800 dark:text-slate-200">{ente.municipio}</span>
                                                </div>
                                              )}
                                            </div>
                                            
                                            {/* Barra de progreso */}
                                            <div className="mt-3">
                                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                <div 
                                                  className={`h-2 rounded-full transition-all duration-500 ${
                                                    ente.evaluacion >= 90 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                                    ente.evaluacion >= 70 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                                    ente.evaluacion >= 50 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                                                    ente.evaluacion > 0 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                                    'bg-gradient-to-r from-slate-400 to-slate-500'
                                                  }`}
                                                  style={{ width: `${ente.evaluacion}%` }}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                });
                            })()}
                          </div>
                        </>
                      ) : diagnosticoSeleccionado && datosPorDiagnostico.length === 0 ? (
                        <div className="text-center py-8">
                          <PieChart className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                            No hay entes con este diagnóstico
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-500">
                            El diagnóstico seleccionado no ha sido capturado por ningún ente aún.
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <PieChart className="w-12 h-12 text-purple-300 dark:text-purple-600 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Selecciona un diagnóstico
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-500">
                            Elige un diagnóstico específico del selector para ver qué entes lo tienen capturado.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

              {/* Estadísticas de Entes Específicas */}
              <EstadisticasEntesEspecificas />
                </div>
              )}

              {activeView === 'tablero' && (
                <div className="space-y-4">
                  <TableroDiagnosticosEntes 
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

                          {/* Filtro por Ente Público */}
                          <div className="space-y-2">
                            <Label htmlFor="ente" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              🏛️ Ente Público
                            </Label>
                            <Input
                              placeholder="Buscar ente público..."
                              value={filtros.entePublico === 'todos' ? '' : filtros.entePublico}
                              onChange={(e) => aplicarFiltroEntePublico(e.target.value || 'todos')}
                              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm"
                            />
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
                              onChange={(e) => aplicarFiltroEvaluacion(Number(e.target.value), filtros.evaluacionMax)}
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
                              onChange={(e) => aplicarFiltroEvaluacion(filtros.evaluacionMin, Number(e.target.value))}
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
                  {(filtros.trimestre !== 'todos' || filtros.entePublico !== 'todos' || 
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
                                {diagnosticosFiltrados.length}
                              </div>
                              <div className="text-xs text-blue-700 dark:text-blue-300">Total</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-green-600">
                                {diagnosticosFiltrados.filter(d => d.evaluacion === 100).length}
                              </div>
                              <div className="text-xs text-blue-700 dark:text-blue-300">Completados</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-amber-600">
                                {diagnosticosFiltrados.filter(d => d.evaluacion > 0 && d.evaluacion < 100).length}
                              </div>
                              <div className="text-xs text-blue-700 dark:text-blue-300">En Proceso</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-orange-600">
                                {diagnosticosFiltrados.length > 0 ? 
                                  (diagnosticosFiltrados.reduce((sum, d) => sum + d.evaluacion, 0) / diagnosticosFiltrados.length).toFixed(1) 
                                  : '0.0'}%
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
                            • Análisis detallado por entes públicos<br/>
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
                              Solo Completados ({diagnosticosFiltrados.filter(d => d.evaluacion === 100).length})
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
                            • Análisis detallado por entes públicos<br/>
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
                            • Ranking de desempeño por entes<br/>
                            • Identificación de oportunidades<br/>
                            • Predicciones de completitud
                          </p>
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg border border-amber-200">
                              <span className="font-semibold text-amber-800 dark:text-amber-200">Tendencias</span>
                              <div className="text-amber-600 dark:text-amber-400">
                                {diagnosticosFiltrados.length} entes analizados
                              </div>
                            </div>
                            <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg border border-amber-200">
                              <span className="font-semibold text-amber-800 dark:text-amber-200">Líder</span>
                              <div className="text-amber-600 dark:text-amber-400 truncate">
                                {diagnosticosFiltrados.length > 0 ? 
                                  diagnosticosFiltrados.reduce((max, d) => d.evaluacion > max.evaluacion ? d : max, diagnosticosFiltrados[0])?.entePublico?.slice(0, 15) + '...'
                                  : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Filtros Inteligentes */}
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
                          <div className="text-center py-6">
                            <div className="text-sm text-teal-600 dark:text-teal-400 leading-relaxed">
                              No hay vistas guardadas<br/>
                              <span className="text-xs">Configura filtros y guarda tu primera vista arriba</span>
                            </div>
                          </div>
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
                                style={{ width: `${(diagnosticosFiltrados.length / (diagnosticos.length || 1)) * 100}%` }}
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
                              {diagnosticosFiltrados.filter(d => d.evaluacion === 100).length}
                            </div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400">
                              {diagnosticosFiltrados.length > 0 ? ((diagnosticosFiltrados.filter(d => d.evaluacion === 100).length / diagnosticosFiltrados.length) * 100).toFixed(1) : 0}% de completitud
                            </div>
                            <div className="mt-2 w-full bg-emerald-200 dark:bg-emerald-800 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${diagnosticosFiltrados.length > 0 ? (diagnosticosFiltrados.filter(d => d.evaluacion === 100).length / diagnosticosFiltrados.length) * 100 : 0}%` }}
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
                              {diagnosticosFiltrados.filter(d => d.evaluacion > 0 && d.evaluacion < 100).length}
                            </div>
                            <div className="text-xs text-amber-600 dark:text-amber-400">
                              {diagnosticosFiltrados.length > 0 ? ((diagnosticosFiltrados.filter(d => d.evaluacion > 0 && d.evaluacion < 100).length / diagnosticosFiltrados.length) * 100).toFixed(1) : 0}% en desarrollo
                            </div>
                            <div className="mt-2 w-full bg-amber-200 dark:bg-amber-800 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-amber-500 to-yellow-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${diagnosticosFiltrados.length > 0 ? (diagnosticosFiltrados.filter(d => d.evaluacion > 0 && d.evaluacion < 100).length / diagnosticosFiltrados.length) * 100 : 0}%` }}
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
                              {diagnosticosFiltrados.filter(d => d.evaluacion === 0).length}
                            </div>
                            <div className="text-xs text-red-600 dark:text-red-400">
                              {diagnosticosFiltrados.length > 0 ? ((diagnosticosFiltrados.filter(d => d.evaluacion === 0).length / diagnosticosFiltrados.length) * 100).toFixed(1) : 0}% sin iniciar
                            </div>
                            <div className="mt-2 w-full bg-red-200 dark:bg-red-800 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-red-500 to-rose-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${diagnosticosFiltrados.length > 0 ? (diagnosticosFiltrados.filter(d => d.evaluacion === 0).length / diagnosticosFiltrados.length) * 100 : 0}%` }}
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
                              {diagnosticosFiltrados.length > 0 ? 
                                (diagnosticosFiltrados.reduce((sum, d) => sum + d.evaluacion, 0) / diagnosticosFiltrados.length).toFixed(1)
                                : '0.0'}%
                            </div>
                          </div>
                          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Entes Activos</div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                              {new Set(diagnosticosFiltrados.map(d => d.entePublico)).size}
                            </div>
                          </div>
                          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Filtros Activos</div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                              {(filtros.trimestre !== 'todos' ? 1 : 0) + 
                               (filtros.entePublico !== 'todos' ? 1 : 0) + 
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

export default function DiagnosticosEntesPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <DiagnosticosEntesContent />
    </Suspense>
  )
}
