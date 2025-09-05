import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-service'
import { createLocalDate } from '@/lib/date-utils'

// GET - Obtener acuerdo específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const acuerdo = await prisma.acuerdos_seguimiento.findUnique({
      where: { id: parseInt(id) },
      include: {
        seguimientos: {
          orderBy: {
            fechaSeguimiento: 'desc'
          }
        }
      }
    })

    if (!acuerdo) {
      return NextResponse.json(
        { error: 'Acuerdo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(acuerdo)
  } catch (error) {
    console.error('Error obteniendo acuerdo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar acuerdo
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const data = await request.json()
    
    const acuerdo = await prisma.acuerdos_seguimiento.update({
      where: { id: parseInt(id) },
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
        estado: data.estado,
        observaciones: data.observaciones,
        fechaActualizacion: new Date(),
        creadoPor: data.creadoPor
      }
    })

    return NextResponse.json(acuerdo)
  } catch (error) {
    console.error('Error actualizando acuerdo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar acuerdo específico
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Usar transacción para eliminar todo de una vez
    await prisma.$transaction(async (tx) => {
      // Eliminar seguimientos primero
      await tx.seguimientos.deleteMany({
        where: { acuerdoId: parseInt(id) }
      })

      // Luego eliminar el acuerdo
      await tx.acuerdos_seguimiento.delete({
        where: { id: parseInt(id) }
      })
    })

    return NextResponse.json({ message: 'Acuerdo eliminado exitosamente' })
  } catch (error) {
    console.error('Error eliminando acuerdo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
