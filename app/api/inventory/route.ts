import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const estado = searchParams.get('estado') || ''
    const minStock = searchParams.get('minStock')
    const maxStock = searchParams.get('maxStock')
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true'
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Construir filtros
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.category = category
    }

    if (estado) {
      where.estado = estado
    }

    if (minStock) {
      where.stock = { gte: parseInt(minStock) }
    }

    if (maxStock) {
      where.stock = { ...where.stock, lte: parseInt(maxStock) }
    }

    if (lowStockOnly) {
      where.stock = { ...where.stock, lte: 10 } // Considerar bajo stock <= 10 unidades
    }

    // Ordenamiento
    const orderBy: any = {}
    if (sortBy === 'stock') {
      orderBy.stock = sortOrder
    } else if (sortBy === 'price') {
      orderBy.price = sortOrder
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder
    } else {
      orderBy.name = 'asc'
    }

    // Paginación
    const skip = (page - 1) * limit
    const take = limit

    // Obtener productos con estadísticas de ventas
    const [products, total] = await Promise.all([
      prisma.productos.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          name: true,
          category: true,
          estado: true,
          price: true,
          image: true,
          stock: true,
          size: true,
          createdAt: true,
          updatedAt: true,
          destacados: {
            select: { id: true }
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

    // Calcular estadísticas adicionales
    const allCategories = await prisma.productos.groupBy({
      by: ['category'],
      _count: { id: true },
      _sum: { stock: true }
    })

    const inventoryStats = {
      totalProducts: await prisma.productos.count(),
      totalStock: await prisma.productos
        .aggregate({
          _sum: { stock: true }
        })
        .then((result) => result._sum.stock || 0),
      outOfStock: await prisma.productos.count({
        where: { stock: 0 }
      }),
      lowStock: await prisma.productos.count({
        where: { stock: { lte: 10, gt: 0 } }
      }),
      categories: allCategories.map((cat) => ({
        name: cat.category,
        count: cat._count.id,
        totalStock: cat._sum.stock || 0
      }))
    }

    // Formatear productos con métricas
    const formattedProducts = products.map((product) => {
      const totalSoldLast30Days = product.orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      )
      const isLowStock = product.stock <= 10
      const isOutOfStock = product.stock === 0

      // Calcular tasa de venta diaria aproximada
      const dailySalesRate =
        totalSoldLast30Days > 0 ? (totalSoldLast30Days / 30).toFixed(2) : '0.00' // <-- Ahora siempre es string

      // Calcular días hasta agotar stock (si hay ventas)
      const daysUntilOutOfStock =
        totalSoldLast30Days > 0 && product.stock > 0
          ? Math.floor(product.stock / (totalSoldLast30Days / 30))
          : Infinity

      return {
        ...product,
        price: Number(product.price),
        isDestacado: product.destacados.length > 0,
        salesLast30Days: totalSoldLast30Days,
        dailySalesRate: parseFloat(dailySalesRate),
        daysUntilOutOfStock,
        stockStatus: isOutOfStock
          ? 'out-of-stock'
          : isLowStock
          ? 'low'
          : 'normal',
        stockStatusColor: isOutOfStock
          ? 'red'
          : isLowStock
          ? 'orange'
          : 'green',
        needsRestock: isLowStock || isOutOfStock,
        restockPriority: isOutOfStock ? 'high' : isLowStock ? 'medium' : 'low'
      }
    })

    return NextResponse.json({
      message: 'Inventario obtenido exitosamente',
      data: {
        products: formattedProducts,
        stats: inventoryStats
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        search,
        category,
        estado,
        minStock,
        maxStock,
        lowStockOnly,
        sortBy,
        sortOrder
      }
    })
  } catch (error) {
    console.error('Error obteniendo inventario:', error)
    return NextResponse.json(
      { message: 'Error interno al obtener inventario' },
      { status: 500 }
    )
  }
}
