import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { Role } from '@/app/generated/prisma/enums'

export async function POST(req: NextRequest) {
  const { data } = await req.json()
  const email = data?.email_addresses?.[0]?.email_address || 'no-email'
  const name =
    `${data?.first_name || ''} ${data?.last_name || ''}`.trim() || 'no-name'

  try {
    // Crear o actualizar usuario con upsert
    const user = await prisma.user.upsert({
      where: { email: email },
      update: {
        clerkId: data?.id || 'no-clerk-id',
        name
      },
      create: {
        email: email,
        name,
        clerkId: data?.id || 'no-clerk-id',
        role: Role.USER
      }
    })

    // Caso especial: primer usuario se convierte en ADMIN
    if (user.id === 1 && user.role !== Role.ADMIN) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: Role.ADMIN }
      })
    } else {
      console.log(`User upserted: ${user.email}`, `User Role: ${user.role}`)
    }

    return NextResponse.json({ message: 'Received' }, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.message) {
      console.error('Error creating/updating user:', error.message)
    } else {
      console.error('Error creating/updating user:', error)
    }
    return NextResponse.json(
      { message: 'Error creating/updating user' },
      { status: 500 }
    )
  }
}
