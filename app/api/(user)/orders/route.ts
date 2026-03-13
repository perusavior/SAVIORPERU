import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const {
    address,
    agencia,
    clientName,
    clientPhone,
    deliveryCost,
    dni,
    getlocation,
    locationToSend,
    email,
    products,
    totalPrice,
    totalProducts,
    discount
  } = await req.json()

  try {
    const user = await prisma.user.findFirst({ where: { email } })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const newOrder = await prisma.orders.create({
      data: {
        address,
        agencia,
        clientName,
        clientPhone,
        deliveryCost,
        dni,
        getlocation,
        locationToSend,
        userId: user.id,
        orderItems: {
          create: products.map(
            (p: {
              productoId: number
              quantity: number
              totalPrice: number
              unitPrice: number
            }) => ({
              productoId: p.productoId,
              quantity: p.quantity,
              totalPrice: p.totalPrice,
              unitPrice: p.unitPrice
            })
          )
        },
        totalPrice,
        totalProducts,
        discount
      },
      include: {
        orderItems: {
          include: {
            producto: true // 👈 para devolver también los datos del producto
          }
        }
      }
    })

    return NextResponse.json(
      { message: 'Orden creada', data: newOrder },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creando orden:', error)
    return NextResponse.json(
      { message: 'Error interno al crear orden' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Filtros opcionales
    const status = searchParams.get('status')
    const clientName = searchParams.get('clientName')
    const email = searchParams.get('email')
    const minTotal = searchParams.get('minTotal')
    const maxTotal = searchParams.get('maxTotal')

    const where: any = {}

    if (status) {
      where.status = status
    }
    if (clientName) {
      where.clientName = { contains: clientName, mode: 'insensitive' }
    }
    if (email) {
      where.user = { email: { contains: email, mode: 'insensitive' } }
    }
    if (minTotal || maxTotal) {
      where.totalPrice = {}
      if (minTotal) where.totalPrice.gte = parseFloat(minTotal)
      if (maxTotal) where.totalPrice.lte = parseFloat(maxTotal)
    }

    const skip = (page - 1) * limit
    const take = limit

    // 🔹 Ejecutamos todas las consultas en paralelo para optimizar rendimiento
    const [
      orders,
      total,
      activeOrdersCount,
      soldItemsData,
      pendientesCount,
      totalAmountData
    ] = await Promise.all([
      // 1. Órdenes paginadas
      prisma.orders.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          orderItems: { include: { producto: true } }
        }
      }),
      // 2. Total de registros bajo el filtro actual
      prisma.orders.count({ where }),
      // 3. Órdenes activas (NO Cancelado)
      prisma.orders.count({
        where: { status: { not: 'Cancelado' } }
      }),
      // 4. Ítems vendidos (solo órdenes completadas)
      prisma.orders.aggregate({
        where: {
          status: { in: ['Pagado', 'Enviado', 'Entregado'] }
        },
        _sum: {
          totalProducts: true
        }
      }),
      // 5. NUEVO: Órdenes con status "Pendiente"
      prisma.orders.count({
        where: { status: 'Pendiente' }
      }),
      // 6. NUEVO: Suma total de totalPrice de órdenes completadas
      prisma.orders.aggregate({
        where: {
          status: { in: ['Pagado', 'Enviado', 'Entregado'] }
        },
        _sum: {
          totalPrice: true
        }
      })
    ])

    return NextResponse.json({
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        activeOrders: activeOrdersCount,
        soldItems: soldItemsData._sum.totalProducts || 0,
        pendientes: pendientesCount, // ✅ nuevo
        totalAmount: Number(totalAmountData._sum.totalPrice?.toFixed(2)) || 0 // ✅ nuevo
      }
    })
  } catch (error) {
    console.error('Error obteniendo órdenes:', error)
    return NextResponse.json(
      { message: 'Error interno al obtener órdenes' },
      { status: 500 }
    )
  }
}
