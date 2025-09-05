import { useState, useEffect, useCallback } from 'react'

export interface DiagnosticoEnte {
  id: number
  nombreActividad: string
  entePublico: string
  actividad: string
  poder: string
  organo: string
  solicitudUrl?: string
  respuestaUrl?: string
  unidadAdministrativa: string
  evaluacion: number
  observaciones?: string
  acciones?: Array<{
    id: string
    descripcion: string
    urlAccion: string
    urlRespuesta?: string
    fechaLimite: string
    completada: boolean
  }>
  estado: string
  fechaCreacion: Date
  fechaActualizacion: Date
  creadoPor?: string
}

export function useDiagnosticosEntes() {
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoEnte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDiagnosticos = useCallback(async () => {
    try {
      setLoading(true)
      // Obtener todos los registros usando un límite muy alto
      const response = await fetch('/api/diagnosticos-entes?limit=1000')
      if (!response.ok) {
        throw new Error('Error al cargar diagnósticos de entes')
      }
      const response_data = await response.json()
      setDiagnosticos(response_data.data || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching diagnosticos entes:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const createDiagnostico = async (diagnosticoData: Omit<DiagnosticoEnte, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => {
    try {
      const response = await fetch('/api/diagnosticos-entes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diagnosticoData),
      })

      if (!response.ok) {
        throw new Error('Error al crear diagnóstico de ente')
      }

      const newDiagnostico = await response.json()
      setDiagnosticos(prev => [newDiagnostico, ...prev])
      return newDiagnostico
    } catch (error) {
      console.error('Error creating diagnostico ente:', error)
      throw error
    }
  }

  const updateDiagnostico = async (id: number, diagnosticoData: Partial<DiagnosticoEnte>) => {
    try {
      const response = await fetch(`/api/diagnosticos-entes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diagnosticoData),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar diagnóstico de ente')
      }

      const updatedDiagnostico = await response.json()
      setDiagnosticos(prev =>
        prev.map(d => d.id === id ? updatedDiagnostico : d)
      )
      return updatedDiagnostico
    } catch (error) {
      console.error('Error updating diagnostico ente:', error)
      throw error
    }
  }

  const deleteDiagnostico = async (id: number) => {
    try {
      const response = await fetch(`/api/diagnosticos-entes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar diagnóstico de ente')
      }

      setDiagnosticos(prev => prev.filter(d => d.id !== id))
    } catch (error) {
      console.error('Error deleting diagnostico ente:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchDiagnosticos()
  }, [])

  return {
    diagnosticos,
    loading,
    error,
    fetchDiagnosticos,
    createDiagnostico,
    updateDiagnostico,
    deleteDiagnostico
  }
}
