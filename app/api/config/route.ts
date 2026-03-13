import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const [settings, cupones] = await Promise.all([
      prisma.setting.findMany(),
      prisma.cupon.findMany({
        orderBy: { updatedAt: 'desc' }
      })
    ])

    // Calcular timestamp de última modificación
    const lastUpdatedSettings = settings.reduce((latest, setting) => {
      // Nota: Si tus settings no tienen updatedAt, usa createdAt
      return latest
    }, new Date(0))

    const lastUpdatedCupones = cupones.reduce((latest, cupon) => {
      const updated = new Date(cupon.updatedAt)
      return updated > latest ? updated : latest
    }, new Date(0))

    const lastUpdated =
      lastUpdatedCupones > lastUpdatedSettings
        ? lastUpdatedCupones
        : lastUpdatedSettings

    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json({
      success: true,
      data: {
        settings: settingsObject,
        cupones,
        metadata: {
          lastUpdated: lastUpdated.toISOString(),
          etag: `"${Date.parse(lastUpdated.toString())}"`, // ETag simple
          totalCupones: cupones.length,
          totalSettings: settings.length
        }
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching config data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener la configuración'
      },
      { status: 500 }
    )
  }
}
