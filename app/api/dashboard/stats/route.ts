import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@/app/generated/prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Crear filtro de fecha si se proporciona
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate)
    }

    const whereCondition = startDate || endDate ? { createdAt: dateFilter } : {}

    // Ejecutar todas las consultas en paralelo para mejor rendimiento
    const [
      totalOrders,
      totalRevenueResult,
      pendingOrders,
      completedOrders,
      recentOrders,
      ordersByStatus,
      topProducts,
      revenueByMonth
    ] = await Promise.all([
      // 1. Total de órdenes
      prisma.orders.count({ where: whereCondition }),

      // 2. Ingreso total (suma de totalPrice)
      prisma.orders.aggregate({
        where: whereCondition,
        _sum: {
          totalPrice: true,
          deliveryCost: true,
          discount: true
        }
      }),

      // 3. Órdenes pendientes
      prisma.orders.count({
        where: {
          ...whereCondition,
          status: 'Pendiente'
        }
      }),

      // 4. Órdenes completadas/entregadas
      prisma.orders.count({
        where: {
          ...whereCondition,
          OR: [{ status: 'Completado' }, { status: 'Entregado' }]
        }
      }),

      // 5. Órdenes recientes (últimas 10)
      prisma.orders.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          clientName: true,
          status: true,
          totalPrice: true,
          createdAt: true,
          orderItems: {
            select: {
              quantity: true
            }
          }
        }
      }),

      // 6. Órdenes por estado
      prisma.orders.groupBy({
        by: ['status'],
        where: whereCondition,
        _count: {
          id: true
        },
        _sum: {
          totalPrice: true
        }
      }),

      // 7. Productos más vendidos
      prisma.orderItem.groupBy({
        by: ['productoId'],
        where: {
          order: whereCondition
        },
        _sum: {
          quantity: true,
          totalPrice: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 10
      }),

      // 8. Ingresos por mes (últimos 6 meses)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as order_count,
          COALESCE(SUM("totalPrice" + "deliveryCost" - "discount"), 0) as revenue
        FROM "Orders"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        ${
          whereCondition.createdAt
            ? Prisma.sql`AND "createdAt" BETWEEN ${dateFilter.gte} AND ${dateFilter.lte}`
            : Prisma.empty
        }
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
      `
    ])

    // Obtener detalles de productos más vendidos
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const producto = await prisma.productos.findUnique({
          where: { id: item.productoId },
          select: { name: true, image: true }
        })
        return {
          productId: item.productoId,
          name: producto?.name || 'Producto no encontrado',
          image: producto?.image || null,
          quantitySold: item._sum.quantity || 0,
          revenue: item._sum.totalPrice || 0
        }
      })
    )

    // Calcular promedio por orden - CORRECCIÓN AQUÍ
    const averageOrderValueRaw =
      totalOrders > 0
        ? Number(totalRevenueResult._sum.totalPrice || 0) / totalOrders
        : 0
    const averageOrderValue =
      typeof averageOrderValueRaw === 'string'
        ? parseFloat(averageOrderValueRaw)
        : averageOrderValueRaw

    // Calcular tasa de conversión
    const conversionRateValue =
      totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0

    // Formatear respuesta
    const stats = {
      // Totales
      totalOrders,
      totalRevenue: Number(totalRevenueResult._sum.totalPrice || 0),
      totalDeliveryCost: Number(totalRevenueResult._sum.deliveryCost || 0),
      totalDiscount: Number(totalRevenueResult._sum.discount || 0),
      netRevenue:
        Number(totalRevenueResult._sum.totalPrice || 0) +
        Number(totalRevenueResult._sum.deliveryCost || 0) -
        Number(totalRevenueResult._sum.discount || 0),

      // Estados
      pendingOrders,
      completedOrders,
      cancelledOrders: await prisma.orders.count({
        where: { ...whereCondition, status: 'Cancelado' }
      }),

      // Métricas
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      conversionRate: `${conversionRateValue.toFixed(1)}%`,

      // Distribuciones
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = {
          count: item._count.id,
          revenue: Number(item._sum.totalPrice || 0)
        }
        return acc
      }, {} as Record<string, { count: number; revenue: number }>),

      // Top productos
      topProducts: topProductsWithDetails,

      // Órdenes recientes
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        clientName: order.clientName,
        status: order.status,
        total: Number(order.totalPrice),
        items: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
        date: order.createdAt
      })),

      // Serie temporal
      revenueByMonth: Array.isArray(revenueByMonth)
        ? revenueByMonth.map((row: any) => ({
            month: new Date(row.month).toLocaleString('es-PE', {
              month: 'short',
              year: 'numeric'
            }),
            orderCount: Number(row.order_count),
            revenue: Number(row.revenue)
          }))
        : [],

      // Otros datos útiles
      uniqueCustomers: await prisma.orders
        .groupBy({
          by: ['userId'],
          where: whereCondition,
          _count: { id: true }
        })
        .then((results) => results.length),

      averageItemsPerOrder:
        totalOrders > 0
          ? (
              await prisma.orderItem.aggregate({
                where: { order: whereCondition },
                _avg: { quantity: true }
              })
            )._avg.quantity || 0
          : 0
    }

    return NextResponse.json({
      message: 'Estadísticas obtenidas exitosamente',
      data: stats,
      filters: {
        startDate: startDate || 'No aplicado',
        endDate: endDate || 'No aplicado',
        period: startDate && endDate ? 'Personalizado' : 'Todo el tiempo'
      }
    })
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return NextResponse.json(
      { message: 'Error interno al obtener estadísticas' },
      { status: 500 }
    )
  }
}
