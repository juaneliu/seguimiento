"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { showConfirm, showSuccess, showError } from "@/lib/notifications"
import { useDirectorioOIC } from "@/hooks/use-directorio-oic"
import { useAuth } from "@/contexts/auth-context"
import { DatabaseStatus } from "@/components/database-status"
import { ProtectedRoute } from "@/components/protected-route"
import { Users2, Search, Plus, MoreHorizontal, Edit, Trash2, Mail, Phone, Building2, MapPin } from "lucide-react"

export default function DirectorioPage() {
  return (
    <ProtectedRoute allowedRoles={['INVITADO', 'OPERATIVO', 'ADMINISTRADOR', 'SEGUIMIENTO']}>
      <DirectorioPageContent />
    </ProtectedRoute>
  )
}

function DirectorioPageContent() {
  const { directorios, loading, error, deleteDirectorio } = useDirectorioOIC()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")

  // Verificar si el usuario puede editar/eliminar
  const canEdit = user?.rol !== 'INVITADO'

  // Función para filtrar y ordenar directorio según el término de búsqueda
  const filtrarDirectorio = (directorios: any[]) => {
    let directoriosFiltrados = directorios
    
    // Aplicar filtro de búsqueda si existe término
    if (searchTerm.trim()) {
      const termino = searchTerm.toLowerCase().trim()
      directoriosFiltrados = directorios.filter(directorio => 
        directorio.oicNombre.toLowerCase().includes(termino) ||
        directorio.nombre.toLowerCase().includes(termino) ||
        directorio.puesto.toLowerCase().includes(termino) ||
        directorio.correoElectronico.toLowerCase().includes(termino) ||
        (directorio.telefono && directorio.telefono.toLowerCase().includes(termino)) ||
        (directorio.direccion && directorio.direccion.toLowerCase().includes(termino))
      )
    }
    
    // Ordenar alfabéticamente por nombre del OIC
    return directoriosFiltrados.sort((a, b) => 
      a.oicNombre.localeCompare(b.oicNombre, 'es', { sensitivity: 'base' })
    )
  }

  // Aplicar filtros de búsqueda
  const directoriosFiltrados = filtrarDirectorio(directorios)

  const limpiarBusqueda = () => {
    setSearchTerm("")
  }

  const handleEliminarDirectorio = async (id: number, nombre: string) => {
    const result = await showConfirm(
      '¿Estás seguro?',
      `Se eliminará el registro del directorio:\n\n"${nombre}"`
    )

    if (result.isConfirmed) {
      try {
        await deleteDirectorio(id)
        await showSuccess(
          '¡Eliminado!',
          'El registro del directorio ha sido eliminado exitosamente.'
        )
      } catch (error) {
        console.error('Error eliminando registro:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        await showError('Error', `No se pudo eliminar el registro: ${errorMessage}`)
      }
    }
  }

  if (loading) {
    return (
      <main className="w-full">
        <ScrollArea className="h-full">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Directorio de Órganos Internos de Control
                </h2>
                <p className="text-muted-foreground">
                  {canEdit ? "Administra el directorio de responsables de los OIC" : "Consulta el directorio de responsables de los OIC"}
                </p>
              </div>
              <div className="flex gap-2">
                {canEdit && (
                  <Link href="/dashboard/directorio/crear">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Registro
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            
            <Card className="bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 via-indigo-200/20 to-purple-200/20 dark:from-blue-800/10 dark:via-indigo-800/10 dark:to-purple-800/10 rounded-full blur-3xl -z-10"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                    <span className="text-white text-2xl">⏳</span>
                  </div>
                  <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-bold">
                    Cargando...
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg border border-slate-200/60 shadow-sm">
                  <p className="text-slate-600 dark:text-slate-400">Cargando directorio...</p>
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
                <h2 className="text-3xl font-bold tracking-tight">
                  Directorio de Órganos Internos de Control
                </h2>
                <p className="text-muted-foreground">
                  {canEdit ? "Administra el directorio de responsables de los OIC" : "Consulta el directorio de responsables de los OIC"}
                </p>
              </div>
              <div className="flex gap-2">
                {canEdit && (
                  <Link href="/dashboard/directorio/crear">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Registro
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            
            <DatabaseStatus />
            
            <Card className="bg-gradient-to-br from-white via-slate-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-200/20 via-rose-200/20 to-pink-200/20 dark:from-red-800/10 dark:via-rose-800/10 dark:to-pink-800/10 rounded-full blur-3xl -z-10"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg shadow-lg">
                    <span className="text-white">⚠️</span>
                  </div>
                  <span className="bg-gradient-to-r from-red-700 via-rose-700 to-pink-700 dark:from-red-400 dark:via-rose-400 dark:to-pink-400 bg-clip-text text-transparent font-bold">
                    Error al cargar datos
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg border border-slate-200/60 shadow-sm">
                  <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </main>
    )
  }

  return (
    <main className="w-full min-h-screen">
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-full overflow-x-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Directorio de Órganos Internos de Control
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {canEdit ? "Administra el directorio de responsables de los OIC" : "Consulta el directorio de responsables de los OIC"}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {canEdit && (
                <Link href="/dashboard/directorio/crear">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg whitespace-nowrap">
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Crear Registro</span>
                    <span className="sm:hidden">Crear</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <DatabaseStatus />
          
          {/* Bloque de búsqueda */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-white/70 to-slate-50/70 dark:from-slate-800/70 dark:to-slate-700/70 backdrop-blur-sm rounded-lg border border-slate-200/60 dark:border-slate-600/60 shadow-lg">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-slate-400 h-4 w-4" />
              </div>
              <Input
                type="text"
                placeholder={canEdit 
                  ? "Buscar por OIC, responsable, puesto, correo, teléfono o dirección..." 
                  : "Buscar por OIC, responsable, puesto, correo o dirección..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-slate-300/60 dark:border-slate-600/60 focus:border-blue-500 focus:ring-blue-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm"
              />
            </div>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={limpiarBusqueda}
                className="w-full sm:w-auto text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60"
              >
                <span className="mr-1">✕</span>
                Limpiar
              </Button>
            )}
          </div>
          
          {/* Resultados de búsqueda */}
          {searchTerm && (
            <div className="text-sm text-slate-600 dark:text-slate-400 px-1">
              {directoriosFiltrados.length > 0 ? (
                <>
                  Mostrando {directoriosFiltrados.length} resultado(s) para "{searchTerm}"
                </>
              ) : (
                <>
                  No se encontraron resultados para "{searchTerm}"
                </>
              )}
            </div>
          )}

          <Card className="bg-gradient-to-br from-white via-slate-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/20 via-violet-200/20 to-fuchsia-200/20 dark:from-purple-800/10 dark:via-violet-800/10 dark:to-fuchsia-800/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/20 via-indigo-200/20 to-purple-200/20 dark:from-blue-800/10 dark:via-indigo-800/10 dark:to-purple-800/10 rounded-full blur-2xl -z-10"></div>
            
            <CardHeader className="relative z-10 border-b border-slate-200/60 dark:border-slate-600/60 pb-6 bg-gradient-to-r from-white/50 to-purple-50/50 dark:from-slate-800/50 dark:to-slate-700/50 backdrop-blur-sm">
              <CardTitle className="flex items-center gap-3 text-xl text-slate-800 dark:text-slate-100">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-lg">
                  <Users2 className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-purple-700 via-violet-700 to-fuchsia-700 dark:from-purple-400 dark:via-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent font-bold">
                  Registros del Directorio ({directoriosFiltrados.length}
                  {searchTerm && directoriosFiltrados.length !== directorios.length && 
                    ` de ${directorios.length}`
                  })
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 relative z-10">
              {directoriosFiltrados.length === 0 ? (
                <div className="text-center py-8">
                  {searchTerm ? (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                        <Search className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-4">
                        No se encontraron registros que coincidan con "{searchTerm}"
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={limpiarBusqueda}
                        className="mt-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60"
                      >
                        <span className="mr-2">✕</span>
                        Limpiar búsqueda
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg">
                        <Users2 className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">
                        No hay registros en el directorio.
                      </p>
                      {canEdit && (
                        <Link href="/dashboard/directorio/crear" className="mt-4 inline-block">
                          <Button className="bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg">
                            <Plus className="mr-2 h-4 w-4" />
                            Crear primer registro
                          </Button>
                        </Link>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <>
                  {/* Vista desktop */}
                  <div className="hidden lg:block">
                    <table className="w-full text-sm border-collapse table-fixed">
                      <thead>
                        <tr className="border-b border-slate-200/60 dark:border-slate-600/60">
                          <th className="text-center p-4 font-semibold bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200 w-32">OIC</th>
                          <th className="text-center p-4 font-semibold bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200 w-40">Responsable</th>
                          <th className="text-center p-4 font-semibold bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200 w-32">Puesto</th>
                          <th className="text-center p-4 font-semibold bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200 w-56">Contacto</th>
                          <th className="text-center p-4 font-semibold bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200 w-40">Entes Asociados</th>
                          {canEdit && (
                            <th className="text-center p-4 font-semibold bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200 w-24">Acciones</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {directoriosFiltrados.map((directorio) => (
                          <tr key={directorio.id} className="border-b border-slate-100/60 dark:border-slate-700/60">
                            <td className="p-4">
                              <div className="font-medium text-slate-900 dark:text-slate-100">{directorio.oicNombre}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium text-slate-900 dark:text-slate-100">{directorio.nombre}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-slate-600 dark:text-slate-400">{directorio.puesto}</div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-2">
                                {/* Correo electrónico */}
                                <div className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                  <span className="break-all">{directorio.correoElectronico}</span>
                                </div>
                                
                                {/* Teléfono - solo si hay teléfono o si el usuario puede editar */}
                                {(directorio.telefono || canEdit) && (
                                  <div className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span>{directorio.telefono || 'No especificado'}</span>
                                  </div>
                                )}
                                
                                {/* Dirección */}
                                <div className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                  <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                  <span className="break-words">
                                    {directorio.direccion || 'No especificada'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm">
                                {directorio.entesPublicos && directorio.entesPublicos.length > 0 ? (
                                  <div className="space-y-1">
                                    {directorio.entesPublicos.map((ente: any) => (
                                      <div key={ente.id} className="text-xs bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-2 border border-slate-200/60 shadow-sm">
                                        <div className="flex items-center gap-1">
                                          <Building2 className="h-3 w-3 text-slate-400" />
                                          <span className="font-medium text-slate-900 dark:text-slate-100">
                                            {ente.nombre}
                                          </span>
                                        </div>
                                        <span className="text-slate-500 dark:text-slate-400 ml-4">
                                          ({ente.ambitoGobierno})
                                        </span>
                                      </div>
                                    ))}
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-600/60">
                                      Total: {directorio.entesPublicos.length} ente(s)
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 dark:text-slate-500 italic text-xs">
                                    Sin entes asociados
                                  </span>
                                )}
                              </div>
                            </td>
                            {canEdit && (
                              <td className="p-4">
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
                                      <Link href={`/dashboard/directorio/editar/${directorio.id}`} className="flex items-center cursor-pointer hover:bg-purple-50 dark:hover:bg-slate-700">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleEliminarDirectorio(directorio.id!, directorio.nombre)}
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
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Vista móvil */}
                  <div className="lg:hidden space-y-4">
                    {directoriosFiltrados.map((directorio) => (
                      <Card key={directorio.id} className="p-3 sm:p-4 bg-gradient-to-br from-white via-purple-50/30 to-violet-50/20 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 border-slate-200/60 dark:border-slate-600/60 shadow-lg">
                        <div className="space-y-3">
                          {/* Header del card */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                                {directorio.oicNombre}
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                                {directorio.nombre} - {directorio.puesto}
                              </p>
                            </div>
                            {canEdit && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-slate-600">
                                    <MoreHorizontal className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60">
                                  <DropdownMenuLabel className="text-slate-700 dark:text-slate-300">Acciones</DropdownMenuLabel>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/directorio/editar/${directorio.id}`} className="flex items-center cursor-pointer hover:bg-purple-50 dark:hover:bg-slate-700">
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleEliminarDirectorio(directorio.id!, directorio.nombre)}
                                    className="text-red-600 focus:text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>

                          {/* Información de contacto */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
                              <span className="text-slate-700 dark:text-slate-300 truncate">{directorio.correoElectronico}</span>
                            </div>
                            {canEdit && directorio.telefono && (
                              <div className="flex items-center gap-2 text-xs sm:text-sm">
                                <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
                                <span className="text-slate-700 dark:text-slate-300">{directorio.telefono}</span>
                              </div>
                            )}
                            {directorio.direccion && (
                              <div className="flex items-start gap-2 text-xs sm:text-sm">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                <span className="text-slate-700 dark:text-slate-300 break-words">{directorio.direccion}</span>
                              </div>
                            )}
                          </div>

                          {/* Entes asociados */}
                          {directorio.entesPublicos && directorio.entesPublicos.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                                <Building2 className="h-3 w-3 text-slate-400" />
                                Entes Asociados ({directorio.entesPublicos.length})
                              </div>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {directorio.entesPublicos.map((ente: any) => (
                                  <div key={ente.id} className="text-xs bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-2 border border-slate-200/60 shadow-sm">
                                    <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                      {ente.nombre}
                                    </div>
                                    <div className="text-slate-500 dark:text-slate-400">
                                      ({ente.ambitoGobierno})
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </main>
  )
}
