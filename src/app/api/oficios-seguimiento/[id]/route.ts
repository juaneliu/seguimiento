import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)

    const oficio = await prisma.oficios_seguimiento.findUnique({
      where: { id },
      include: {
        ente: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    })

    if (!oficio) {
      return NextResponse.json(
        { error: 'Oficio de seguimiento no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(oficio)
  } catch (error) {
    console.error('Error fetching oficio de seguimiento:', error)
    return NextResponse.json(
      { error: 'Error al obtener el oficio de seguimiento' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    const body = await request.json()
    const { titulo, descripcion, urlPdf, fechaOficio } = body

    const oficioActualizado = await prisma.oficios_seguimiento.update({
      where: { id },
      data: {
        titulo,
        descripcion,
        urlPdf,
        fechaOficio: fechaOficio ? new Date(fechaOficio) : undefined,
        updatedAt: new Date()
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

    return NextResponse.json(oficioActualizado)
  } catch (error) {
    console.error('Error updating oficio de seguimiento:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el oficio de seguimiento' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)

    await prisma.oficios_seguimiento.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Oficio de seguimiento eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting oficio de seguimiento:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el oficio de seguimiento' },
      { status: 500 }
    )
  }
}
