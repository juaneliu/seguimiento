import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-service'

// GET - Obtener seguimientos de un acuerdo específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const acuerdoId = parseInt(id)
    
    if (isNaN(acuerdoId)) {
      return NextResponse.json(
        { error: 'ID de acuerdo inválido' },
        { status: 400 }
      )
    }

    // Verificar que el acuerdo existe
    const acuerdo = await prisma.acuerdos_seguimiento.findUnique({
      where: { id: acuerdoId }
    })

    if (!acuerdo) {
      return NextResponse.json(
        { error: 'Acuerdo no encontrado' },
        { status: 404 }
      )
    }

    // Obtener los seguimientos del acuerdo
    const seguimientos = await prisma.seguimientos.findMany({
      where: { acuerdoId: acuerdoId },
      orderBy: { fechaSeguimiento: 'desc' }
    })

    return NextResponse.json(seguimientos)
  } catch (error) {
    console.error('Error al obtener seguimientos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo seguimiento para un acuerdo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const acuerdoId = parseInt(id)
    
    if (isNaN(acuerdoId)) {
      return NextResponse.json(
        { error: 'ID de acuerdo inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { seguimiento, accion, fechaSeguimiento, creadoPor } = body

    // Validar campos requeridos
    if (!seguimiento || !accion) {
      return NextResponse.json(
        { error: 'Los campos seguimiento y acción son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el acuerdo existe
    const acuerdo = await prisma.acuerdos_seguimiento.findUnique({
      where: { id: acuerdoId }
    })

    if (!acuerdo) {
      return NextResponse.json(
        { error: 'Acuerdo no encontrado' },
        { status: 404 }
      )
    }

    // Crear el seguimiento
    const nuevoSeguimiento = await prisma.seguimientos.create({
      data: {
        acuerdoId: acuerdoId,
        seguimiento: seguimiento,
        accion: accion,
        fechaSeguimiento: fechaSeguimiento ? new Date(fechaSeguimiento) : new Date(),
        creadoPor: creadoPor,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      }
    })

    return NextResponse.json(nuevoSeguimiento, { status: 201 })
  } catch (error) {
    console.error('Error al crear seguimiento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
