'use client'

import { useEffect, useState } from 'react'
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Renderizar un placeholder durante SSR
  if (!mounted) {
    return (
      <section className='flex w-full h-full min-h-[70vh] justify-center items-center pt-10'>
        <div className='w-[380px] animate-pulse'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='h-7 bg-gray-200 rounded w-40 mx-auto mb-2'></div>
            <div className='h-4 bg-gray-200 rounded w-56 mx-auto'></div>
          </div>

          {/* Google button */}
          <div className='h-12 bg-gray-100 rounded-lg flex items-center px-4 mb-8'>
            <div className='w-5 h-5 bg-gray-300 rounded mr-3'></div>
            <div className='h-4 bg-gray-300 rounded w-40'></div>
          </div>

          {/* Name fields (two columns) */}
          <div className='grid grid-cols-2 gap-4 mb-6'>
            <div>
              <div className='h-4 bg-gray-200 rounded w-16 mb-2'></div>
              <div className='h-12 bg-gray-100 rounded-lg'></div>
            </div>
            <div>
              <div className='h-4 bg-gray-200 rounded w-20 mb-2'></div>
              <div className='h-12 bg-gray-100 rounded-lg'></div>
            </div>
          </div>

          {/* Email field */}
          <div className='mb-6'>
            <div className='h-4 bg-gray-200 rounded w-32 mb-2'></div>
            <div className='h-12 bg-gray-100 rounded-lg'></div>
          </div>

          {/* Password field */}
          <div className='mb-8'>
            <div className='h-4 bg-gray-200 rounded w-24 mb-2'></div>
            <div className='h-12 bg-gray-100 rounded-lg'></div>
          </div>

          {/* Continue button */}
          <div className='h-12 bg-gray-800 rounded-lg mb-6'></div>

          {/* Sign in link */}
          <div className='text-center'>
            <div className='h-4 bg-gray-200 rounded w-48 mx-auto'></div>
          </div>

          {/* Clerk footer */}
          <div className='mt-8 pt-6 border-t border-gray-100'>
            <div className='flex justify-between items-center'>
              <div className='h-3 bg-gray-200 rounded w-16'></div>
              <div className='h-3 bg-gray-300 rounded w-20'></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className='flex w-full h-full min-h-[70vh] justify-center items-center pt-10'>
      <SignUp
        appearance={{
          elements: {
            card: 'shadow-none',
            headerTitle: 'font-semibold',
            headerSubtitle: '',
            formFieldInput:
              'h-12 px-4 border border-gray-300 focus:outline-none focus:ring-0',
            formFieldLabel: 'text-sm font-medium',
            formButtonPrimary: 'h-12 text-base font-semibold w-full',
            socialButtonsBlockButton:
              'h-12 text-base font-medium bg-gray-200 hover:bg-cyan-200',
            dividerLine: 'bg-gray-200',
            dividerText: 'text-gray-500',
            badge: 'shadow-none'
          },
          layout: {
            socialButtonsPlacement: 'top'
          }
        }}
      />
    </section>
  )
}
