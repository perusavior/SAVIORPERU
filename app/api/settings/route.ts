import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Esquema para validar el objeto Key-Value
// Acepta un objeto donde las llaves son strings y los valores strings (o números que pasaremos a string)
const settingsSchema = z.record(z.union([z.string(), z.number()]))

// GET - Obtener todas las configuraciones
export async function GET() {
  try {
    const settings = await prisma.setting.findMany()

    // Convertimos el array [ {key, value}, ... ] en un objeto { key: value }
    const settingsObject = Object.fromEntries(
      settings.map((s) => [s.key, s.value])
    )

    return NextResponse.json({
      message: 'Configuraciones obtenidas',
      data: settingsObject
    })
  } catch (error) {
    console.error('Error obteniendo settings:', error)
    return NextResponse.json(
      { message: 'Error interno al obtener configuraciones' },
      { status: 500 }
    )
  }
}

// POST/PUT - Actualizar múltiples configuraciones a la vez
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validamos que el formato sea { "key": "value" }
    const validatedData = settingsSchema.parse(body)

    // Usamos una transacción para asegurar que se guarden todos o ninguno
    const operations = Object.entries(validatedData).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      })
    )

    await prisma.$transaction(operations)

    return NextResponse.json({
      message: 'Configuraciones actualizadas exitosamente'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error actualizando settings:', error)
    return NextResponse.json(
      { message: 'Error interno al actualizar configuraciones' },
      { status: 500 }
    )
  }
}
