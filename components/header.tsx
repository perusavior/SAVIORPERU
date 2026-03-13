'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ClipboardList, Menu } from 'lucide-react'
import { MdOutlineShoppingCart, MdOutlineWork } from 'react-icons/md'
import { FaProductHunt } from 'react-icons/fa6'
import { IoIosMailUnread } from 'react-icons/io'
import { FaHome } from 'react-icons/fa'
import { GrUserAdmin } from 'react-icons/gr'
import { Button } from '@/components/ui/button'
import ShoppingCartPanel from './ShoppingCartPanel'
import { useCart } from '@/contexts/CartContext'
import { ThemeToggle } from './ThemeToggle'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { SignedIn, UserButton, useUser } from '@clerk/nextjs'
import { codigoCupon } from '@/data/cupon'
import './header.css'
import { dark } from '@clerk/themes'
import { useTheme } from 'next-themes'
import { useUserRole } from '@/hooks/useUserRole'

interface ProsItemsProduct {
  id: number
  name: string
  price: number
  image: string
  quantity: number
  size?: string
}

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { cartItems, removeFromCart, clearCart, getCartTotal } = useCart()
  const pathname = usePathname()
  const { isSignedIn, isLoaded, user } = useUser()
  const [disctount, setDiscount] = useState('')
  const { theme } = useTheme()
  const { isAdmin } = useUserRole()

  const getDiscount = () => {
    if (disctount === codigoCupon) {
      const calculateDiscount = ((getCartTotal() * 85) / 100).toFixed(2)
      return (Math.round(Number(calculateDiscount) * 10) / 10).toFixed(2)
    }
    return getCartTotal().toFixed(2)
  }

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
  }

  // useEffect(() => {
  //   const controller = new AbortController()

  //   if (isSignedIn) {
  //     fetch(`/api/users/${user.id}`, { signal: controller.signal })
  //       .then((response) => {
  //         if (!response.ok) throw new Error('Error en la respuesta')
  //         return response.json()
  //       })
  //       .then((data) => {
  //         if (data.data.role === 'ADMIN') {
  //           setIsAdmin('ADMIN')
  //         }
  //       })
  //       .catch((error) => {
  //         // Ignoramos el error si fue causado por la cancelación de la petición
  //         if (error.name !== 'AbortError') {
  //           console.error('Error fetching user:', error)
  //         }
  //       })
  //   }

  //   // 2. Función de limpieza (cleanup)
  //   return () => controller.abort()
  // }, [isSignedIn])

  return (
    <header className='header'>
      <div className='container py-4 flex items-center justify-between mx-auto'>
        <div className='flex items-center ml-3'>
          <Link href='/' className='text-2xl font-bold flex items-center gap-1'>
            <Image
              src='https://res.cloudinary.com/dkw7q1u6z/image/upload/v1745110576/Logo_mk3nez.jpg'
              width={40}
              height={40}
              alt='Logo'
              className='rounded-full'
            />
            <Image
              src='/NombreMarca.jpg'
              width={100}
              height={30}
              alt='Logo'
              className='rounded-full'
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className='hidden md:block'>
          <ul className='flex space-x-4'>
            <li>
              <Link
                href='/'
                className={`hover:text-slate-400 ${
                  pathname === '/' || pathname === '' ? 'text-slate-500' : ''
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href='/collection'
                className={`hover:text-slate-400 ${
                  pathname === '/collection' ? 'text-slate-500' : ''
                }`}
              >
                Productos
              </Link>
            </li>
            <li>
              <Link
                href='/about'
                className={`hover:text-slate-400 ${
                  pathname === '/about' ? 'text-slate-500' : ''
                }`}
              >
                Nosotros
              </Link>
            </li>
            <li>
              <Link
                href='/contact'
                className={`hover:text-slate-400 ${
                  pathname === '/contact' ? 'text-slate-500' : ''
                }`}
              >
                Contactanos
              </Link>
            </li>
          </ul>
        </nav>

        <div className='flex items-center max-md:pr-5'>
          <ThemeToggle />
          <button
            onClick={toggleCart}
            className='relative h-8 w-8 p-0 ml-2 md:ml-3'
          >
            <MdOutlineShoppingCart className='h-6 w-6' />
            {cartItems.length > 0 && (
              <span className='absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs'>
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </button>

          {/* // !  aqui abajo esta el Login Descomentar para seguir trabajando */}
          {!isLoaded ? (
            <span className='loader'></span>
          ) : isSignedIn ? (
            <div className='min-w-7 flex justify-center items-center'>
              <SignedIn>
                <UserButton
                  appearance={{
                    theme: theme === 'dark' ? dark : 'simple'
                  }}
                  userProfileProps={{
                    appearance: {
                      theme: theme === 'dark' ? dark : 'simple'
                    }
                  }}
                >
                  <UserButton.MenuItems>
                    {isAdmin && (
                      <UserButton.Link
                        label='Admin Savior'
                        labelIcon={
                          <GrUserAdmin className='w-full h-5 pb-1 justify-center items-center' />
                        }
                        href='/admin-panel'
                      />
                    )}
                    <UserButton.Link
                      label='Home'
                      labelIcon={
                        <FaHome className='w-full h-5 pb-1 justify-center items-center' />
                      }
                      href='/'
                    />
                    <UserButton.Link
                      label='Todos los Productos'
                      labelIcon={
                        <FaProductHunt className='w-full h-5 pb-1 justify-center items-center' />
                      }
                      href='/collection'
                    />
                    <UserButton.Link
                      label='Sobre Nosotros'
                      labelIcon={
                        <MdOutlineWork className='w-full h-5 pb-1 justify-center items-center' />
                      }
                      href='/about'
                    />
                    <UserButton.Link
                      label='Contactanos'
                      labelIcon={
                        <IoIosMailUnread className='w-full h-5 pb-1 justify-center items-center' />
                      }
                      href='/contact'
                    />
                    <UserButton.Link
                      label='Mis pedidos'
                      labelIcon={
                        <ClipboardList className='w-full pb-2 justify-center items-center' />
                      }
                      href='/orders'
                    />
                    <UserButton.Action label='manageAccount' />
                  </UserButton.MenuItems>
                </UserButton>
              </SignedIn>
            </div>
          ) : (
            <div className='hidden md:flex space-x-2'>
              <Link href='/sign-in'>
                <Button variant='ghost'>Login</Button>
              </Link>
              <Link href='/sign-up'>
                <Button>Register</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          {!isSignedIn && isLoaded && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant='ghost' size='icon' className='md:hidden'>
                  <Menu className='h-6 w-6' />
                </Button>
              </SheetTrigger>
              <SheetContent side='right' className='w-[250px] sm:w-[300px]'>
                <SheetHeader>
                  <SheetTitle className='sr-only'>
                    Menu de navegación
                  </SheetTitle>
                </SheetHeader>
                <div className='flex flex-col h-full'>
                  <div className='py-6'>
                    <nav className='flex flex-col space-y-4'>
                      <Link
                        href='/'
                        className='text-lg hover:text-primary'
                        onClick={() => setIsOpen(false)}
                      >
                        Home
                      </Link>
                      <Link
                        href='/collection'
                        className='text-lg hover:text-primary'
                        onClick={(e) => {
                          e.preventDefault()
                          setIsOpen(false)
                          setTimeout(() => {
                            window.location.href = '/collection'
                          }, 100)
                        }}
                      >
                        Productos
                      </Link>
                      <Link
                        href='/about'
                        className='text-lg hover:text-primary'
                        onClick={() => setIsOpen(false)}
                      >
                        Nosotros
                      </Link>
                      <Link
                        href='/contact'
                        className='text-lg hover:text-primary'
                        onClick={() => setIsOpen(false)}
                      >
                        Contactanos
                      </Link>
                    </nav>
                  </div>

                  {!isSignedIn && (
                    <div className='mt-auto pb-6 flex flex-col space-y-2'>
                      <Link href='/sign-in'>
                        <Button
                          variant='outline'
                          className='w-full'
                          onClick={() => setIsOpen(false)}
                        >
                          Login
                        </Button>
                      </Link>
                      <Link href='/sign-up'>
                        <Button
                          className='w-full'
                          onClick={() => setIsOpen(false)}
                        >
                          Register
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
      <ShoppingCartPanel
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </header>
  )
}
