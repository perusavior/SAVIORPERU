import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/collection',
  '/about',
  '/contact',
  '/api/sign-in',
  '/api/sign-up',
  '/api/products',
  '/api/orders',
  '/cleanup-session',
  '/api/productos-destacados',
  '/api/users',
  '/api/categories',
  '/api/colecciones',
  '/api/settings',
  '/api/config',
  '/api/cupones',
  '/api/updateuser'
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
}
