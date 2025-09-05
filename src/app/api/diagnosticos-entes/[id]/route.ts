import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const diagnosticoId = parseInt(id)
    
    const diagnostico = await prisma.diagnosticos_entes.findUnique({
      where: { id: diagnosticoId }
    })

    if (!diagnostico) {
      return NextResponse.json(
        { error: 'Diagnóstico de ente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(diagnostico)
  } catch (error) {
    console.error('Error fetching diagnostico ente:', error)
    return NextResponse.json(
      { error: 'Error al obtener el diagnóstico de ente' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const diagnosticoId = parseInt(id)
    const body = await request.json()
    
    const diagnostico = await prisma.diagnosticos_entes.update({
      where: { id: diagnosticoId },
      data: {
        ...body,
        fechaActualizacion: new Date()
      }
    })

    return NextResponse.json(diagnostico)
  } catch (error) {
    console.error('Error updating diagnostico ente:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el diagnóstico de ente' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const diagnosticoId = parseInt(id)
    
    await prisma.diagnosticos_entes.delete({
      where: { id: diagnosticoId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting diagnostico ente:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el diagnóstico de ente' },
      { status: 500 }
    )
  }
}
