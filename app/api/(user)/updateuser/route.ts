import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { Role } from '@/app/generated/prisma/enums'

export async function POST(req: NextRequest) {
  const { data } = await req.json()

  try {
    if (data.role) {
      await prisma.user.update({
        where: { clerkId: data.id },
        data: {
          role: data.role === 'EDITOR' ? Role.EDITOR : Role.USER
        }
      })
    } else {
      await prisma.user.update({
        where: { clerkId: data?.id },
        data: {
          email: data?.email_addresses[0]?.email_address || 'no-email',
          name: `${data?.first_name || ''} ${data?.last_name || ''}`.trim()
        }
      })
    }

    return NextResponse.json({ message: 'Received' }, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.message) {
      console.log('Error creating user:', error.message)
    } else {
      console.error('Error creating user:', error)
    }
    return NextResponse.json(
      { message: 'Error creating user' },
      { status: 500 }
    )
  }
}
