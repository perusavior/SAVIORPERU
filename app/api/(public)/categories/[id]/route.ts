// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const category = await prisma.categories.findUnique({
      where: { id }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(category, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener la categoría' },
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

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    // Verificar si la categoría existe
    const existingCategory = await prisma.categories.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si el nuevo nombre ya existe en otra categoría
    const duplicateName = await prisma.categories.findFirst({
      where: {
        name,
        id: { not: id }
      }
    })

    if (duplicateName) {
      return NextResponse.json(
        { error: 'El nombre ya está en uso por otra categoría' },
        { status: 409 }
      )
    }

    const updatedCategory = await prisma.categories.update({
      where: { id },
      data: { name }
    })

    return NextResponse.json(updatedCategory, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar la categoría' },
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

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Verificar si la categoría existe
    const existingCategory = await prisma.categories.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    await prisma.categories.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Categoría eliminada correctamente' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar la categoría' },
      { status: 500 }
    )
  }
}
