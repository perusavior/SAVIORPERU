'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image' // Para el logo/loader, si lo necesitas

export default function CleanupPage() {
  const router = useRouter()
  const [message, setMessage] = useState(
    'Cerrando sesión y preparando tu viaje de regreso...'
  )
  const [errorOccurred, setErrorOccurred] = useState(false)

  useEffect(() => {
    const handleCleanupAndRedirect = () => {
      // 1. Limpieza de localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('dataDeliverySend') // ⬅️ **TU CLAVE DE LOCALSTORAGE**
        } catch (error) {
          setMessage(
            'Ocurrió un error al Cerrar Sesión. Redirigiendo igualmente...'
          )
          setErrorOccurred(true)
        }
      }

      // 2. Redirección
      router.replace('/')
    }

    // Ejecutar la lógica con un pequeño retraso
    const timer = setTimeout(handleCleanupAndRedirect, 1000) // Retraso de 1 segundo para ver el loader

    // Función de limpieza del efecto
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-black text-white p-4'>
      <div className='bg-gray-800 rounded-lg shadow-xl p-8 max-w-sm w-full text-center'>
        {/* Loader o Ícono de Carga */}
        {!errorOccurred ? (
          <div className='mb-6'>
            {/* Puedes reemplazar esto con un spinner SVG o una imagen de loader */}
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto'></div>
            {/* Si tuvieras un logo, podrías usarlo aquí después del spinner */}
            {/* <Image src="/path/to/your/logo.png" alt="Logo" width={64} height={64} className="mx-auto mt-4" /> */}
          </div>
        ) : (
          <div className='mb-6 text-red-400'>
            {/* Icono de error si lo deseas, o simplemente el mensaje */}
            <svg
              className='mx-auto h-12 w-12'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              ></path>
            </svg>
          </div>
        )}

        <h1 className='text-2xl font-bold mb-3 text-white'>
          {errorOccurred ? '¡Algo salió mal!' : 'Cerrando Sesión...'}
        </h1>
        <p className='text-gray-300 text-lg'>{message}</p>

        {/* Mensaje adicional si hay error */}
        {errorOccurred && (
          <p className='text-gray-400 text-sm mt-4'>
            Por favor, intenta de nuevo o contacta a soporte si el problema
            persiste.
          </p>
        )}
      </div>
    </div>
  )
}
