// app/api/cupones/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const cupon = await prisma.cupon.findUnique({
      where: { id }
    })

    if (!cupon) {
      return NextResponse.json(
        { error: 'Cupón no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(cupon, { status: 200 })
  } catch (error) {
    console.error('Error al obtener cupón:', error)
    return NextResponse.json(
      { error: 'Error al obtener el cupón' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()
    const { codigoCupon, mostrarCupon, descuento } = body

    // Validar si el cupón existe
    const existingCupon = await prisma.cupon.findUnique({
      where: { id }
    })

    if (!existingCupon) {
      return NextResponse.json(
        { error: 'Cupón no encontrado' },
        { status: 404 }
      )
    }

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

    // Verificar si el nuevo código ya existe en otro cupón
    if (codigoCupon && codigoCupon !== existingCupon.codigoCupon) {
      const duplicateCode = await prisma.cupon.findFirst({
        where: {
          codigoCupon,
          id: { not: id }
        }
      })

      if (duplicateCode) {
        return NextResponse.json(
          { error: 'El código de cupón ya está en uso' },
          { status: 409 }
        )
      }
    }

    const updatedCupon = await prisma.cupon.update({
      where: { id },
      data: {
        ...(codigoCupon !== undefined && { codigoCupon }),
        ...(mostrarCupon !== undefined && { mostrarCupon }),
        ...(descuento !== undefined && { descuento })
      }
    })

    return NextResponse.json(updatedCupon, { status: 200 })
  } catch (error) {
    console.error('Error al actualizar cupón:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el cupón' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Verificar si el cupón existe
    const existingCupon = await prisma.cupon.findUnique({
      where: { id }
    })

    if (!existingCupon) {
      return NextResponse.json(
        { error: 'Cupón no encontrado' },
        { status: 404 }
      )
    }

    await prisma.cupon.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Cupón eliminado correctamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error al eliminar cupón:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el cupón' },
      { status: 500 }
    )
  }
}
