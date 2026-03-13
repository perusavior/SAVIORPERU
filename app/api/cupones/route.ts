// app/api/cupones/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mostrar = searchParams.get('mostrar')

    let where = {}
    if (mostrar === 'true') {
      where = { mostrarCupon: true }
    } else if (mostrar === 'false') {
      where = { mostrarCupon: false }
    }

    const cupones = await prisma.cupon.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(cupones, { status: 200 })
  } catch (error) {
    console.error('Error al obtener cupones:', error)
    return NextResponse.json(
      { error: 'Error al obtener los cupones' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { codigoCupon, mostrarCupon, descuento } = body

    // Validaciones
    if (codigoCupon && typeof codigoCupon !== 'string') {
      return NextResponse.json(
        { error: 'El código debe ser una cadena de texto' },
        { status: 400 }
      )
    }

    if (
      descuento !== undefined &&
      (typeof descuento !== 'number' || descuento < 0 || descuento > 100)
    ) {
      return NextResponse.json(
        { error: 'El descuento debe ser un número entre 0 y 100' },
        { status: 400 }
      )
    }

    // Verificar si el código ya existe
    if (codigoCupon) {
      const existingCupon = await prisma.cupon.findFirst({
        where: { codigoCupon }
      })

      if (existingCupon) {
        return NextResponse.json(
          { error: 'El código de cupón ya existe' },
          { status: 409 }
        )
      }
    }

    const cupon = await prisma.cupon.create({
      data: {
        codigoCupon,
        mostrarCupon: mostrarCupon ?? false,
        descuento: descuento ?? 0
      }
    })

    return NextResponse.json(cupon, { status: 201 })
  } catch (error) {
    console.error('Error al crear cupón:', error)
    return NextResponse.json(
      { error: 'Error al crear el cupón' },
      { status: 500 }
    )
  }
}
