'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Building, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Users,
  FileText,
  MapPin,
  Eye,
  LogIn
} from "lucide-react"
import Link from "next/link"
import { MapaMorelos } from "@/components/mapa-morelos"

export default function PublicDashboard() {
  const [estadisticas, setEstadisticas] = useState({
    totalDiagnosticos: 0,
    completados: 0,
    enProceso: 0,
    municipiosActivos: 0,
    promedioGeneral: 0
  })

  useEffect(() => {
    // Cargar estadísticas públicas
    const cargarEstadisticas = async () => {
      try {
        const response = await fetch('/api/diagnosticos')
        if (response.ok) {
          const diagnosticos = await response.json()
          
          const completados = diagnosticos.filter((d: any) => d.estado === 'Completado').length
          const enProceso = diagnosticos.filter((d: any) => d.estado === 'En Proceso').length
          const municipiosActivos = new Set(diagnosticos.map((d: any) => d.municipio)).size
          const promedioGeneral = diagnosticos.length > 0 
            ? diagnosticos.reduce((acc: number, d: any) => acc + (d.evaluacion || 0), 0) / diagnosticos.length 
            : 0

          setEstadisticas({
            totalDiagnosticos: diagnosticos.length,
            completados,
            enProceso,
            municipiosActivos,
            promedioGeneral: Math.round(promedioGeneral)
          })
        }
      } catch (error) {
        console.error('Error cargando estadísticas:', error)
      }
    }

    cargarEstadisticas()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      {/* Header público */}
      <header className="bg-white shadow-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Tablero Estadístico SAEM</h1>
                <p className="text-sm text-slate-600">Seguimiento y Control - Dashboard Público</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium px-6 py-2 rounded-lg shadow-lg transition-all duration-200">
                  <LogIn className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">
            Sistema de Seguimiento y Control
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Monitoreo en tiempo real de diagnósticos municipales, indicadores de gestión y seguimiento de acuerdos en el estado de Morelos.
          </p>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-2">
                {estadisticas.totalDiagnosticos}
              </div>
              <div className="text-sm text-slate-600">Total Diagnósticos</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {estadisticas.completados}
              </div>
              <div className="text-sm text-slate-600">Completados</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {estadisticas.enProceso}
              </div>
              <div className="text-sm text-slate-600">En Proceso</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {estadisticas.municipiosActivos}
              </div>
              <div className="text-sm text-slate-600">Municipios Activos</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {estadisticas.promedioGeneral}%
              </div>
              <div className="text-sm text-slate-600">Promedio General</div>
            </CardContent>
          </Card>
        </div>

        {/* Mapa de Morelos */}
        <Card className="bg-white shadow-lg border-slate-200 mb-12">
          <CardHeader className="bg-gradient-to-r from-slate-100 to-blue-50 border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <MapPin className="h-5 w-5" />
              Mapa de Diagnósticos - Estado de Morelos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-96">
              <MapaMorelos />
            </div>
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white shadow-lg border-slate-200">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-blue-50 border-b border-slate-200">
              <CardTitle className="text-slate-800">¿Qué es el Tablero Estadístico SAEM?</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-600 mb-4">
                El Sistema de Tablero Estadístico de la SAEM es una herramienta integral para el monitoreo 
                y seguimiento de diagnósticos municipales, indicadores de gestión y acuerdos de seguimiento 
                en todos los municipios del estado de Morelos.
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Seguimiento en tiempo real de diagnósticos municipales</li>
                <li>Indicadores de transparencia y gestión pública</li>
                <li>Monitoreo de acuerdos y cumplimiento</li>
                <li>Reportes y análisis estadísticos</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-slate-200">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-blue-50 border-b border-slate-200">
              <CardTitle className="text-slate-800">Acceso al Sistema</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-600 mb-6">
                Para acceder a las funcionalidades completas del sistema, incluyendo la gestión de diagnósticos, 
                creación de reportes y administración de datos, inicie sesión con sus credenciales autorizadas.
              </p>
              <div className="space-y-4">
                <Link href="/login">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 rounded-lg shadow-lg transition-all duration-200">
                    <LogIn className="h-5 w-5 mr-2" />
                    Acceder al Sistema Completo
                  </Button>
                </Link>
                <div className="text-center">
                  <Badge variant="outline" className="text-slate-600 border-slate-300">
                    <Eye className="h-3 w-3 mr-1" />
                    Vista Pública - Información General
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-slate-600">
              © 2025 SAEM - Sistema de Administración Estatal de Morelos. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
