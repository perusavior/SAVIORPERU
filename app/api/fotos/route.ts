import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    // Solo debería haber un registro de fotos (configuración del sitio)
    const fotos = await prisma.fotos.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    // Si no existe, crear configuración por defecto
    if (!fotos) {
      const defaultFotos = await prisma.fotos.create({
        data: {
          imagenIzquierda: '/default-left.jpg',
          imagenDerecha: '/default-right.jpg',
          fotoTienda: '/default-store.jpg'
        }
      })

      return NextResponse.json({
        message: 'Configuración de fotos creada con valores por defecto',
        data: defaultFotos
      })
    }

    return NextResponse.json({
      message: 'Configuración de fotos obtenida',
      data: fotos
    })
  } catch (error) {
    console.error('Error obteniendo configuración de fotos:', error)
    return NextResponse.json(
      { message: 'Error interno al obtener configuración de fotos' },
      { status: 500 }
    )
  }
}

// Esquema de validación
const updateFotosSchema = z.object({
  imagenIzquierda: z
    .string()
    .url('URL de imagen izquierda inválida')
    .optional(),
  imagenDerecha: z.string().url('URL de imagen derecha inválida').optional(),
  fotoTienda: z.string().url('URL de foto de tienda inválida').optional()
})

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = updateFotosSchema.parse(body)

    // Verificar si existe configuración
    const existingFotos = await prisma.fotos.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    let fotosActualizadas

    if (existingFotos) {
      // Actualizar configuración existente
      fotosActualizadas = await prisma.fotos.update({
        where: { id: existingFotos.id },
        data: {
          imagenIzquierda: validatedData.imagenIzquierda,
          imagenDerecha: validatedData.imagenDerecha,
          fotoTienda: validatedData.fotoTienda,
          updatedAt: new Date()
        }
      })
    } else {
      // Crear nueva configuración
      fotosActualizadas = await prisma.fotos.create({
        data: {
          imagenIzquierda: validatedData.imagenIzquierda || '/default-left.jpg',
          imagenDerecha: validatedData.imagenDerecha || '/default-right.jpg',
          fotoTienda: validatedData.fotoTienda || '/default-store.jpg'
        }
      })
    }

    return NextResponse.json({
      message: 'Configuración de fotos actualizada',
      data: fotosActualizadas
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error actualizando configuración de fotos:', error)
    return NextResponse.json(
      { message: 'Error interno al actualizar configuración de fotos' },
      { status: 500 }
    )
  }
}
