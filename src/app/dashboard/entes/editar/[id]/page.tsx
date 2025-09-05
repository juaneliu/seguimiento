"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ChevronRight, Loader2, Plus, Trash2 } from "lucide-react"
import { showError, showSuccess } from "@/lib/notifications"
import { useEntes, type EntePublico } from "@/hooks/use-entes"
import { MUNICIPIOS_MORELOS } from "@/lib/prisma-service"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// Schema de validación
const formSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  ambitoGobierno: z.enum(["Estatal", "Federal", "Municipal"], {
    required_error: "Selecciona un ámbito de gobierno",
  }),
  poderGobierno: z.enum(["Ejecutivo", "Judicial", "Legislativo", "Autónomo"], {
    required_error: "Selecciona un poder de gobierno", 
  }),
  controlOIC: z.boolean(),
  controlTribunal: z.boolean(),
  sistema1: z.boolean(),
  sistema2: z.boolean(),
  sistema3: z.boolean(),
  sistema6: z.boolean(),
  municipio: z.string().optional(),
  // Oficios de seguimiento
  oficiosSistema1: z.array(z.object({
    titulo: z.string(),
    urlPdf: z.string(),
    fechaOficio: z.date()
  })).optional(),
  oficiosSistema2: z.array(z.object({
    titulo: z.string(),
    urlPdf: z.string(),
    fechaOficio: z.date()
  })).optional(),
  oficiosSistema3: z.array(z.object({
    titulo: z.string(),
    urlPdf: z.string(),
    fechaOficio: z.date()
  })).optional(),
  oficiosSistema6: z.array(z.object({
    titulo: z.string(),
    urlPdf: z.string(),
    fechaOficio: z.date()
  })).optional(),
})

type FormData = z.infer<typeof formSchema>

// Función helper para convertir fechas de manera segura
const safeDate = (dateValue: any): Date => {
  if (!dateValue) return new Date()
  
  const date = new Date(dateValue)
  if (isNaN(date.getTime())) {
    return new Date()
  }
  
  return date
}

// Función helper para formatear fechas de manera segura para inputs
const safeDateValue = (date: Date): string => {
  try {
    if (!date || isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0]
    }
    return date.toISOString().split('T')[0]
  } catch (error) {
    return new Date().toISOString().split('T')[0]
  }
}

