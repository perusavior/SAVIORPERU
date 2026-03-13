import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// GET - Obtener un producto por ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de producto inválido' },
        { status: 400 }
      )
    }

    const product = await prisma.productos.findUnique({
      where: { id },
      include: {
        destacados: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Producto encontrado',
      data: product
    })
  } catch (error) {
    console.error('Error obteniendo producto:', error)
    return NextResponse.json(
      { message: 'Error interno al obtener producto' },
      { status: 500 }
    )
  }
}

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1),
  estado: z.string().optional(),
  size: z.string().optional().nullable(),
  price: z.number().positive().optional(),
  image: z.string().url().optional(),
  image2: z.string().url().optional().nullable(),
  stock: z.number().int().min(0).optional(),
  destacado: z.boolean().optional(),
  newCategory: z.string().optional()
})

// PUT - Actualizar producto
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de producto inválido' },
        { status: 400 }
      )
    }

    const existingProduct = await prisma.productos.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const validatedData = updateProductSchema.parse(body)

    const findCategory = await prisma.categories.findFirst({
      where: { name: validatedData.category }
    })

    if (!findCategory) {
      await prisma.categories.create({
        data: { name: validatedData.category }
      })
    }

    const updatedProduct = await prisma.productos.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.category && { category: validatedData.category }),
        ...(validatedData.estado && { estado: validatedData.estado }),
        ...(validatedData.size !== undefined && { size: validatedData.size }),
        ...(validatedData.price && { price: validatedData.price }),
        ...(validatedData.image && { image: validatedData.image }),
        ...(validatedData.image2 !== undefined && {
          image2: validatedData.image2
        }),
        ...(validatedData.stock !== undefined && {
          stock: validatedData.stock
        }),
        updatedAt: new Date()
      }
    })

    // Manejar producto destacado
    if (validatedData.destacado !== undefined) {
      const existingDestacado = await prisma.productosDestacados.findUnique({
        where: { productoId: id }
      })

      if (validatedData.destacado && !existingDestacado) {
        await prisma.productosDestacados.create({
          data: { productoId: id }
        })
      } else if (!validatedData.destacado && existingDestacado) {
        await prisma.productosDestacados.delete({
          where: { productoId: id }
        })
      }
    }

    return NextResponse.json({
      message: 'Producto actualizado exitosamente',
      data: updatedProduct
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error actualizando producto:', error)
    return NextResponse.json(
      { message: 'Error interno al actualizar producto' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar producto
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de producto inválido' },
        { status: 400 }
      )
    }

    const existingProduct = await prisma.productos.findUnique({
      where: { id },
      include: {
        orderItems: { take: 1 },
        destacados: true
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    if (existingProduct.orderItems.length > 0) {
      return NextResponse.json(
        {
          message:
            'No se puede eliminar el producto porque tiene órdenes asociadas',
          suggestion: 'Puedes marcarlo como "No disponible" cambiando el estado'
        },
        { status: 400 }
      )
    }

    // Eliminar de destacados si existe (gracias al onDelete: Cascade no es necesario, pero lo dejo por claridad)
    if (existingProduct.destacados.length > 0) {
      await prisma.productosDestacados.delete({
        where: { productoId: id }
      })
    }

    await prisma.productos.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Producto eliminado exitosamente',
      deletedId: id
    })
  } catch (error) {
    console.error('Error eliminando producto:', error)
    return NextResponse.json(
      { message: 'Error interno al eliminar producto' },
      { status: 500 }
    )
  }
}
