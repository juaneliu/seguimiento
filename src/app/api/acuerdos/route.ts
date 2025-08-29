import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-service'
import { createLocalDate } from '@/lib/date-utils'

// GET - Obtener todos los acuerdos
export async function GET() {
  try {
    const acuerdos = await prisma.acuerdos_seguimiento.findMany({
      include: {
        seguimientos: true
      },
      orderBy: {
        fechaCreacion: 'desc'
      }
    })

    return NextResponse.json(acuerdos)
  } catch (error) {
    console.error('Error obteniendo acuerdos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo acuerdo
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const acuerdo = await prisma.acuerdos_seguimiento.create({
      data: {
        numeroSesion: data.numeroSesion,
        tipoSesion: data.tipoSesion,
        fechaSesion: createLocalDate(data.fechaSesion),
        temaAgenda: data.temaAgenda,
        descripcionAcuerdo: data.descripcionAcuerdo,
        responsable: data.responsable,
        area: data.area,
        fechaCompromiso: createLocalDate(data.fechaCompromiso),
        prioridad: data.prioridad,
        estado: data.estado || 'Pendiente',
        observaciones: data.observaciones || null,
        fechaActualizacion: new Date(),
        creadoPor: data.creadoPor || null
      }
    })

    return NextResponse.json(acuerdo, { status: 201 })
  } catch (error) {
    console.error('Error creando acuerdo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar múltiples acuerdos
export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json()
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un array de IDs válidos' },
        { status: 400 }
      )
    }

    // Eliminar seguimientos primero (por la relación)
    await prisma.seguimientos.deleteMany({
      where: {
        acuerdoId: {
          in: ids.map(id => parseInt(id))
        }
      }
    })

    // Luego eliminar los acuerdos
    await prisma.acuerdos_seguimiento.deleteMany({
      where: {
        id: {
          in: ids.map(id => parseInt(id))
        }
      }
    })

    return NextResponse.json({ message: 'Acuerdos eliminados exitosamente' })
  } catch (error) {
    console.error('Error eliminando acuerdos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
