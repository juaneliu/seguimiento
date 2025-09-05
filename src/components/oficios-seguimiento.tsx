"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Calendar, FileText, ExternalLink } from "lucide-react"

interface OficioSeguimiento {
  id?: string
  titulo: string
  descripcion: string
  urlPdf: string
  fechaOficio: string
}

interface OficiosSeguimientoComponentProps {
  sistema: string
  sistemaLabel: string
  sistemaActivo: boolean
  oficios: OficioSeguimiento[]
  onChange: (oficios: OficioSeguimiento[]) => void
}

export function OficiosSeguimientoComponent({
  sistema,
  sistemaLabel,
  sistemaActivo,
  oficios,
  onChange
}: OficiosSeguimientoComponentProps) {
  const [nuevoOficio, setNuevoOficio] = useState<OficioSeguimiento>({
    titulo: "",
    descripcion: "",
    urlPdf: "",
    fechaOficio: new Date().toISOString().split('T')[0]
  })

  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const agregarOficio = () => {
    if (!nuevoOficio.titulo || !nuevoOficio.urlPdf) {
      return
    }

    const oficioConId: OficioSeguimiento = {
      ...nuevoOficio,
      id: Date.now().toString()
    }

    onChange([...oficios, oficioConId])
    
    // Reset form
    setNuevoOficio({
      titulo: "",
      descripcion: "",
      urlPdf: "",
      fechaOficio: new Date().toISOString().split('T')[0]
    })
    setMostrarFormulario(false)
  }

  const eliminarOficio = (id: string) => {
    onChange(oficios.filter(oficio => oficio.id !== id))
  }

  if (!sistemaActivo) {
    return null
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Oficios de Seguimiento - {sistemaLabel}
          <Badge variant="secondary" className="ml-2">
            {oficios.length} oficio{oficios.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de oficios existentes */}
        {oficios.length > 0 && (
          <div className="space-y-3">
            {oficios.map((oficio) => (
              <div 
                key={oficio.id} 
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{oficio.titulo}</h4>
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(oficio.fechaOficio).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  {oficio.descripcion && (
                    <p className="text-xs text-muted-foreground mb-2">{oficio.descripcion}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-3 w-3 text-blue-500" />
                    <a 
                      href={oficio.urlPdf} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Ver PDF
                    </a>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => eliminarOficio(oficio.id!)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Formulario para agregar nuevo oficio */}
        {mostrarFormulario ? (
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div>
              <Label htmlFor={`titulo-${sistema}`} className="text-sm font-medium">
                Título del Oficio *
              </Label>
              <Input
                id={`titulo-${sistema}`}
                value={nuevoOficio.titulo}
                onChange={(e) => setNuevoOficio(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ej: Oficio de seguimiento trimetral"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor={`descripcion-${sistema}`} className="text-sm font-medium">
                Descripción
              </Label>
              <Textarea
                id={`descripcion-${sistema}`}
                value={nuevoOficio.descripcion}
                onChange={(e) => setNuevoOficio(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción del oficio (opcional)"
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor={`urlPdf-${sistema}`} className="text-sm font-medium">
                URL del PDF *
              </Label>
              <Input
                id={`urlPdf-${sistema}`}
                type="url"
                value={nuevoOficio.urlPdf}
                onChange={(e) => setNuevoOficio(prev => ({ ...prev, urlPdf: e.target.value }))}
                placeholder="https://ejemplo.com/documento.pdf"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor={`fechaOficio-${sistema}`} className="text-sm font-medium">
                Fecha del Oficio
              </Label>
              <Input
                id={`fechaOficio-${sistema}`}
                type="date"
                value={nuevoOficio.fechaOficio}
                onChange={(e) => setNuevoOficio(prev => ({ ...prev, fechaOficio: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={agregarOficio}
                disabled={!nuevoOficio.titulo || !nuevoOficio.urlPdf}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar Oficio
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMostrarFormulario(false)}
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setMostrarFormulario(true)}
            className="w-full"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Oficio de Seguimiento
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
