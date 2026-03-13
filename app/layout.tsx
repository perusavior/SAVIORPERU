import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { CartProvider } from '@/contexts/CartContext'
import type React from 'react' // Import React
import { Suspense } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'
import { esMX } from '@clerk/localizations'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { ConfigProvider } from '@/contexts/ConfigContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Savior | Calidad y Estilo',
  description:
    'Descubre nuestra colección de ropa con diseños únicos. Polos, gorros y más.',
  keywords: 'ropa, polos, gorros, moda, casacas, pantalones',
  openGraph: {
    title: 'Savior | Ropa de tendencia',
    description: 'Descubre nuestra colección de ropa con diseños únicos',
    type: 'website',
    locale: 'es_PE',
    siteName: 'Savior',
    url: 'https://savior.vercel.app',
    images: [
      {
        url: 'https://res.cloudinary.com/dkw7q1u6z/image/upload/v1745110576/Logo_mk3nez.jpg',
        width: 1200,
        height: 630,
        alt: 'Savior Logo',
        type: 'image/jpeg'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Savior | Ropa de tendencia',
    description: 'Descubre nuestra colección de ropa con diseños únicos',
    images: [
      'https://res.cloudinary.com/dkw7q1u6z/image/upload/v1745110576/Logo_mk3nez.jpg'
    ]
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: 'https://res.cloudinary.com/dkw7q1u6z/image/upload/v1745110576/Logo_mk3nez.jpg'
  }
}

const customEs = {
  ...esMX,
  signIn: {
    ...esMX.signIn,
    start: {
      ...esMX.signIn?.start,
      subtitle: 'para continuar con Savior'
    }
  },
  signUp: {
    ...esMX.signUp,
    start: { ...esMX.signUp?.start, subtitle: 'para continuar con Savior' }
  },
  formFieldHintText__optional: ''
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const SIGN_OUT_URL = '/cleanup-session'
  return (
    <ClerkProvider localization={customEs} afterSignOutUrl={SIGN_OUT_URL}>
      <html lang='en' suppressHydrationWarning>
        <body className={`${inter.className} body`}>
          <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
            <CartProvider>
              <AuthProvider>
                <ConfigProvider>
                  <Header />
                  <Suspense>
                    <main className='pt-[72px]'>{children}</main>
                  </Suspense>
                  <Footer />
                </ConfigProvider>
              </AuthProvider>
            </CartProvider>
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
