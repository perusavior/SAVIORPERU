'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const slides = [
  {
    image: '/placeholder.svg?height=600&width=1200',
    title: 'Summer Collection',
    description: 'Discover our new line of elegant handbags',
    cta: 'Shop Now'
  },
  {
    image: '/placeholder.svg?height=600&width=1200',
    title: 'Limited Edition',
    description: 'Exclusive designs for a limited time',
    cta: 'View Collection'
  },
  {
    image: '/placeholder.svg?height=600&width=1200',
    title: 'Seasonal Sale',
    description: 'Up to 50% off on selected items',
    cta: 'Shop Sale'
  }
]

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () =>
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
  const prevSlide = () =>
    setCurrentSlide(
      (prevSlide) => (prevSlide - 1 + slides.length) % slides.length
    )

  return (
    <div className='relative overflow-hidden rounded-lg h-[600px]'>
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image || '/placeholder.svg'}
            alt={slide.title}
            className='object-cover'
          />
          <div className='absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center'>
            <div className='text-center text-white'>
              <h2 className='text-4xl font-bold mb-4'>{slide.title}</h2>
              <p className='text-xl mb-6'>{slide.description}</p>
              <Button size='lg'>{slide.cta}</Button>
            </div>
          </div>
        </div>
      ))}
      <Button
        variant='outline'
        size='icon'
        className='absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80'
        onClick={prevSlide}
      >
        <ChevronLeft className='h-6 w-6' />
      </Button>
      <Button
        variant='outline'
        size='icon'
        className='absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80'
        onClick={nextSlide}
      >
        <ChevronRight className='h-6 w-6' />
      </Button>
    </div>
  )
}
