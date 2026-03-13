// app/api/cupones/codigo/[codigo]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params

    if (!codigo || typeof codigo !== 'string') {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
    }

    const cupon = await prisma.cupon.findFirst({
      where: {
        codigoCupon: codigo,
        mostrarCupon: true
      }
    })

    if (!cupon) {
      return NextResponse.json(
        { error: 'Cupón no encontrado o no disponible' },
        { status: 404 }
      )
    }

    return NextResponse.json(cupon, { status: 200 })
  } catch (error) {
    console.error('Error al buscar cupón:', error)
    return NextResponse.json(
      { error: 'Error al buscar el cupón' },
      { status: 500 }
    )
  }
}
