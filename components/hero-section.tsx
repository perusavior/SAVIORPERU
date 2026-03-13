'use client'

import React, { useState, useEffect, useRef } from 'react'
import styles from './hero-section.module.css'

interface Settings {
  imagenIzquierda?: string
  imagenDerecha?: string
  [key: string]: string | undefined
}

const HeroSection = () => {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(500)

  // Medir contenedor para altura dinámica
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        // Obtener altura del viewport o contenedor
        const height = window.innerHeight * 0.7 // 70% del viewport
        setContainerHeight(Math.max(400, height)) // Mínimo 400px
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/settings')

        if (!response.ok) throw new Error(`Error ${response.status}`)

        const data = await response.json()
        setSettings(data.data || {})
        setError(null)
      } catch (error) {
        console.error('Error cargando settings:', error)
        setError('No se pudieron cargar las imágenes')
        setSettings({})
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Skeleton con altura DINÁMICA
  if (loading) {
    return (
      <section className={styles.heroSection}>
        <div className='w-full'>
          <img
            src='/CargandoImagen.png'
            alt='Imagen izquierda'
            className='w-full h-full object-cover'
            onError={(e) => {
              e.currentTarget.src = '/placeholder-hero-left.jpg'
              e.currentTarget.alt = 'Imagen alternativa izquierda'
            }}
          />
        </div>
        <div className='w-full'>
          <img
            src='/CargandoImagen.png'
            alt='Imagen derecha'
            className='w-full h-full object-cover'
            onError={(e) => {
              e.currentTarget.src = '/placeholder-hero-right.jpg'
              e.currentTarget.alt = 'Imagen alternativa derecha'
            }}
          />
        </div>
      </section>
    )
  }

  // Versión final CORREGIDA
  return (
    <section className={styles.heroSection}>
      <div className='w-full flex-1'>
        <img
          src={settings.imagenIzquierda}
          alt='Imagen izquierda'
          className='w-full h-full object-cover'
          onError={(e) => {
            e.currentTarget.src = '/placeholder-hero-left.jpg'
            e.currentTarget.alt = 'Imagen alternativa izquierda'
          }}
        />
      </div>
      <div className='w-full flex-1'>
        <img
          src={settings.imagenDerecha}
          alt='Imagen derecha'
          className='w-full h-full object-cover'
          onError={(e) => {
            e.currentTarget.src = '/placeholder-hero-right.jpg'
            e.currentTarget.alt = 'Imagen alternativa derecha'
          }}
        />
      </div>
    </section>
  )
}

export default HeroSection
