'use client'

import { useEffect, useState } from 'react'
import styles from './hero-footerSection.module.css'
// import { imagenIzquierda } from '../data/fotosPortada'

const HeroFooterSection = () => {
  const [settings, setSettings] = useState({ imagenIzquierda: '' })
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')

        if (!response.ok) throw new Error(`Error ${response.status}`)

        const data = await response.json()
        setSettings(data.data || {})
      } catch (error) {
        console.error('Error cargando settings:', error)
        setSettings({ imagenIzquierda: '' })
      }
    }

    fetchSettings()
  }, [])
  return (
    <section className={styles.heroSection}>
      <div className='w-full'>
        <img
          src={settings.imagenIzquierda || '/CargandoImagen.png'}
          alt='Image 2'
          className='w-full h-full'
        />
      </div>
    </section>
  )
}

export default HeroFooterSection
