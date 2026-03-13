import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Esquema de validación
const updateAgenciasSchema = z.object({
  agencias: z
    .array(z.string())
    .min(1, 'Debe haber al menos una agencia')
    .optional(),
  minimoDelivery: z
    .number()
    .min(0, 'El mínimo no puede ser negativo')
    .optional(),
  maximoDelivery: z
    .number()
    .min(0, 'El máximo no puede ser negativo')
    .optional()
})

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de agencia inválido' },
        { status: 400 }
      )
    }

    // Verificar si la configuración existe
    const existingAgencia = await prisma.agencia.findUnique({
      where: { id }
    })

    if (!existingAgencia) {
      return NextResponse.json(
        { message: 'Configuración de agencias no encontrada' },
        { status: 404 }
      )
    }

    // Obtener y validar datos
    const body = await req.json()
    const validatedData = updateAgenciasSchema.parse(body)

    // Validar que maximoDelivery sea mayor o igual a minimoDelivery
    if (
      validatedData.minimoDelivery !== undefined &&
      validatedData.maximoDelivery !== undefined
    ) {
      if (validatedData.maximoDelivery < validatedData.minimoDelivery) {
        return NextResponse.json(
          { message: 'El máximo de delivery no puede ser menor que el mínimo' },
          { status: 400 }
        )
      }
    } else if (
      validatedData.minimoDelivery !== undefined &&
      validatedData.maximoDelivery === undefined &&
      validatedData.minimoDelivery > existingAgencia.maximoDelivery
    ) {
      return NextResponse.json(
        {
          message: `El nuevo mínimo (${validatedData.minimoDelivery}) no puede ser mayor que el máximo actual (${existingAgencia.maximoDelivery})`,
          currentMax: existingAgencia.maximoDelivery
        },
        { status: 400 }
      )
    } else if (
      validatedData.maximoDelivery !== undefined &&
      validatedData.minimoDelivery === undefined &&
      validatedData.maximoDelivery < existingAgencia.minimoDelivery
    ) {
      return NextResponse.json(
        {
          message: `El nuevo máximo (${validatedData.maximoDelivery}) no puede ser menor que el mínimo actual (${existingAgencia.minimoDelivery})`,
          currentMin: existingAgencia.minimoDelivery
        },
        { status: 400 }
      )
    }

    // Actualizar configuración
    const agenciaActualizada = await prisma.agencia.update({
      where: { id },
      data: {
        agencias: validatedData.agencias,
        minimoDelivery: validatedData.minimoDelivery,
        maximoDelivery: validatedData.maximoDelivery,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Configuración de agencias actualizada',
      data: agenciaActualizada
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error actualizando configuración de agencias:', error)
    return NextResponse.json(
      { message: 'Error interno al actualizar configuración de agencias' },
      { status: 500 }
    )
  }
}
