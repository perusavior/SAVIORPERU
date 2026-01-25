'use client'

import React, { useState, useEffect } from 'react'
import OdersManagement from './components/Orders'
import {
  MdInventory2,
  MdShoppingBag,
  MdGroups2,
  MdSettings
} from 'react-icons/md'
import { BiSolidCoupon } from 'react-icons/bi'
import { IoGridSharp } from 'react-icons/io5'
import { Toaster } from 'sonner'
import UserManagement from './components/UserManagement'
import ProductsManagement from './components/products/ProductsManagement'
import SettingsManagement from './components/SettingsManagement'
import CuponesCRUD from './components/CuponesCRUD'

const paths = [
  { name: 'Órdenes', path: 'orders', icon: MdShoppingBag },
  { name: 'Productos', path: 'products', icon: MdInventory2 },
  { name: 'Usuarios', path: 'users', icon: MdGroups2 },
  { name: 'Cupones', path: 'coupon', icon: BiSolidCoupon },
  { name: 'Configuracion', path: 'settings', icon: MdSettings }
]

const AdminPanel = () => {
  // Estado inicial basado en localStorage o por defecto 'orders'
  const [panel, setPanel] = useState<string>('')

  // Efecto para cargar el panel guardado al montar
  useEffect(() => {
    const savedPanel = sessionStorage.getItem('admin-panel')
    if (savedPanel && paths.some((p) => p.path === savedPanel)) {
      setPanel(savedPanel)
    } else {
      setPanel('orders')
    }
    return () => sessionStorage.setItem('admin-panel', '')
  }, [])

  // Función para cambiar panel y guardar en localStorage
  const handleSetPanel = (newPanel: string) => {
    setPanel(newPanel)
    sessionStorage.setItem('admin-panel', newPanel)
  }

  return (
    <>
      <div className='flex w-full bg-gray-50 font-sans antialiased text-gray-900 dark:bg-gray-900 dark:text-gray-100'>
        {/* Notificaciones Toast */}
        <Toaster position='top-right' richColors />

        {/* Sidebar */}
        <aside className='hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex dark:bg-gray-800 dark:border-gray-700  pb-12'>
          <div className='flex h-16 items-center px-6 border-b border-gray-100 dark:border-gray-700'>
            <div className='flex items-center gap-2'>
              <IoGridSharp className='text-blue-600 text-2xl dark:text-blue-400' />
              <h1 className='text-lg font-bold tracking-tight text-gray-900 dark:text-white'>
                Admin E-com
              </h1>
            </div>
          </div>
          <div className='flex flex-1 flex-col justify-between overflow-y-auto px-4 py-6'>
            <nav className='flex flex-col gap-1'>
              {paths.map((item) => (
                <button
                  key={item.name}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                    item.path === panel
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={() => handleSetPanel(item.path)}
                >
                  <item.icon size={20} />
                  <span className='text-sm font-medium'>{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>
        {panel === 'users' ? (
          <UserManagement />
        ) : panel === 'products' ? (
          <ProductsManagement />
        ) : panel === 'settings' ? (
          <SettingsManagement />
        ) : panel === 'coupon' ? (
          <CuponesCRUD />
        ) : (
          <OdersManagement />
        )}
      </div>
    </>
  )
}

export default AdminPanel
