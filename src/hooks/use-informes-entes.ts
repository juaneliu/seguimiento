'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'

export interface FiltrosInformesEntes {
  trimestre: string
  año: number
  entePublico: string
  evaluacionMin: number
  evaluacionMax: number
  fechaInicio?: Date
  fechaFin?: Date
}

interface DiagnosticoEnte {
  id: number
  nombreActividad: string
  entePublico: string
  actividad: string
  solicitudUrl?: string
  respuestaUrl?: string
  unidadAdministrativa: string
  evaluacion: number
  observaciones?: string
  acciones?: any
  estado: string
  fechaCreacion: Date
  fechaActualizacion: Date
  creadoPor?: string
}

export const useInformesEntes = (diagnosticosOriginales: DiagnosticoEnte[] = []) => {
  const [isClient, setIsClient] = useState(false)
  const [filtros, setFiltros] = useState<FiltrosInformesEntes>({
    trimestre: 'todos',
    año: 2025,
    entePublico: 'todos',
    evaluacionMin: 0,
    evaluacionMax: 100
  })
  
  const [vistaPersonalizada, setVistaPersonalizada] = useState<{
    nombre: string
    metricas: string[]
    filtros: FiltrosInformesEntes
  } | null>(null)

  // Detectar si estamos en el cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Filtrar diagnósticos basado en los filtros activos
  const diagnosticosFiltrados = useMemo(() => {
    if (!diagnosticosOriginales || !Array.isArray(diagnosticosOriginales)) {
      return []
    }

    let resultado = [...diagnosticosOriginales]

    // Filtro por trimestre
    if (filtros.trimestre && filtros.trimestre !== 'todos') {
      const rangosTrimetres = {
        'Q1': { inicio: new Date(filtros.año, 0, 1), fin: new Date(filtros.año, 2, 31) },
        'Q2': { inicio: new Date(filtros.año, 3, 1), fin: new Date(filtros.año, 5, 30) },
        'Q3': { inicio: new Date(filtros.año, 6, 1), fin: new Date(filtros.año, 8, 30) },
        'Q4': { inicio: new Date(filtros.año, 9, 1), fin: new Date(filtros.año, 11, 31) }
      }
      
      const rango = rangosTrimetres[filtros.trimestre as keyof typeof rangosTrimetres]
      if (rango) {
        resultado = resultado.filter(diag => {
          const fechaCreacion = diag.fechaCreacion instanceof Date ? 
            diag.fechaCreacion : 
            new Date(diag.fechaCreacion)
          return fechaCreacion >= rango.inicio && fechaCreacion <= rango.fin
        })
      }
    }

    // Filtro por ente público
    if (filtros.entePublico && filtros.entePublico !== 'todos') {
      resultado = resultado.filter(diag => 
        diag.entePublico.toLowerCase().includes(filtros.entePublico.toLowerCase())
      )
    }

    // Filtro por rango de evaluación
    resultado = resultado.filter(diag => 
      diag.evaluacion >= filtros.evaluacionMin && 
      diag.evaluacion <= filtros.evaluacionMax
    )

    // Filtro por rango de fechas personalizado
    if (filtros.fechaInicio) {
      resultado = resultado.filter(diag => {
        const fechaCreacion = diag.fechaCreacion instanceof Date ? 
          diag.fechaCreacion : 
          new Date(diag.fechaCreacion)
        return fechaCreacion >= filtros.fechaInicio!
      })
    }
    
    if (filtros.fechaFin) {
      resultado = resultado.filter(diag => {
        const fechaCreacion = diag.fechaCreacion instanceof Date ? 
          diag.fechaCreacion : 
          new Date(diag.fechaCreacion)
        return fechaCreacion <= filtros.fechaFin!
      })
    }

    return resultado
  }, [diagnosticosOriginales, filtros])

  // Funciones para aplicar filtros
  const aplicarFiltroTrimestre = useCallback((trimestre: string) => {
    setFiltros(prev => ({ ...prev, trimestre }))
  }, [])

  const aplicarFiltroEntePublico = useCallback((entePublico: string) => {
    setFiltros(prev => ({ ...prev, entePublico }))
  }, [])

  const aplicarFiltroPeriodo = useCallback((fechaInicio: Date | undefined, fechaFin: Date | undefined) => {
    setFiltros(prev => ({ ...prev, fechaInicio, fechaFin }))
  }, [])

  const aplicarFiltroEvaluacion = useCallback((min: number, max: number) => {
    setFiltros(prev => ({ ...prev, evaluacionMin: min, evaluacionMax: max }))
  }, [])

  const limpiarFiltros = useCallback(() => {
    setFiltros({
      trimestre: 'todos',
      año: 2025,
      entePublico: 'todos',
      evaluacionMin: 0,
      evaluacionMax: 100
    })
  }, [])

  // Funciones adicionales para compatibilidad con la vista de informes
  const resetearFiltros = limpiarFiltros

  const actualizarFiltro = useCallback((campo: keyof FiltrosInformesEntes, valor: any) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
  }, [])

  // Funciones para vistas personalizadas (simuladas)
  const guardarVistaPersonalizada = useCallback((nombre: string, metricas: string[]) => {
    const vista = { nombre, metricas, filtros }
    const vistasGuardadas = JSON.parse(localStorage.getItem('vistasPersonalizadasEntes') || '[]')
    vistasGuardadas.push(vista)
    localStorage.setItem('vistasPersonalizadasEntes', JSON.stringify(vistasGuardadas))
  }, [filtros])

  const cargarVistaPersonalizada = useCallback((vista: any) => {
    setFiltros(vista.filtros)
    setVistaPersonalizada(vista)
  }, [])

  const obtenerVistasGuardadas = useCallback(() => {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem('vistasPersonalizadasEntes') || '[]')
  }, [])

  // Obtener entes únicos para filtros
  const entesUnicos = useMemo(() => {
    return Array.from(new Set(diagnosticosOriginales.map(d => d.entePublico))).sort()
  }, [diagnosticosOriginales])

  // Función para formatear período
  const formatearPeriodo = useCallback((trimestre: string) => {
    switch (trimestre) {
      case 'Q1': return 'Primer trimestre'
      case 'Q2': return 'Segundo trimestre'  
      case 'Q3': return 'Tercer trimestre'
      case 'Q4': return 'Cuarto trimestre'
      default: return 'Todo el año'
    }
  }, [])

  // Función para obtener diagnósticos filtrados (compatibilidad con la página)
  const getDiagnosticosFiltrados = useCallback((diagnosticos: DiagnosticoEnte[]) => {
    return diagnosticosFiltrados
  }, [diagnosticosFiltrados])

  return {
    filtros,
    diagnosticosFiltrados,
    isClient,
    vistaPersonalizada,
    setVistaPersonalizada,
    aplicarFiltroTrimestre,
    aplicarFiltroEntePublico,
    aplicarFiltroPeriodo,
    aplicarFiltroEvaluacion,
    limpiarFiltros,
    resetearFiltros,
    actualizarFiltro,
    formatearPeriodo,
    getDiagnosticosFiltrados,
    guardarVistaPersonalizada,
    cargarVistaPersonalizada,
    obtenerVistasGuardadas,
    entesUnicos
  }
}
