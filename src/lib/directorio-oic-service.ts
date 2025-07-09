import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type DirectorioOICData = {
  id?: number
  oicNombre: string
  puesto: string
  nombre: string
  correoElectronico: string
  telefono?: string | null
  direccion?: string | null
  entidad: {
    nombre: string
  }
  directorio_oic_entesIds?: number[] // IDs de los entes públicos asociados
  entesPublicosIds?: number[] // Nombre alternativo para compatibilidad
  createdAt?: Date
  updatedAt?: Date
}

export type DirectorioOICWithEntes = {
  id: number
  oicNombre: string
  puesto: string
  nombre: string
  correoElectronico: string
  telefono?: string | null
  direccion?: string | null
  entidad: {
    nombre: string
  }
  entesPublicos: Array<{
    id: number
    nombre: string
    ambitoGobierno: string
    poderGobierno: string
  }>
  createdAt: Date
  updatedAt: Date
}

export class DirectorioOICService {
  
  static async getAll(): Promise<DirectorioOICWithEntes[]> {
    try {
      const directorios = await prisma.directorio_oic.findMany({
        include: {
          directorio_oic_entes: {
            include: {
              entes_publicos: {
                select: {
                  id: true,
                  nombre: true,
                  ambitoGobierno: true,
                  poderGobierno: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return directorios.map((directorio: any) => ({
        id: directorio.id,
        oicNombre: directorio.oicNombre,
        puesto: directorio.puesto,
        nombre: directorio.nombre,
        correoElectronico: directorio.correoElectronico,
        telefono: directorio.telefono,
        direccion: directorio.direccion,
        entidad: directorio.entidad as { nombre: string },
        entesPublicos: directorio.directorio_oic_entes.map((ep: any) => ep.entes_publicos),
        createdAt: directorio.createdAt,
        updatedAt: directorio.updatedAt
      }))
    } catch (error) {
      console.error('Error fetching directorio OIC:', error)
      throw new Error('Error al obtener el directorio OIC')
    }
  }

  static async getById(id: number): Promise<DirectorioOICWithEntes | null> {
    try {
      const directorio = await prisma.directorio_oic.findUnique({
        where: { id },
        include: {
          directorio_oic_entes: {
            include: {
              entes_publicos: {
                select: {
                  id: true,
                  nombre: true,
                  ambitoGobierno: true,
                  poderGobierno: true
                }
              }
            }
          }
        }
      })

      if (!directorio) return null

      return {
        id: directorio.id,
        oicNombre: directorio.oicNombre,
        puesto: directorio.puesto,
        nombre: directorio.nombre,
        correoElectronico: directorio.correoElectronico,
        telefono: directorio.telefono,
        direccion: directorio.direccion,
        entidad: directorio.entidad as { nombre: string },
        entesPublicos: directorio.directorio_oic_entes.map((ep: any) => ep.entes_publicos),
        createdAt: directorio.createdAt,
        updatedAt: directorio.updatedAt
      }
    } catch (error) {
      console.error('Error fetching directorio OIC by ID:', error)
      throw new Error('Error al obtener el registro del directorio OIC')
    }
  }

  static async create(data: Omit<DirectorioOICData, 'id' | 'createdAt' | 'updatedAt'>): Promise<DirectorioOICWithEntes> {
    try {
      const { directorio_oic_entesIds, entesPublicosIds, ...directorioData } = data
      
      // Usar cualquiera de los dos nombres de propiedad para compatibilidad
      const entesIds = directorio_oic_entesIds || entesPublicosIds || []

      const directorio = await prisma.directorio_oic.create({
        data: {
          ...directorioData,
          updatedAt: new Date(),
          directorio_oic_entes: {
            create: entesIds.map((enteId: number) => ({
              entePublicoId: enteId
            }))
          }
        },
        include: {
          directorio_oic_entes: {
            include: {
              entes_publicos: {
                select: {
                  id: true,
                  nombre: true,
                  ambitoGobierno: true,
                  poderGobierno: true
                }
              }
            }
          }
        }
      })

      return {
        id: directorio.id,
        oicNombre: directorio.oicNombre,
        puesto: directorio.puesto,
        nombre: directorio.nombre,
        correoElectronico: directorio.correoElectronico,
        telefono: directorio.telefono,
        direccion: directorio.direccion,
        entidad: directorio.entidad as { nombre: string },
        entesPublicos: directorio.directorio_oic_entes.map((ep: any) => ep.entes_publicos),
        createdAt: directorio.createdAt,
        updatedAt: directorio.updatedAt
      }
    } catch (error) {
      console.error('Error creating directorio OIC:', error)
      throw new Error('Error al crear el registro del directorio OIC')
    }
  }

  static async update(id: number, data: Partial<Omit<DirectorioOICData, 'id' | 'createdAt' | 'updatedAt'>>): Promise<DirectorioOICWithEntes> {
    try {
      const { directorio_oic_entesIds, entesPublicosIds, ...directorioData } = data

      // Usar cualquiera de los dos nombres de propiedad para compatibilidad
      const entesIds = directorio_oic_entesIds || entesPublicosIds

      // Si se proporcionan nuevos entes públicos, actualizar las relaciones
      if (entesIds !== undefined) {
        // Eliminar relaciones existentes
        await prisma.directorio_oic_entes.deleteMany({
          where: { directorioOICId: id }
        })
        
        // Crear nuevas relaciones
        if (entesIds.length > 0) {
          await prisma.directorio_oic_entes.createMany({
            data: entesIds.map((enteId: number) => ({
              directorioOICId: id,
              entePublicoId: enteId
            }))
          })
        }
      }

      const directorio = await prisma.directorio_oic.update({
        where: { id },
        data: directorioData,
        include: {
          directorio_oic_entes: {
            include: {
              entes_publicos: {
                select: {
                  id: true,
                  nombre: true,
                  ambitoGobierno: true,
                  poderGobierno: true
                }
              }
            }
          }
        }
      })

      return {
        id: directorio.id,
        oicNombre: directorio.oicNombre,
        puesto: directorio.puesto,
        nombre: directorio.nombre,
        correoElectronico: directorio.correoElectronico,
        telefono: directorio.telefono,
        direccion: directorio.direccion,
        entidad: directorio.entidad as { nombre: string },
        entesPublicos: directorio.directorio_oic_entes.map((ep: any) => ep.entes_publicos),
        createdAt: directorio.createdAt,
        updatedAt: directorio.updatedAt
      }
    } catch (error) {
      console.error('Error updating directorio OIC:', error)
      throw new Error('Error al actualizar el registro del directorio OIC')
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      await prisma.directorio_oic.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Error deleting directorio OIC:', error)
      throw new Error('Error al eliminar el registro del directorio OIC')
    }
  }

  static async getStatistics() {
    try {
      const total = await prisma.directorio_oic.count()
      
      const porOIC = await prisma.directorio_oic.groupBy({
        by: ['oicNombre'],
        _count: true
      })

      const porPuesto = await prisma.directorio_oic.groupBy({
        by: ['puesto'],
        _count: true
      })

      return {
        total,
        porOIC: porOIC.reduce((acc: Record<string, number>, item: any) => {
          acc[item.oicNombre] = item._count
          return acc
        }, {}),
        porPuesto: porPuesto.reduce((acc: Record<string, number>, item: any) => {
          acc[item.puesto] = item._count
          return acc
        }, {})
      }
    } catch (error) {
      console.error('Error getting directorio OIC statistics:', error)
      return {
        total: 0,
        porOIC: {},
        porPuesto: {}
      }
    }
  }
}
