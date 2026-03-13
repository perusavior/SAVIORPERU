'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa'
export default function Footer() {
  const [settings, setSettings] = useState({
    instagram: '',
    facebook: '',
    tiktok: ''
  })
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')

        if (!response.ok) throw new Error(`Error ${response.status}`)

        const data = await response.json()
        setSettings(data.data || {})
      } catch (error) {
        console.error('Error cargando settings:', error)
        setSettings({ instagram: '', facebook: '', tiktok: '' })
      }
    }

    fetchSettings()
  }, [])
  return (
    <footer className='bg-secondary text-foreground'>
      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div>
            <h3 className='font-bold mb-2'>Quick Links</h3>
            <ul className='space-y-2'>
              <li>
                <Link href='/' className='hover:text-primary'>
                  Home
                </Link>
              </li>
              <li>
                <Link href='/collection' className='hover:text-primary'>
                  Productos
                </Link>
              </li>
              <li>
                <Link href='/about' className='hover:text-primary'>
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href='/contact' className='hover:text-primary'>
                  Contactanos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className='font-bold mb-2'>Follow Us</h3>
            <div className='flex flex-col'>
              {settings.facebook && (
                <Link
                  href={settings.facebook}
                  className='hover:text-primary flex items-center gap-1 mb-2'
                  target='_blank'
                >
                  <FaFacebook className='h-8 w-7' /> Facebook
                </Link>
              )}
              {settings.instagram && (
                <Link
                  href={settings.instagram}
                  className='hover:text-primary flex items-center gap-1 mb-2'
                  target='_blank'
                >
                  <FaInstagram className='h-8 w-7' /> Instagram
                </Link>
              )}
              {settings.tiktok && (
                <Link
                  href={settings.tiktok}
                  className='hover:text-primary flex items-center gap-1 mb-2'
                  target='_blank'
                >
                  <FaTiktok className='h-8 w-7' /> Tiktok
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className='mt-8 text-center text-sm text-gray-500'>
          © 2025 Savior. Todos los derechos reservados. By{' '}
          <Link
            href='https://marteldev.com/'
            target='_blank'
            className='text-foreground'
          >
            Terry
          </Link>
        </div>
      </div>
    </footer>
  )
}
