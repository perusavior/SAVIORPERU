import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { Role } from '@/app/generated/prisma/enums'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') as Role | null
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Construir filtros
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role) {
      where.role = role
    }

    // Ordenamiento
    const orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'email') {
      orderBy.email = sortOrder
    } else if (sortBy === 'orders') {
      // Ordenar por número de órdenes (necesita subquery)
    } else {
      orderBy.createdAt = sortOrder
    }

    // Paginación
    const skip = (page - 1) * limit
    const take = limit

    // Obtener usuarios con conteo de órdenes
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          clerkId: true,
          phone: true,
          dni: true,
          address: true,
          department: true,
          deliveryLocation: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    // Formatear respuesta
    const formattedUsers = users.map((user) => ({
      ...user,
      totalOrders: user._count.orders,
      lastOrder: null // Podrías agregar subquery para última orden
    }))

    return NextResponse.json({
      message: 'Usuarios obtenidos exitosamente',
      data: formattedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        search,
        role,
        sortBy,
        sortOrder
      }
    })
  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    return NextResponse.json(
      { message: 'Error interno al obtener usuarios' },
      { status: 500 }
    )
  }
}
