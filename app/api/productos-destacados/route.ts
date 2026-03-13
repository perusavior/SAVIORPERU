import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const search = searchParams.get('search') || ''

    // Construir filtros
    const where: any = {
      destacados: {
        some: {} // Solo productos que están en destacados
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Paginación
    const skip = (page - 1) * limit
    const take = limit

    // Obtener productos destacados
    const [destacados, total] = await Promise.all([
      prisma.productos.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          destacados: {
            select: { id: true, createdAt: true }
          },
          orderItems: {
            select: {
              quantity: true,
              createdAt: true
            },
            where: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
              }
            }
          }
        }
      }),
      prisma.productos.count({ where })
    ])

    // Obtener todos los productos para sugerencias (excluyendo ya destacados)
    // const allProducts = await prisma.productos.findMany({
    //   where: {
    //     NOT: {
    //       destacados: {
    //         some: {}
    //       }
    //     },
    //     stock: { gt: 0 } // Solo productos con stock
    //   },
    //   orderBy: [
    //     { stock: 'desc' }, // Primero los con más stock
    //     { createdAt: 'desc' }
    //   ],
    //   take: 20,
    //   select: {
    //     id: true,
    //     name: true,
    //     category: true,
    //     price: true,
    //     image: true,
    //     stock: true,
    //     estado: true,
    //     image2: true,
    //     size: true
    //   }
    // })

    // Formatear productos destacados
    const formattedDestacados = destacados.map((product) => {
      const totalSoldLast30Days = product.orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      )
      const destacadoInfo = product.destacados[0] // Siempre habrá al menos uno por el filtro

      return {
        id: product.id,
        name: product.name,
        category: product.category,
        price: Number(product.price),
        image: product.image,
        image2: product.image2,
        stock: product.stock,
        estado: product.estado,
        destacadoId: destacadoInfo.id,
        destacadoDesde: destacadoInfo.createdAt,
        salesLast30Days: totalSoldLast30Days,
        performanceScore: calculatePerformanceScore(
          totalSoldLast30Days,
          product.stock
        ),
        size: product.size
      }
    })

    // Calcular estadísticas
    const stats = {
      totalDestacados: total,
      averagePrice:
        destacados.length > 0
          ? destacados.reduce((sum, p) => sum + Number(p.price), 0) /
            destacados.length
          : 0,
      lowStockCount: destacados.filter((p) => p.stock <= 10).length,
      outOfStockCount: destacados.filter((p) => p.stock === 0).length
    }

    return NextResponse.json({
      message: 'Productos destacados obtenidos exitosamente',
      data: {
        destacados: formattedDestacados,
        // suggestions: allProducts, // Productos sugeridos para destacar
        stats
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        search
      }
    })
  } catch (error) {
    console.error('Error obteniendo productos destacados:', error)
    return NextResponse.json(
      { message: 'Error interno al obtener productos destacados' },
      { status: 500 }
    )
  }
}

// Función auxiliar para calcular puntaje de rendimiento
function calculatePerformanceScore(sales: number, stock: number): number {
  if (stock === 0) return 0 // Sin stock = mal rendimiento

  const salesScore = Math.min(sales / 10, 10) // Máximo 10 puntos por ventas
  const stockTurnover = sales / (stock || 1) // Rotación de inventario
  const turnoverScore = Math.min(stockTurnover * 5, 10) // Máximo 10 puntos por rotación

  return Number(((salesScore + turnoverScore) / 2).toFixed(1))
}

// Esquema de validación
const addDestacadoSchema = z.object({
  productoId: z.number().int().positive('ID de producto inválido')
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = addDestacadoSchema.parse(body)

    // Verificar si el producto existe
    const producto = await prisma.productos.findUnique({
      where: { id: validatedData.productoId },
      include: {
        destacados: true
      }
    })

    if (!producto) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si ya está destacado
    if (producto.destacados.length > 0) {
      return NextResponse.json(
        { message: 'El producto ya está destacado' },
        { status: 400 }
      )
    }

    // Verificar límite de productos destacados (opcional, ej: máximo 10)
    const totalDestacados = await prisma.productosDestacados.count()
    const MAX_DESTACADOS = 4

    if (totalDestacados >= MAX_DESTACADOS) {
      return NextResponse.json(
        {
          message: `Límite alcanzado: máximo ${MAX_DESTACADOS} productos destacados`,
          current: totalDestacados,
          limit: MAX_DESTACADOS
        },
        { status: 400 }
      )
    }

    // Crear relación de producto destacado
    const destacado = await prisma.productosDestacados.create({
      data: {
        productoId: validatedData.productoId
      },
      include: {
        producto: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            category: true
          }
        }
      }
    })

    return NextResponse.json(
      {
        message: 'Producto agregado a destacados exitosamente',
        data: destacado
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

    // Verificar si es error de duplicado (unique constraint)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { message: 'El producto ya está destacado' },
        { status: 409 }
      )
    }

    console.error('Error agregando producto destacado:', error)
    return NextResponse.json(
      { message: 'Error interno al agregar producto destacado' },
      { status: 500 }
    )
  }
}
