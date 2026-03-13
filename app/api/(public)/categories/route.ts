// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.categories.findMany({
      orderBy: {
        id: 'desc'
      }
    })

    return NextResponse.json(categories, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener las categorías' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    // Verificar si ya existe
    const existingCategory = await prisma.categories.findUnique({
      where: { name }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'La categoría ya existe' },
        { status: 409 }
      )
    }

    const category = await prisma.categories.create({
      data: { name }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear la categoría' },
      { status: 500 }
    )
  }
}
