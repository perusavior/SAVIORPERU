import { v2 as cloudinary } from 'cloudinary'
import { NextResponse } from 'next/server'

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

/**
 * Extrae el public_id de una URL de Cloudinary
 * Soporta carpetas y elimina la extensión del archivo
 */
const getPublicIdFromUrl = (url: string): string => {
  const parts = url.split('/')
  const uploadIndex = parts.indexOf('upload')

  // Las versiones (v1234567) vienen después de 'upload', las ignoramos (+2)
  const pathParts = parts.slice(uploadIndex + 2)
  const lastPart = pathParts.pop() || '' // "nombre_imagen.jpg"
  const publicIdWithoutExtension = lastPart.split('.')[0]

  if (pathParts.length > 0) {
    return `${pathParts.join('/')}/${publicIdWithoutExtension}`
  }
  return publicIdWithoutExtension
}

export async function POST(request: Request) {
  try {
    const { imageUrl }: { imageUrl: string } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { message: 'La URL es requerida' },
        { status: 400 }
      )
    }

    const publicId = getPublicIdFromUrl(imageUrl)

    // Tipado de la respuesta de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result === 'ok') {
      return NextResponse.json({
        message: 'Imagen borrada correctamente',
        publicId
      })
    }

    return NextResponse.json(
      {
        message: 'Cloudinary no pudo borrar la imagen',
        detail: result
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error en Cloudinary Delete:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
