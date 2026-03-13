import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de producto destacado inválido' },
        { status: 400 }
      )
    }

    // Verificar si el producto destacado existe
    const destacado = await prisma.productosDestacados.findUnique({
      where: { id },
      include: {
        producto: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!destacado) {
      return NextResponse.json(
        { message: 'Producto destacado no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar relación de producto destacado
    await prisma.productosDestacados.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Producto removido de destacados exitosamente',
      data: {
        removedId: id,
        productoId: destacado.producto.id,
        productoName: destacado.producto.name
      }
    })
  } catch (error) {
    console.error('Error removiendo producto destacado:', error)
    return NextResponse.json(
      { message: 'Error interno al remover producto destacado' },
      { status: 500 }
    )
  }
}
