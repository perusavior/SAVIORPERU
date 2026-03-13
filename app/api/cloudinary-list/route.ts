import { v2 as cloudinary } from 'cloudinary'
import { NextResponse } from 'next/server'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const nextCursor = searchParams.get('next_cursor')
    const maxResults = searchParams.get('max_results') || '30'

    const result = await cloudinary.search
      .expression('resource_type:image')
      .sort_by('created_at', 'desc')
      .max_results(parseInt(maxResults))
      .next_cursor(nextCursor || undefined)
      .execute()

    return NextResponse.json({
      resources: result.resources,
      next_cursor: result.next_cursor,
      total_count: result.total_count,
      has_more: !!result.next_cursor // Para facilitar el frontend
    })
  } catch (error) {
    console.error('Error listing images:', error)
    return NextResponse.json(
      { error: 'Failed to list images' },
      { status: 500 }
    )
  }
}
