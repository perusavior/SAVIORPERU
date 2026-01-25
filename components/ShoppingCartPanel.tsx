'use client'

import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import './ShoppingCartPanel.css'
import { useEffect, useState } from 'react'
// import { codigoCupon, mostrarCupon } from '../data/cupon'
import { LuLoaderCircle } from 'react-icons/lu'

import { LatLng } from 'leaflet'
import FormToSend from './formToSend'

interface ShoppingCartPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface ProsItemsProduct {
  id: number
  name: string
  price: number
  image: string
  quantity: number
  size?: string
}

export default function ShoppingCartPanel({
  isOpen,
  onClose
}: ShoppingCartPanelProps) {
  const { cartItems, removeFromCart, clearCart, getCartTotal } = useCart()
  const [itemsProducts, setItemsProducts] = useState<ProsItemsProduct[]>([])
  const [showCardClientName, setShowCardClientName] = useState(false)
  const [discount, setDiscount] = useState('')
  // const [location, setLocation] = useState<LatLng | null>(null)
  const [cuponCode, setCuponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [codigoCupon, setCodigoCupon] = useState('')
  const [descuento, setDescuento] = useState(0)
  const [cuponError, setCuponError] = useState('')
  const [subTotal, setSubTotal] = useState('')

  const getDiscount = (discount?: string, descuento?: number) => {
    if (discount && descuento) {
      // convertimos el total a entero sin decimal multiplicando por 10
      // luego sacamos el 15 y por ulimo dividimos entre 10 y 100 = 1000
      const calculateDiscount = (
        (getCartTotal() * 10 * descuento) /
        1000
      ).toFixed(2)
      const roundToClientFavor = Math.ceil(Number(calculateDiscount) * 10)
      const subtotal = (
        (getCartTotal() * 10 - roundToClientFavor) /
        10
      ).toFixed(2)
      return setSubTotal(subtotal)
    }
    setSubTotal(getCartTotal().toFixed(2))
  }

  useEffect(() => {
    setItemsProducts(
      cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        size: item.size
      }))
    )
    getDiscount()
    return () => {
      setCuponError('')
      setDescuento(0)
      setCodigoCupon('')
      setDiscount('')
      setLoading(false)
    }
  }, [cartItems])

  if (!isOpen) return null

  const validateCupon = async () => {
    if (cuponCode) {
      setLoading(true)
      const response = await fetch(`/api/cupones/codigo/${cuponCode}`)
      if (!response.ok) {
        setCuponError('Codigo de cupon invalido')
        setDescuento(0)
        setCodigoCupon('')
        setDiscount('')
        setLoading(false)
      }
      const data = await response.json()
      setDiscount(data.codigoCupon)
      setDescuento(data.descuento)
      getDiscount(data.codigoCupon, data.descuento)
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50 z-auto'
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            if (cuponError.length) {
              setCuponError('')
              setDescuento(0)
              setCodigoCupon('')
              setDiscount('')
              setLoading(false)
            }
            onClose()
          }
        }}
      >
        {/* Cart Panel */}
        <div className='cartPanel'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl font-semibold text-gray-800'>Tu Carrito</h2>
            <button
              onClick={() => {
                if (cuponError.length) {
                  setCuponError('')
                  setDescuento(0)
                  setCodigoCupon('')
                  setDiscount('')
                  setLoading(false)
                }
                setTimeout(() => {
                  onClose()
                }, 100)
              }}
              className='text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100'
            >
              <X size={24} />
            </button>
          </div>
          {cartItems.length === 0 ? (
            <p className='text-gray-500 text-center py-8'>
              Tu carrito está vacío
            </p>
          ) : (
            <>
              <ul className='space-y-6 mb-6'>
                {cartItems.map((item) => (
                  <li key={item.id} className={'shoppingCartItem'}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className='imageCartPanel'
                    />
                    <div className='containerItemTitleCartPanel'>
                      <span className='font-medium text-gray-800'>
                        {item.name}
                      </span>
                      <span>{item.size}</span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className='text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded-full hover:bg-gray-200'
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className='containerItemPriceCuantitiCartPanel'>
                      <span className='text-gray-600'>
                        Cantidad: {item.quantity}
                      </span>
                      <span className='font-medium text-gray-800'>
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className='border-t border-gray-200 pt-4 mb-6'>
                <>
                  <div className='flex justify-center'>
                    <span className='text-gray-600'>Cupon:</span>
                    <div className='relative bg-white dark:bg-gray-600 w-full rounded-md ml-2'>
                      <input
                        type='text'
                        placeholder='Cupon de descuento...'
                        className='text-sm p-1 outline outline-1 border-0 rounded ml-2 outline-none px-1 bg-transparent'
                        value={cuponCode}
                        onChange={(event) => {
                          setCuponCode(event.target.value.toUpperCase())
                          if (cuponError) {
                            setCuponError('')
                          }
                        }}
                      />
                      <button
                        onClick={() => validateCupon()}
                        className='absolute right-0 top-0 h-full bg-black p-1 rounded-r-md min-w-20 flex justify-center items-center'
                      >
                        {loading ? (
                          <LuLoaderCircle className='animate-spin' />
                        ) : (
                          'Validar'
                        )}
                      </button>
                    </div>
                  </div>
                  {cuponError.length > 0 && (
                    <span className='text-red-500 text-sm right-0 flex w-full justify-end'>
                      Cupon invalido
                    </span>
                  )}
                  <div
                    className={`flex justify-between text-sm mt-1 ${
                      cuponError.length > 0
                        ? 'text-red-400'
                        : descuento > 0
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`}
                  >
                    <span>Descuento:</span>
                    <span>{descuento ? descuento : 0}%</span>
                  </div>
                </>

                <div className='flex justify-between items-center mb-4'>
                  <span className='text-gray-600'>Subtotal:</span>
                  <span className='text-xl font-semibold text-gray-800'>
                    S/ {subTotal}
                  </span>
                </div>
                <div
                  className={`flex justify-between text-xs ${
                    discount === codigoCupon ? 'text-red-400' : 'text-gray-600'
                  } bg-green-100 rounded py-2 px-4 mb-2 border border-green-300`}
                >
                  <span>
                    Delivery gratuito solo para compras mayores a S/.150.00
                  </span>
                </div>
              </div>
              <div className='space-y-3'>
                <Button
                  onClick={clearCart}
                  variant='outline'
                  className='w-full hover:bg-gray-300 dark:hover:text-black transition-colors duration-200'
                >
                  Limpiar Carrito
                </Button>
                <button
                  style={{ backgroundColor: '#262626', marginTop: '10px' }}
                  className='buttonShowCardClientName'
                  onClick={() => setShowCardClientName(true)}
                >
                  Continuar
                </button>
              </div>
            </>
          )}
        </div>
        {showCardClientName && (
          <FormToSend
            subTotal={subTotal}
            setShowCardClientName={setShowCardClientName}
            itemsProducts={itemsProducts}
            discountCode={discount}
            onClose={onClose}
            discountPercentage={descuento}
          />
        )}
      </div>
    </>
  )
}