export default function EditarEntePage() {
  const router = useRouter()
  const params = useParams()
  const { updateEnte } = useEntes()
  
  const [ente, setEnte] = useState<EntePublico | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Estados para los oficios
  const [oficiosSistema1, setOficiosSistema1] = useState<Array<{id?: number, titulo: string, urlPdf: string, fechaOficio: Date}>>([])
  const [oficiosSistema2, setOficiosSistema2] = useState<Array<{id?: number, titulo: string, urlPdf: string, fechaOficio: Date}>>([])
  const [oficiosSistema3, setOficiosSistema3] = useState<Array<{id?: number, titulo: string, urlPdf: string, fechaOficio: Date}>>([])
  const [oficiosSistema6, setOficiosSistema6] = useState<Array<{id?: number, titulo: string, urlPdf: string, fechaOficio: Date}>>([])
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      ambitoGobierno: undefined,
      poderGobierno: undefined,
      controlOIC: false,
      controlTribunal: false,
      sistema1: false,
      sistema2: false,
      sistema3: false,
      sistema6: false,
      municipio: "",
      oficiosSistema1: [],
      oficiosSistema2: [],
      oficiosSistema3: [],
      oficiosSistema6: [],
    },
  })

  const watchControlOIC = form.watch("controlOIC")
  const watchControlTribunal = form.watch("controlTribunal")
  const watchAmbitoGobierno = form.watch("ambitoGobierno")
  const watchSistema1 = form.watch("sistema1")
  const watchSistema2 = form.watch("sistema2")
  const watchSistema3 = form.watch("sistema3")
  const watchSistema6 = form.watch("sistema6")

  // Función para agregar oficios
  const agregarOficio = (sistema: 'sistema1' | 'sistema2' | 'sistema3' | 'sistema6') => {
    const nuevoOficio = {
      titulo: '',
      urlPdf: '',
      fechaOficio: new Date()
    }
    
    switch(sistema) {
      case 'sistema1':
        setOficiosSistema1([...oficiosSistema1, nuevoOficio])
        break
      case 'sistema2':
        setOficiosSistema2([...oficiosSistema2, nuevoOficio])
        break
      case 'sistema3':
        setOficiosSistema3([...oficiosSistema3, nuevoOficio])
        break
      case 'sistema6':
        setOficiosSistema6([...oficiosSistema6, nuevoOficio])
        break
    }
  }

  // Función para eliminar oficios
  const eliminarOficio = async (sistema: 'sistema1' | 'sistema2' | 'sistema3' | 'sistema6', index: number) => {
    let oficioAEliminar: any = null
    
    // Obtener el oficio que se va a eliminar
    switch(sistema) {
      case 'sistema1':
        oficioAEliminar = oficiosSistema1[index]
        break
      case 'sistema2':
        oficioAEliminar = oficiosSistema2[index]
        break
      case 'sistema3':
        oficioAEliminar = oficiosSistema3[index]
        break
      case 'sistema6':
        oficioAEliminar = oficiosSistema6[index]
        break
    }
    
    // Si el oficio tiene ID, eliminarlo de la base de datos
    if (oficioAEliminar && oficioAEliminar.id) {
      try {
        const response = await fetch(`/api/oficios-seguimiento/${oficioAEliminar.id}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          throw new Error('Error al eliminar oficio')
        }
      } catch (error) {
        console.error('Error eliminando oficio:', error)
        await showError(
          'Error al eliminar',
          'No se pudo eliminar el oficio de seguimiento'
        )
        return
      }
    }
    
    // Eliminar del estado local
    switch(sistema) {
      case 'sistema1':
        setOficiosSistema1(oficiosSistema1.filter((_: any, i: number) => i !== index))
        break
      case 'sistema2':
        setOficiosSistema2(oficiosSistema2.filter((_: any, i: number) => i !== index))
        break
      case 'sistema3':
        setOficiosSistema3(oficiosSistema3.filter((_: any, i: number) => i !== index))
        break
      case 'sistema6':
        setOficiosSistema6(oficiosSistema6.filter((_: any, i: number) => i !== index))
        break
    }
  }

  // Función para actualizar oficios
  const actualizarOficio = (sistema: 'sistema1' | 'sistema2' | 'sistema3' | 'sistema6', index: number, campo: 'titulo' | 'urlPdf' | 'fechaOficio', valor: string | Date) => {
    const actualizarArray = (array: any[], setter: any) => {
      const newArray = [...array]
      newArray[index] = { ...newArray[index], [campo]: valor }
      setter(newArray)
    }

    switch(sistema) {
      case 'sistema1':
        actualizarArray(oficiosSistema1, setOficiosSistema1)
        break
      case 'sistema2':
        actualizarArray(oficiosSistema2, setOficiosSistema2)
        break
      case 'sistema3':
        actualizarArray(oficiosSistema3, setOficiosSistema3)
        break
      case 'sistema6':
        actualizarArray(oficiosSistema6, setOficiosSistema6)
        break
    }
  }

  // Lógica para habilitar/deshabilitar sistemas
  const isSistema3Available = watchControlOIC || watchControlTribunal
  const areOtrosSistemasDisabled = watchControlOIC

  // Cargar datos del ente
  useEffect(() => {
    const loadEnte = async () => {
      try {
        setLoading(true)
        const id = params.id as string
        
        const response = await fetch(`/api/entes/${id}`)
        if (!response.ok) {
          throw new Error('Error al cargar el ente')
        }
        
        const enteData: EntePublico = await response.json()
        setEnte(enteData)
        
        // Actualizar el formulario con los datos del ente
        form.reset({
          nombre: enteData.nombre,
          ambitoGobierno: enteData.ambitoGobierno,
          poderGobierno: enteData.poderGobierno,
          controlOIC: enteData.controlOIC,
          controlTribunal: enteData.controlTribunal,
          sistema1: enteData.sistema1,
          sistema2: enteData.sistema2,
          sistema3: enteData.sistema3,
          sistema6: enteData.sistema6,
          municipio: enteData.municipio || "",
        })

        // Cargar oficios de seguimiento para todos los sistemas
        const oficiosPromises = [
          fetch(`/api/oficios-seguimiento?enteId=${id}&sistema=sistema1`),
          fetch(`/api/oficios-seguimiento?enteId=${id}&sistema=sistema2`),
          fetch(`/api/oficios-seguimiento?enteId=${id}&sistema=sistema3`),
          fetch(`/api/oficios-seguimiento?enteId=${id}&sistema=sistema6`)
        ]

        const oficiosResponses = await Promise.all(oficiosPromises)
        
        // Procesar Sistema 1
        if (oficiosResponses[0].ok) {
          const oficios1 = await oficiosResponses[0].json()
          setOficiosSistema1(oficios1.map((o: any) => ({
            id: o.id,
            titulo: o.titulo,
            urlPdf: o.urlPdf,
            fechaOficio: safeDate(o.fechaOficio)
          })))
        }

        // Procesar Sistema 2
        if (oficiosResponses[1].ok) {
          const oficios2 = await oficiosResponses[1].json()
          setOficiosSistema2(oficios2.map((o: any) => ({
            id: o.id,
            titulo: o.titulo,
            urlPdf: o.urlPdf,
            fechaOficio: safeDate(o.fechaOficio)
          })))
        }

        // Procesar Sistema 3
        if (oficiosResponses[2].ok) {
          const oficios3 = await oficiosResponses[2].json()
          setOficiosSistema3(oficios3.map((o: any) => ({
            id: o.id,
            titulo: o.titulo,
            urlPdf: o.urlPdf,
            fechaOficio: safeDate(o.fechaOficio)
          })))
        }

        // Procesar Sistema 6
        if (oficiosResponses[3].ok) {
          const oficios6 = await oficiosResponses[3].json()
          setOficiosSistema6(oficios6.map((o: any) => ({
            id: o.id,
            titulo: o.titulo,
            urlPdf: o.urlPdf,
            fechaOficio: safeDate(o.fechaOficio)
          })))
        }
        
      } catch (error) {
        console.error('Error al cargar ente:', error)
        await showError(
          'Error al cargar datos',
          'No se pudieron cargar los datos del ente público'
        )
        router.push('/dashboard/entes')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadEnte()
    }
  }, [params.id, form, router])

  const onSubmit = async (values: FormData) => {
    if (!ente?.id) return
    
    console.log("Datos del formulario para actualizar:", values)
    
    // Validación personalizada de campos obligatorios
    const missingFields: string[] = []
    
    if (!values.nombre || values.nombre.trim() === "") {
      missingFields.push("Nombre")
      form.setError("nombre", {
        type: "manual",
        message: "El nombre es obligatorio"
      })
    }
    
    if (!values.ambitoGobierno) {
      missingFields.push("Ámbito de Gobierno")
      form.setError("ambitoGobierno", {
        type: "manual", 
        message: "El ámbito de gobierno es obligatorio"
      })
    }
    
    if (!values.poderGobierno) {
      missingFields.push("Poder de Gobierno")
      form.setError("poderGobierno", {
        type: "manual",
        message: "El poder de gobierno es obligatorio"
      })
    }
    
    // Validación adicional para campos relacionados
    if (values.ambitoGobierno === "Municipal" && !values.municipio) {
      missingFields.push("Municipio")
      form.setError("municipio", {
        type: "manual",
        message: "El municipio es requerido para el ámbito Municipal"
      })
    }
    
    // Si hay campos faltantes, mostrar popup
    if (missingFields.length > 0) {
      await showError(
        'Campos obligatorios faltantes',
        `Por favor, complete los siguientes campos:\n\n• ${missingFields.join('\n• ')}`
      )
      return
    }
    
    try {
      setSubmitting(true)
      
      // Actualizar el ente con la nueva estructura
      const datosActualizados = {
        nombre: values.nombre,
        ambitoGobierno: values.ambitoGobierno,
        poderGobierno: values.poderGobierno,
        controlOIC: values.controlOIC,
        controlTribunal: values.controlTribunal,
        sistema1: values.sistema1,
        sistema2: values.sistema2,
        sistema3: values.sistema3,
        sistema6: values.sistema6,
        entidad: { nombre: "Morelos" }, // Estructura de objeto
        municipio: values.ambitoGobierno === "Municipal" ? values.municipio || null : null,
      }

      // Actualizar el ente usando el hook
      await updateEnte(ente.id, datosActualizados)
      
      // Manejar oficios de seguimiento para todos los sistemas
      const oficiosPromises = []
      
      // Sistema 1 - Crear/actualizar oficios si hay oficios con contenido
      if (oficiosSistema1.length > 0 && oficiosSistema1.some(oficio => oficio.titulo.trim())) {
        // Eliminar oficios existentes del sistema 1
        await fetch(`/api/oficios-seguimiento?enteId=${ente.id}&sistema=sistema1`, { method: 'DELETE' })
        
        // Crear nuevos oficios del sistema 1
        oficiosPromises.push(
          ...oficiosSistema1.filter(oficio => oficio.titulo.trim()).map(oficio => 
            fetch('/api/oficios-seguimiento', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                enteId: ente.id,
                sistema: 'sistema1',
                titulo: oficio.titulo,
                urlPdf: oficio.urlPdf,
                fechaOficio: oficio.fechaOficio
              })
            })
          )
        )
      } else if (!values.sistema1) {
        // Si el sistema se desactivó y no hay oficios, eliminar todos los oficios
        await fetch(`/api/oficios-seguimiento?enteId=${ente.id}&sistema=sistema1`, { method: 'DELETE' })
      }
      
      // Sistema 2 - Crear/actualizar oficios si hay oficios con contenido
      if (oficiosSistema2.length > 0 && oficiosSistema2.some(oficio => oficio.titulo.trim())) {
        await fetch(`/api/oficios-seguimiento?enteId=${ente.id}&sistema=sistema2`, { method: 'DELETE' })
        oficiosPromises.push(
          ...oficiosSistema2.filter(oficio => oficio.titulo.trim()).map(oficio => 
            fetch('/api/oficios-seguimiento', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                enteId: ente.id,
                sistema: 'sistema2',
                titulo: oficio.titulo,
                urlPdf: oficio.urlPdf,
                fechaOficio: oficio.fechaOficio
              })
            })
          )
        )
      } else if (!values.sistema2) {
        await fetch(`/api/oficios-seguimiento?enteId=${ente.id}&sistema=sistema2`, { method: 'DELETE' })
      }
      
      // Sistema 3 - Crear/actualizar oficios si hay oficios con contenido
      if (oficiosSistema3.length > 0 && oficiosSistema3.some(oficio => oficio.titulo.trim())) {
        await fetch(`/api/oficios-seguimiento?enteId=${ente.id}&sistema=sistema3`, { method: 'DELETE' })
        oficiosPromises.push(
          ...oficiosSistema3.filter(oficio => oficio.titulo.trim()).map(oficio => 
            fetch('/api/oficios-seguimiento', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                enteId: ente.id,
                sistema: 'sistema3',
                titulo: oficio.titulo,
                urlPdf: oficio.urlPdf,
                fechaOficio: oficio.fechaOficio
              })
            })
          )
        )
      } else if (!values.sistema3) {
        await fetch(`/api/oficios-seguimiento?enteId=${ente.id}&sistema=sistema3`, { method: 'DELETE' })
      }
      
      // Sistema 6 - Crear/actualizar oficios si hay oficios con contenido
      if (oficiosSistema6.length > 0 && oficiosSistema6.some(oficio => oficio.titulo.trim())) {
        await fetch(`/api/oficios-seguimiento?enteId=${ente.id}&sistema=sistema6`, { method: 'DELETE' })
        oficiosPromises.push(
          ...oficiosSistema6.filter(oficio => oficio.titulo.trim()).map(oficio => 
            fetch('/api/oficios-seguimiento', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                enteId: ente.id,
                sistema: 'sistema6',
                titulo: oficio.titulo,
                urlPdf: oficio.urlPdf,
                fechaOficio: oficio.fechaOficio
              })
            })
          )
        )
      } else if (!values.sistema6) {
        await fetch(`/api/oficios-seguimiento?enteId=${ente.id}&sistema=sistema6`, { method: 'DELETE' })
      }
      
      // Esperar a que se actualicen todos los oficios
      if (oficiosPromises.length > 0) {
        await Promise.all(oficiosPromises)
      }
      
      // Mostrar mensaje de éxito
      await showSuccess(
        '¡Ente actualizado exitosamente!',
        `El ente público "${values.nombre}" ha sido actualizado correctamente${oficiosPromises.length > 0 ? ` con ${oficiosPromises.length} oficio(s) de seguimiento.` : '.'}`
      )
      
      // Redirigir a la lista de entes
      router.push('/dashboard/entes')
      
    } catch (error) {
      console.error('Error al actualizar ente:', error)
      await showError(
        'Error al actualizar ente',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="w-full">
        <div className="flex-1 space-y-4 p-5">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Cargando datos del ente...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!ente) {
    return (
      <main className="w-full">
        <div className="flex-1 space-y-4 p-5">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <p className="text-muted-foreground">No se encontró el ente público</p>
              <Button onClick={() => router.push('/dashboard/entes')}>
                Volver a la lista
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="w-full">
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-4 p-5">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center space-x-1 text-sm text-muted-foreground">
            <Link 
              href="/dashboard" 
              className="overflow-hidden text-ellipsis whitespace-nowrap hover:text-foreground"
            >
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link 
              href="/dashboard/entes" 
              className="overflow-hidden text-ellipsis whitespace-nowrap hover:text-foreground"
            >
              Entes Públicos
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground pointer-events-none">
              Editar: {ente.nombre}
            </span>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Editar ente público
              </h2>
              <p className="text-sm text-muted-foreground">
                Modifica los datos del ente público "{ente.nombre}"
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-border h-[1px] w-full" />

          {/* Formulario */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
              {/* Bloque unificado del formulario */}
              <div className="p-8 bg-gradient-to-br from-white/70 via-slate-50/60 to-blue-50/40 dark:from-slate-800/70 dark:via-slate-700/60 dark:to-slate-600/40 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-600/60 shadow-lg">
                
                {/* Campo de nombre individual */}
                <div className="mb-8">
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">
                          Nombre del Ente Público: <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ingresa el nombre del ente público" 
                            className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 shadow-sm ${fieldState.error ? "field-error error-shake" : ""}`}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Primera fila: Ámbito y Poder de Gobierno */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <FormField
                    control={form.control}
                    name="ambitoGobierno"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">
                          Ámbito de Gobierno: <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 shadow-sm ${fieldState.error ? "field-error error-shake" : ""}`}>
                              <SelectValue placeholder="Selecciona un ámbito" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Estatal">Estatal</SelectItem>
                            <SelectItem value="Federal">Federal</SelectItem>
                            <SelectItem value="Municipal">Municipal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="poderGobierno"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">
                          Poder de Gobierno: <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 shadow-sm ${fieldState.error ? "field-error error-shake" : ""}`}>
                              <SelectValue placeholder="Selecciona un poder" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Ejecutivo">Ejecutivo</SelectItem>
                            <SelectItem value="Judicial">Judicial</SelectItem>
                            <SelectItem value="Legislativo">Legislativo</SelectItem>
                            <SelectItem value="Autónomo">Autónomo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Segunda fila: Órgano Interno de Control y Tribunal de Justicia Administrativa */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  <FormField
                    control={form.control}
                    name="controlOIC"
                    render={({ field }) => (
                      <FormItem className={`flex flex-row items-center justify-between rounded-lg border-2 p-4 shadow-sm ${
                        field.value 
                          ? 'border-green-300/60 bg-gradient-to-r from-green-50/80 to-emerald-50/60 dark:from-green-900/20 dark:to-emerald-900/15'
                          : 'border-slate-200/50 bg-white/50 dark:bg-slate-800/50'
                      } backdrop-blur-sm`}>
                        <div className="space-y-0.5 flex-1 mr-3">
                          <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">Órgano Interno de Control</FormLabel>
                          <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                            Al activar el OIC, solo el sistema S3 estará disponible.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="controlTribunal"
                    render={({ field }) => (
                      <FormItem className={`flex flex-row items-center justify-between rounded-lg border-2 p-4 shadow-sm ${
                        field.value 
                          ? 'border-green-300/60 bg-gradient-to-r from-green-50/80 to-emerald-50/60 dark:from-green-900/20 dark:to-emerald-900/15'
                          : 'border-slate-200/50 bg-white/50 dark:bg-slate-800/50'
                      } backdrop-blur-sm`}>
                        <div className="space-y-0.5 flex-1 mr-3">
                          <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">Tribunal de Justicia Administrativa</FormLabel>
                          <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                            Al activar el TJA, podrás activar o desactivar todos los sistemas.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tercera fila: Sistemas con oficios integrados */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <FormField
                    control={form.control}
                    name="sistema1"
                    render={({ field }) => (
                      <FormItem className={`rounded-lg border-2 p-4 shadow-sm ${
                        field.value 
                          ? 'border-green-300/60 bg-gradient-to-r from-green-50/80 to-emerald-50/60 dark:from-green-900/20 dark:to-emerald-900/15'
                          : 'border-slate-200/50 bg-white/50 dark:bg-slate-800/50'
                      } backdrop-blur-sm`}>
                        <div className="flex flex-row items-center justify-between mb-4">
                          <div className="space-y-0.5 flex-1 mr-3">
                            <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">Sistema 1</FormLabel>
                            <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                              Deshabilitado si el OIC está activado.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={areOtrosSistemasDisabled}
                            />
                          </FormControl>
                        </div>

                        {/* Oficios de Seguimiento integrados */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 border-t border-slate-200/60 dark:border-slate-600/60 pt-3">
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Oficios de Seguimiento
                            </h4>
                            {!field.value && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                Sistema desactivado
                              </span>
                            )}
                          </div>
                          
                          {oficiosSistema1.map((oficio, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border border-slate-200 rounded-lg bg-white/80 dark:bg-slate-800/80">
                              <Input
                                placeholder="Título del oficio"
                                value={oficio.titulo}
                                onChange={(e) => actualizarOficio('sistema1', index, 'titulo', e.target.value)}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60"
                              />
                              <Input
                                placeholder="URL del PDF"
                                value={oficio.urlPdf}
                                onChange={(e) => actualizarOficio('sistema1', index, 'urlPdf', e.target.value)}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60"
                              />
                              <div className="flex gap-2">
                                <Input
                                  type="date"
                                  value={safeDateValue(oficio.fechaOficio)}
                                  onChange={(e) => actualizarOficio('sistema1', index, 'fechaOficio', new Date(e.target.value))}
                                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 flex-1"
                                />
                                <Button 
                                  type="button"
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => eliminarOficio('sistema1', index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => agregarOficio('sistema1')}
                            className="w-full"
                            size="sm"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Oficio Sistema 1
                          </Button>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sistema2"
                    render={({ field }) => (
                      <FormItem className={`rounded-lg border-2 p-4 shadow-sm ${
                        field.value 
                          ? 'border-green-300/60 bg-gradient-to-r from-green-50/80 to-emerald-50/60 dark:from-green-900/20 dark:to-emerald-900/15'
                          : 'border-slate-200/50 bg-white/50 dark:bg-slate-800/50'
                      } backdrop-blur-sm`}>
                        <div className="flex flex-row items-center justify-between mb-4">
                          <div className="space-y-0.5 flex-1 mr-3">
                            <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">Sistema 2</FormLabel>
                            <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                              Deshabilitado si el OIC está activado.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={areOtrosSistemasDisabled}
                            />
                          </FormControl>
                        </div>

                        {/* Oficios de Seguimiento integrados */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 border-t border-slate-200/60 dark:border-slate-600/60 pt-3">
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Oficios de Seguimiento
                            </h4>
                            {!field.value && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                Sistema desactivado
                              </span>
                            )}
                          </div>
                          
                          {oficiosSistema2.map((oficio, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border border-slate-200 rounded-lg bg-white/80 dark:bg-slate-800/80">
                              <Input
                                placeholder="Título del oficio"
                                value={oficio.titulo}
                                onChange={(e) => actualizarOficio('sistema2', index, 'titulo', e.target.value)}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60"
                              />
                              <Input
                                placeholder="URL del PDF"
                                value={oficio.urlPdf}
                                onChange={(e) => actualizarOficio('sistema2', index, 'urlPdf', e.target.value)}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60"
                              />
                              <div className="flex gap-2">
                                <Input
                                  type="date"
                                  value={safeDateValue(oficio.fechaOficio)}
                                  onChange={(e) => actualizarOficio('sistema2', index, 'fechaOficio', new Date(e.target.value))}
                                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 flex-1"
                                />
                                <Button 
                                  type="button"
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => eliminarOficio('sistema2', index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => agregarOficio('sistema2')}
                            className="w-full"
                            size="sm"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Oficio Sistema 2
                          </Button>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sistema3"
                    render={({ field }) => (
                      <FormItem className={`rounded-lg border-2 p-4 shadow-sm ${
                        field.value 
                          ? 'border-blue-300/60 bg-gradient-to-r from-blue-50/80 to-cyan-50/60 dark:from-blue-900/20 dark:to-cyan-900/15'
                          : 'border-slate-200/50 bg-white/50 dark:bg-slate-800/50'
                      } backdrop-blur-sm`}>
                        <div className="flex flex-row items-center justify-between mb-4">
                          <div className="space-y-0.5 flex-1 mr-3">
                            <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">Sistema 3</FormLabel>
                            <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                              Disponible si se activa OIC o TJA.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!isSistema3Available}
                            />
                          </FormControl>
                        </div>

                        {/* Oficios de Seguimiento integrados */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 border-t border-slate-200/60 dark:border-slate-600/60 pt-3">
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Oficios de Seguimiento
                            </h4>
                            {!field.value && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                Sistema desactivado
                              </span>
                            )}
                          </div>
                          
                          {oficiosSistema3.map((oficio, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border border-slate-200 rounded-lg bg-white/80 dark:bg-slate-800/80">
                              <Input
                                placeholder="Título del oficio"
                                value={oficio.titulo}
                                onChange={(e) => actualizarOficio('sistema3', index, 'titulo', e.target.value)}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60"
                              />
                              <Input
                                placeholder="URL del PDF"
                                value={oficio.urlPdf}
                                onChange={(e) => actualizarOficio('sistema3', index, 'urlPdf', e.target.value)}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60"
                              />
                              <div className="flex gap-2">
                                <Input
                                  type="date"
                                  value={safeDateValue(oficio.fechaOficio)}
                                  onChange={(e) => actualizarOficio('sistema3', index, 'fechaOficio', new Date(e.target.value))}
                                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 flex-1"
                                />
                                <Button 
                                  type="button"
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => eliminarOficio('sistema3', index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => agregarOficio('sistema3')}
                            className="w-full"
                            size="sm"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Oficio Sistema 3-OIC
                          </Button>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sistema6"
                    render={({ field }) => (
                      <FormItem className={`rounded-lg border-2 p-4 shadow-sm ${
                        field.value 
                          ? 'border-green-300/60 bg-gradient-to-r from-green-50/80 to-emerald-50/60 dark:from-green-900/20 dark:to-emerald-900/15'
                          : 'border-slate-200/50 bg-white/50 dark:bg-slate-800/50'
                      } backdrop-blur-sm`}>
                        <div className="flex flex-row items-center justify-between mb-4">
                          <div className="space-y-0.5 flex-1 mr-3">
                            <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">Sistema 6</FormLabel>
                            <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                              Deshabilitado si el OIC está activado.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={areOtrosSistemasDisabled}
                            />
                          </FormControl>
                        </div>

                        {/* Oficios de Seguimiento integrados */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 border-t border-slate-200/60 dark:border-slate-600/60 pt-3">
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Oficios de Seguimiento
                            </h4>
                            {!field.value && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                Sistema desactivado
                              </span>
                            )}
                          </div>
                          
                          {oficiosSistema6.map((oficio, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border border-slate-200 rounded-lg bg-white/80 dark:bg-slate-800/80">
                              <Input
                                placeholder="Título del oficio"
                                value={oficio.titulo}
                                onChange={(e) => actualizarOficio('sistema6', index, 'titulo', e.target.value)}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60"
                              />
                              <Input
                                placeholder="URL del PDF"
                                value={oficio.urlPdf}
                                onChange={(e) => actualizarOficio('sistema6', index, 'urlPdf', e.target.value)}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60"
                              />
                              <div className="flex gap-2">
                                <Input
                                  type="date"
                                  value={safeDateValue(oficio.fechaOficio)}
                                  onChange={(e) => actualizarOficio('sistema6', index, 'fechaOficio', new Date(e.target.value))}
                                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 flex-1"
                                />
                                <Button 
                                  type="button"
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => eliminarOficio('sistema6', index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => agregarOficio('sistema6')}
                            className="w-full"
                            size="sm"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Oficio Sistema 6
                          </Button>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Campo de municipio */}
                {watchAmbitoGobierno === "Municipal" && (
                  <div className="mb-8">
                    <FormField
                      control={form.control}
                      name="municipio"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">
                            Municipio: <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 shadow-sm ${fieldState.error ? "field-error error-shake" : ""}`}>
                                <SelectValue placeholder="Selecciona un municipio" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MUNICIPIOS_MORELOS.map((municipio) => (
                                <SelectItem key={municipio} value={municipio}>
                                  {municipio}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex justify-end pt-4 border-t border-slate-200/60 dark:border-slate-600/60 gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push('/dashboard/entes')}
                    disabled={submitting}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 shadow-sm"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg px-8 py-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 active:bg-gradient-to-r active:from-blue-600 active:to-indigo-600"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar Ente Público'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </ScrollArea>
    </main>
  )
}
