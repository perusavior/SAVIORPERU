import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { Role } from '@/app/generated/prisma/enums'
import { string, z } from 'zod'
import { clerkClient } from '@clerk/nextjs/server'

// En Next.js 15, params es una Promise que debe ser awaited
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params antes de acceder a sus propiedades
    const { id: idParam } = await params

    let id
    let where

    if (idParam.split('_')[0] === 'user') {
      id = idParam
      where = { clerkId: idParam }
    } else {
      id = parseInt(idParam)
      if (isNaN(id)) {
        return NextResponse.json(
          { message: 'ID de usuario inválido' },
          { status: 400 }
        )
      }
      where = { id }
    }

    const user = await prisma.user.findUnique({
      where,
      include: {
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            totalPrice: true,
            createdAt: true,
            orderItems: {
              select: {
                quantity: true,
                producto: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Calcular estadísticas del usuario
    const userStats = {
      totalOrders: await prisma.orders.count({
        where: { userId: user.id }
      }),
      totalSpent: await prisma.orders
        .aggregate({
          where: { userId: user.id },
          _sum: { totalPrice: true }
        })
        .then((result) => Number(result._sum.totalPrice || 0)),
      averageOrderValue: await prisma.orders
        .aggregate({
          where: { userId: user.id },
          _avg: { totalPrice: true }
        })
        .then((result) => Number(result._avg.totalPrice || 0)),
      lastOrderDate: await prisma.orders
        .findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        })
        .then((order) => order?.createdAt || null)
    }

    // Formatear respuesta
    const responseData = {
      ...user,
      password: undefined,
      orders: user.orders.map((order) => ({
        ...order,
        totalPrice: Number(order.totalPrice),
        totalItems: order.orderItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        productos: order.orderItems.map((item) => item.producto.name).join(', ')
      })),
      stats: userStats
    }

    return NextResponse.json({
      message: 'Usuario obtenido exitosamente',
      data: responseData
    })
  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    return NextResponse.json(
      { message: 'Error interno al obtener usuario' },
      { status: 500 }
    )
  }
}

// Esquema de validación para actualizar usuario
const updateUserSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  email: z.string().email('Email inválido').optional(),
  role: z.nativeEnum(Role).optional(),
  phone: z.string().optional().nullable(),
  dni: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  agencia: z.string().optional().nullable(),
  deliveryLocation: z.enum(['Lima', 'Provincia', 'Null']).optional()
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Obtener y validar datos
    const body = await req.json()
    const validatedData = updateUserSchema.parse(body)

    // Validaciones adicionales
    if (validatedData.email && validatedData.email !== existingUser.email) {
      // Verificar que el nuevo email no esté en uso
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })

      if (emailExists) {
        return NextResponse.json(
          { message: 'El email ya está en uso por otro usuario' },
          { status: 409 }
        )
      }
    }

    // Validar DNI único si se proporciona
    if (validatedData.dni && validatedData.dni !== existingUser.dni) {
      const dniExists = await prisma.user.findFirst({
        where: {
          dni: validatedData.dni,
          NOT: { id }
        }
      })

      if (dniExists) {
        return NextResponse.json(
          { message: 'El DNI ya está registrado por otro usuario' },
          { status: 409 }
        )
      }
    }

    // No permitir cambiar el rol del usuario con ID 1 (admin principal)
    if (id === 1 && validatedData.role && validatedData.role !== Role.ADMIN) {
      return NextResponse.json(
        {
          message: 'No se puede cambiar el rol del administrador principal',
          suggestion: 'El usuario con ID 1 debe permanecer como ADMIN'
        },
        { status: 400 }
      )
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
        phone: validatedData.phone,
        dni: validatedData.dni,
        address: validatedData.address,
        department: validatedData.department,
        agencia: validatedData.agencia,
        deliveryLocation: validatedData.deliveryLocation,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Usuario actualizado exitosamente',
      data: {
        ...updatedUser,
        totalOrders: updatedUser._count.orders
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error actualizando usuario:', error)
    return NextResponse.json(
      { message: 'Error interno al actualizar usuario' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    const client = await clerkClient()

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    if (!existingUser) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Validaciones antes de eliminar

    // 1. No permitir eliminar al usuario con ID 1 (admin principal)
    if (id === 1) {
      return NextResponse.json(
        {
          message: 'No se puede eliminar al administrador principal',
          suggestion:
            'En su lugar, puedes desactivar su cuenta o cambiar sus permisos'
        },
        { status: 400 }
      )
    }

    // 2. Verificar si el usuario tiene órdenes
    if (existingUser._count.orders > 0) {
      return NextResponse.json(
        {
          message: 'No se puede eliminar un usuario con órdenes asociadas',
          orderCount: existingUser._count.orders,
          suggestion:
            'En su lugar, puedes desactivar la cuenta manteniendo el historial de órdenes'
        },
        { status: 400 }
      )
    }

    // 3. Verificar si es el último admin
    if (existingUser.role === Role.ADMIN) {
      const adminCount = await prisma.user.count({
        where: { role: Role.ADMIN }
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          {
            message: 'No se puede eliminar al único administrador',
            suggestion: 'Primero promueve a otro usuario a ADMIN'
          },
          { status: 400 }
        )
      }
    }

    // Eliminar usuario
    await prisma.user.delete({
      where: { id }
    })

    await client.users.deleteUser(existingUser.clerkId as string)

    return NextResponse.json({
      message: 'Usuario eliminado exitosamente',
      data: {
        deletedId: id,
        deletedEmail: existingUser.email,
        deletedName: existingUser.name,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error eliminando usuario:', error)

    // Manejar errores de integridad referencial
    if (
      error instanceof Error &&
      error.message.includes('Foreign key constraint')
    ) {
      return NextResponse.json(
        {
          message: 'No se puede eliminar el usuario debido a dependencias',
          suggestion: 'Primero elimina o transfiere sus datos asociados'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Error interno al eliminar usuario' },
      { status: 500 }
    )
  }
}

// Esquema de validación para cambiar rol
const changeRoleSchema = z.object({
  role: z.nativeEnum(Role, {
    errorMap: () => ({
      message: 'Rol inválido. Valores permitidos: USER, EDITOR, ADMIN'
    })
  })
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // No permitir cambiar el rol del usuario con ID 1
    if (id === 1) {
      return NextResponse.json(
        {
          message: 'No se puede cambiar el rol del administrador principal',
          suggestion: 'El usuario con ID 1 debe permanecer como ADMIN'
        },
        { status: 400 }
      )
    }

    // Obtener y validar datos
    const body = await req.json()
    const validatedData = changeRoleSchema.parse(body)

    // Verificar si ya tiene ese rol
    if (existingUser.role === validatedData.role) {
      return NextResponse.json(
        {
          message: `El usuario ya tiene el rol ${validatedData.role}`,
          currentRole: existingUser.role
        },
        { status: 400 }
      )
    }

    // Verificar si es el último admin y quiere cambiar a otro rol
    if (existingUser.role === Role.ADMIN && validatedData.role !== Role.ADMIN) {
      const adminCount = await prisma.user.count({
        where: { role: Role.ADMIN }
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          {
            message: 'No se puede quitar el rol ADMIN al único administrador',
            suggestion: 'Primero promueve a otro usuario a ADMIN'
          },
          { status: 400 }
        )
      }
    }

    // Actualizar rol
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role: validatedData.role,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: `Rol cambiado exitosamente a ${validatedData.role}`,
      data: {
        userId: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        oldRole: existingUser.role,
        newRole: updatedUser.role,
        changedAt: new Date()
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error cambiando rol de usuario:', error)
    return NextResponse.json(
      { message: 'Error interno al cambiar rol de usuario' },
      { status: 500 }
    )
  }
}
