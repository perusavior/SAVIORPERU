import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Esquema de validación
const validateCuponSchema = z.object({
  codigoCupon: z.string().min(1, 'El código del cupón es requerido'),
  montoTotal: z
    .number()
    .positive('El monto total debe ser mayor a 0')
    .optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = validateCuponSchema.parse(body)

    // Buscar cupón
    const cupon = await prisma.cupon.findFirst({
      where: {
        codigoCupon: {
          equals: validatedData.codigoCupon,
          mode: 'insensitive'
        },
        mostrarCupon: true
      }
    })

    if (!cupon) {
      return NextResponse.json({
        isValid: false,
        message: 'Cupón no encontrado o no disponible'
      })
    }

    // Aquí podrías agregar más validaciones:
    // - Fechas de validez (si agregas campos de fecha en tu modelo)
    // - Límite de usos (si agregas contador de usos)
    // - Monto mínimo de compra
    // - Categorías o productos válidos
    // - Usuario específico

    // Ejemplo de validación adicional:
    // if (validatedData.montoTotal && validatedData.montoTotal < 100) {
    //   return NextResponse.json({
    //     isValid: false,
    //     message: 'El cupón requiere un monto mínimo de S/. 100'
    //   })
    // }

    return NextResponse.json({
      isValid: true,
      message: 'Cupón válido',
      data: {
        cuponId: cupon.id,
        codigoCupon: cupon.codigoCupon
        // Aquí podrías devolver información del descuento
        // Por ahora tu modelo no tiene % o monto de descuento
        // podrías agregar campos como:
        // - tipoDescuento: 'porcentaje' | 'monto_fijo'
        // - valorDescuento: number
        // - montoMinimo: number
        // - fechaInicio: Date
        // - fechaFin: Date
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error validando cupón:', error)
    return NextResponse.json(
      { message: 'Error interno al validar cupón' },
      { status: 500 }
    )
  }
}
