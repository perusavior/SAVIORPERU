import React from 'react'
import OrdersList from './OrdersList'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

const OrdersPage = async () => {
  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses[0]?.emailAddress

  if (!email) {
    return <div className='p-6'>Por favor, inicia sesión.</div>
  }

  try {
    // 1. Buscamos al usuario en la DB
    const dbUser = await prisma.user.findUnique({
      where: { email }
    })

    if (!dbUser) {
      return (
        <div className='p-6'>Usuario no encontrado en la base de datos.</div>
      )
    }

    // 2. TOTAL de órdenes (para la paginación)
    const totalOrders = await prisma.orders.count({
      where: { userId: dbUser.id }
    })

    // 3. Consultamos SOLO las primeras 10 órdenes
    const rawOrders = await prisma.orders.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      take: 10, // ← SOLO 10 registros
      include: {
        orderItems: {
          include: {
            producto: true
          }
        }
      }
    })

    // 4. ADAPTACIÓN COMPLETA con TODOS los campos
    const formattedOrders = rawOrders.map((order) => ({
      id: order.id,
      clientName: order.clientName || 'Sin nombre',
      status: order.status, // ← ESTE FALTABA
      totalPrice: order.totalPrice.toString(),
      createdAt: order.createdAt.toISOString(),
      address: order.address || undefined,
      agencia: order.agencia || undefined,
      clientPhone: order.clientPhone || undefined,
      dni: order.dni || undefined,
      locationToSend: order.locationToSend || undefined,
      deliveryCost: order.deliveryCost?.toString() || undefined,
      totalProducts: order.orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
      discount: order.discount?.toString() || undefined,
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        totalPrice: item.totalPrice.toString(),
        producto: {
          name: item.producto.name,
          price: item.producto.price.toString()
        }
      }))
    }))

    // 5. Estructura de paginación
    const pagination = {
      total: totalOrders,
      page: 0,
      limit: 10,
      totalPages: Math.ceil(totalOrders / 10) || 1
    }

    return (
      <div className='p-6 flex justify-center'>
        <OrdersList orders={formattedOrders} pagination={pagination} />
      </div>
    )
  } catch (error) {
    console.error('Error en OrdersPage:', error)
    return <div className='p-6'>Error crítico al cargar órdenes.</div>
  }
}

export default OrdersPage
