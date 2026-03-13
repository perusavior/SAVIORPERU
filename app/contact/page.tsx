'use client'

import { MdOutlinePhoneIphone, MdOutlineMailOutline } from 'react-icons/md'
import Benefits from '@/components/benefits'
import { IoBookOutline } from 'react-icons/io5'
import Link from 'next/link'
import { useConfigData } from '@/hooks/useConfigData'
// import { FaFilePdf } from 'react-icons/fa6'
import { FaFilePdf } from 'react-icons/fa'
import { useEffect, useState } from 'react'

export default function Contact() {
  // const { getCorreo, getTelefono } = useConfigData()
  const [settings, setSettings] = useState({ telefono: '', correo: '' })
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')

        if (!response.ok) throw new Error(`Error ${response.status}`)

        const data = await response.json()
        setSettings(data.data || {})
      } catch (error) {
        console.error('Error cargando settings:', error)
        setSettings({ telefono: '', correo: '' })
      }
    }

    fetchSettings()
  }, [])

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>Contactanos</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-10'>
        <div>
          <h2 className='text-2xl font-semibold mb-4'>
            Informacion de contacto
          </h2>
          <p className='mb-2 flex gap-2 items-center'>
            <MdOutlineMailOutline />: {settings.correo}
          </p>
          <p className='mb-2 flex gap-2 items-center'>
            <MdOutlinePhoneIphone />: {settings.telefono}
          </p>
          <h3 className='text-xl font-semibold mt-6 mb-2'>Horio de atencion</h3>
          <p className='mb-1'>Lunes a Viernes: 9:00 AM - 6:00 PM</p>
          <p className='mb-1'>Sabado y Domingo: 10:00 AM - 4:00 PM</p>
        </div>
        <form className='flex flex-col'>
          <h2 className='flex items-center gap-2 text-2xl font-semibold mb-4'>
            <IoBookOutline /> Libro de Reclamaciones
          </h2>
          <ul className='list-decimal flex justify-start flex-col pl-5'>
            <li>
              Haz clic en el botón de abajo para descargar el formulario PDF .
            </li>
            <li>Una vez descargado, puedes:</li>
            <ul className='list-disc pl-5'>
              <li>
                Imprimirlo , rellenarlo a mano, tomarle una foto o escanearlo, y
                enviarlo por correo a: <strong>{settings.correo}.</strong>
              </li>
              <li>
                O rellenarlo digitalmente desde tu dispositivo usando cualquier
                app de PDF, y luego enviarlo al mismo correo:{' '}
                <strong>{settings.correo}.</strong>
              </li>
            </ul>
            <li>¡Listo! Nos pondremos en contacto contigo pronto.</li>
          </ul>
          <button className='rounded pt-5 text-background'>
            <Link
              href={`https://cdn.www.gob.pe/uploads/document/file/3510113/Anexo%20I%20DS%20N%20101-2022-PCM_.pdf.pdf`}
              className='linkWhatsapp'
              target='_blank'
            >
              Descargar Formato PDF <FaFilePdf className='h-6 w-6' />
            </Link>
          </button>
        </form>
      </div>
      <Benefits />
    </div>
  )
}
