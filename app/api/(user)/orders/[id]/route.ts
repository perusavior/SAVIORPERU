import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Esquema de validación para actualizar orden
const updateOrderSchema = z.object({
  status: z
    .enum(['Pendiente', 'Pagado', 'Enviado', 'Entregado', 'Cancelado'])
    .optional(),
  address: z.string().optional(),
  agencia: z.string().optional(),
  clientPhone: z.string().optional(),
  deliveryCost: z.number().min(0).optional(),
  discount: z.number().min(0).max(100).optional()
})

// GET: Obtener detalle de una orden
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Cambiado a Promise
) {
  try {
    const { id: idParam } = await params // Esperamos los params
    const id = parseInt(idParam)

    if (isNaN(id))
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        user: true,
        orderItems: { include: { producto: true } }
      }
    })

    if (!order)
      return NextResponse.json(
        { message: 'Orden no encontrada' },
        { status: 404 }
      )

    return NextResponse.json({ data: order })
  } catch (error) {
    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}

const CONSUME_STOCK_STATUSES = ['Pagado', 'Enviado', 'Entregado']
const RELEASE_STOCK_PREV_STATUSES = ['Pagado', 'Enviado', 'Entregado']

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id))
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

    const body = await req.json()
    const validatedData = updateOrderSchema.parse(body)

    // Si no se actualiza el estado, no hay gestión de stock
    if (!validatedData.status) {
      const updatedOrder = await prisma.orders.update({
        where: { id },
        data: validatedData,
        include: { orderItems: { include: { producto: true } } }
      })
      return NextResponse.json({ message: 'Actualizado', data: updatedOrder })
    }

    const currentOrder = await prisma.orders.findUnique({
      where: { id },
      include: { orderItems: { include: { producto: true } } }
    })

    if (!currentOrder) {
      return NextResponse.json(
        { message: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    const oldStatus = currentOrder.status
    const newStatus = validatedData.status

    const shouldReduceStock =
      oldStatus === 'Pendiente' && CONSUME_STOCK_STATUSES.includes(newStatus)

    const shouldIncreaseStock =
      RELEASE_STOCK_PREV_STATUSES.includes(oldStatus) &&
      (newStatus === 'Cancelado' || newStatus === 'Pendiente')

    if (!shouldReduceStock && !shouldIncreaseStock) {
      const updatedOrder = await prisma.orders.update({
        where: { id },
        data: validatedData,
        include: { orderItems: { include: { producto: true } } }
      })
      return NextResponse.json({ message: 'Actualizado', data: updatedOrder })
    }

    // ✅ Validación adicional: si vamos a reducir stock, verificar disponibilidad
    if (shouldReduceStock) {
      for (const item of currentOrder.orderItems) {
        const product = await prisma.productos.findUnique({
          where: { id: item.productoId },
          select: { name: true, stock: true }
        })

        if (!product) {
          return NextResponse.json(
            { message: `Producto con ID ${item.productoId} no encontrado` },
            { status: 400 }
          )
        }

        if (product.stock < item.quantity) {
          return NextResponse.json(
            {
              message: `Stock insuficiente para el producto "${product.name}". Disponible: ${product.stock}, solicitado: ${item.quantity}`
            },
            { status: 400 }
          )
        }
      }
    }

    // Transacción atómica
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.orders.update({
        where: { id },
        data: validatedData,
        include: { orderItems: { include: { producto: true } } }
      })

      for (const item of updated.orderItems) {
        const adjustment = shouldReduceStock ? -item.quantity : item.quantity

        await tx.productos.update({
          where: { id: item.productoId },
          data: { stock: { increment: adjustment } }
        })
      }

      return updated
    })

    return NextResponse.json({ message: 'Actualizado', data: updatedOrder })
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ errors: error.errors }, { status: 400 })

    console.error('Error en PUT /orders/:id:', error)
    return NextResponse.json(
      { message: 'Error al actualizar la orden' },
      { status: 500 }
    )
  }
}

// 3. DELETE: Eliminar orden
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Cambiado a Promise
) {
  try {
    const { id: idParam } = await params // Esperamos los params
    const id = parseInt(idParam)

    if (isNaN(id))
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

    await prisma.orders.delete({ where: { id } })

    return NextResponse.json({ message: 'Orden eliminada correctamente' })
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar' }, { status: 500 })
  }
}
