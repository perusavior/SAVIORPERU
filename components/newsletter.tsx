'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Newsletter() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    setEmail('')
  }

  return (
    <section className='bg-gray-100 py-12'>
      <div className='container mx-auto px-4'>
        <h2 className='text-3xl font-bold mb-4 text-center'>
          Subscribe to Our Newsletter
        </h2>
        <p className='text-center mb-6'>
          Stay updated with our latest collections and exclusive offers.
        </p>
        <form onSubmit={handleSubmit} className='max-w-md mx-auto flex gap-2'>
          <Input
            type='email'
            placeholder='Enter your email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type='submit'>Subscribe</Button>
        </form>
      </div>
    </section>
  )
}
