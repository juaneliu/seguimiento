import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const enteId = searchParams.get('enteId')
    const sistema = searchParams.get('sistema')

    const whereClause: any = {}

    if (enteId) {
      whereClause.enteId = parseInt(enteId)
    }

    if (sistema) {
      whereClause.sistema = sistema
    }

    const oficios = await prisma.oficios_seguimiento.findMany({
      where: whereClause,
      include: {
        ente: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: {
        fechaOficio: 'desc'
      }
    })

    return NextResponse.json(oficios)
  } catch (error) {
    console.error('Error fetching oficios de seguimiento:', error)
    return NextResponse.json(
      { error: 'Error al obtener los oficios de seguimiento' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { enteId, sistema, titulo, descripcion, urlPdf, fechaOficio, creadoPor } = body

    // Validar campos requeridos
    if (!enteId || !sistema || !titulo || !urlPdf || !fechaOficio) {
      return NextResponse.json(
        { error: 'Campos requeridos: enteId, sistema, titulo, urlPdf, fechaOficio' },
        { status: 400 }
      )
    }

    // Validar que el sistema sea válido
    const sistemasValidos = ['sistema1', 'sistema2', 'sistema3', 'sistema6']
    if (!sistemasValidos.includes(sistema)) {
      return NextResponse.json(
        { error: 'Sistema debe ser uno de: ' + sistemasValidos.join(', ') },
        { status: 400 }
      )
    }

    const nuevoOficio = await prisma.oficios_seguimiento.create({
      data: {
        enteId: parseInt(enteId),
        sistema,
        titulo,
        descripcion,
        urlPdf,
        fechaOficio: new Date(fechaOficio),
        updatedAt: new Date(),
        creadoPor
      },
      include: {
        ente: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    })

    return NextResponse.json(nuevoOficio, { status: 201 })
  } catch (error) {
    console.error('Error creating oficio de seguimiento:', error)
    return NextResponse.json(
      { error: 'Error al crear el oficio de seguimiento' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const enteId = searchParams.get('enteId')
    const sistema = searchParams.get('sistema')

    if (!enteId || !sistema) {
      return NextResponse.json(
        { error: 'Se requieren enteId y sistema para eliminar oficios' },
        { status: 400 }
      )
    }

    // Eliminar todos los oficios de un ente y sistema específico
    const deleteResult = await prisma.oficios_seguimiento.deleteMany({
      where: {
        enteId: parseInt(enteId),
        sistema: sistema
      }
    })

    return NextResponse.json(
      { 
        message: `Se eliminaron ${deleteResult.count} oficios de seguimiento`,
        deletedCount: deleteResult.count 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting oficios de seguimiento:', error)
    return NextResponse.json(
      { error: 'Error al eliminar los oficios de seguimiento' },
      { status: 500 }
    )
  }
}
