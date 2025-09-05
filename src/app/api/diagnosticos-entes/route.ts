import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Obtener todos los diagnósticos de entes con paginación y filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const estado = searchParams.get('estado') || ''
    const entePublico = searchParams.get('entePublico') || ''

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (search) {
      where.OR = [
        { nombreActividad: { contains: search, mode: 'insensitive' } },
        { actividad: { contains: search, mode: 'insensitive' } },
        { unidadAdministrativa: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (estado) {
      where.estado = estado
    }
    
    if (entePublico) {
      where.entePublico = { contains: entePublico, mode: 'insensitive' }
    }

    const [diagnosticos, total] = await Promise.all([
      prisma.diagnosticos_entes.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaCreacion: 'desc' }
      }),
      prisma.diagnosticos_entes.count({ where })
    ])

    return NextResponse.json({
      data: diagnosticos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error al obtener diagnósticos de entes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo diagnóstico de ente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const diagnostico = await prisma.diagnosticos_entes.create({
      data: {
        ...body,
        fechaActualizacion: new Date()
      }
    })

    return NextResponse.json(diagnostico, { status: 201 })

  } catch (error) {
    console.error('Error al crear diagnóstico de ente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
