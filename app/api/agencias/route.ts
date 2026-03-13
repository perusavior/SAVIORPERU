import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // Solo debería haber un registro de agencias (configuración)
    const agencias = await prisma.agencia.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    // Si no existe, crear configuración por defecto
    if (!agencias) {
      const defaultAgencias = await prisma.agencia.create({
        data: {
          agencias: ['Agencia 1', 'Agencia 2', 'Agencia 3'],
          minimoDelivery: 10,
          maximoDelivery: 15
        }
      })

      return NextResponse.json({
        message: 'Configuración de agencias creada con valores por defecto',
        data: defaultAgencias
      })
    }

    return NextResponse.json({
      message: 'Configuración de agencias obtenida',
      data: agencias
    })
  } catch (error) {
    console.error('Error obteniendo configuración de agencias:', error)
    return NextResponse.json(
      { message: 'Error interno al obtener configuración de agencias' },
      { status: 500 }
    )
  }
}
