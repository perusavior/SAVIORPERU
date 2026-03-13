import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const search = searchParams.get('search') || ''
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Construir filtros
    const where: any = {}

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    if (minPrice) {
      where.price = { gte: parseFloat(minPrice) }
    }

    if (maxPrice) {
      where.price = { ...where.price, lte: parseFloat(maxPrice) }
    }

    // Ordenamiento
    const orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'price') {
      orderBy.price = sortOrder
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = sortOrder
    } else {
      orderBy.createdAt = 'asc'
    }

    // Paginación
    const skip = (page - 1) * limit
    const take = limit

    // Obtener colecciones
    const [colecciones, total] = await Promise.all([
      prisma.coleccion.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.coleccion.count({ where })
    ])

    // Calcular estadísticas
    const stats = {
      totalColecciones: total,
      averagePrice:
        colecciones.length > 0
          ? colecciones.reduce((sum, c) => sum + c.price, 0) /
            colecciones.length
          : 0,
      minPrice:
        colecciones.length > 0
          ? Math.min(...colecciones.map((c) => c.price))
          : 0,
      maxPrice:
        colecciones.length > 0
          ? Math.max(...colecciones.map((c) => c.price))
          : 0
    }

    return NextResponse.json({
      message: 'Colecciones obtenidas exitosamente',
      data: {
        colecciones: colecciones.map((c) => ({
          ...c,
          price: Number(c.price)
        })),
        stats
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        search,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder
      }
    })
  } catch (error) {
    console.error('Error obteniendo colecciones:', error)
    return NextResponse.json(
      { message: 'Error interno al obtener colecciones' },
      { status: 500 }
    )
  }
}

// Esquema de validación
const createColeccionSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'Nombre muy largo'),
  price: z.number().positive('El precio debe ser mayor a 0').optional(),
  image: z.string().url('La imagen debe ser una URL válida')
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = createColeccionSchema.parse(body)

    const coleccionQuantity = await prisma.coleccion.findMany()

    if (coleccionQuantity.length === 4) {
      return NextResponse.json(
        { message: 'Ya no se admiten mas colecciones' },
        { status: 403 }
      )
    }

    // Verificar si ya existe una colección con ese nombre
    const existingColeccion = await prisma.coleccion.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: 'insensitive'
        }
      }
    })

    if (existingColeccion) {
      return NextResponse.json(
        { message: 'Ya existe una colección con ese nombre' },
        { status: 409 }
      )
    }

    // Crear colección
    const coleccion = await prisma.coleccion.create({
      data: {
        name: validatedData.name,
        ...(validatedData.price
          ? { price: validatedData.price }
          : { price: 0 }),
        image: validatedData.image
      }
    })

    return NextResponse.json(
      {
        message: 'Colección creada exitosamente',
        data: coleccion
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creando colección:', error)
    return NextResponse.json(
      { message: 'Error interno al crear colección' },
      { status: 500 }
    )
  }
}
