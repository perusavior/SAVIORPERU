'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'
import styles from './product-card.module.css'
import Link from 'next/link'
import { MdOutlineShoppingCart } from 'react-icons/md'
// import { FiMinusCircle, FiPlusCircle } from 'react-icons/fi'
import { FiCheckCircle } from 'react-icons/fi'
import { ImSpinner2 } from 'react-icons/im'

interface Product {
  id: number
  name: string
  price: number
  image: string
  image2?: string
  size?: string
  estado?: string
  stock: number
}

export default function ProductCard({
  product,
  from
}: {
  product: Product
  from?: string
}) {
  const { addToCart } = useCart()
  const [image, setImage] = useState<string>(product.image)
  const [selectedSize, setSelectedSize] = useState<string>('') // Estado para el tamañ
  const [quantity, setQuantity] = useState(1) // Estado para la cantidad
  const [buttonState, setButtonState] = useState<
    'idle' | 'loading' | 'success'
  >('idle')

  const handleAddToCart = async () => {
    setButtonState('loading')
    setTimeout(() => {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image,
        size: selectedSize
      })
      setButtonState('success')
      setTimeout(() => {
        setButtonState('idle')
      }, 500)
    }, 500)
  }

  if (from === 'bestSellers') {
    return (
      <div className='bg-white overflow-hidden w-full dark:bg-[#0a0a0a]'>
        <Link href={`/collection?category=${product.name.toLowerCase()}`}>
          <div className={styles.fromBestSellers}>
            <Image
              src={image || '/placeholder.svg'}
              alt={product.name}
              fill
              className='object-cover transition-opacity duration-300 ease-in-out shadow-md'
              onMouseEnter={() =>
                setImage(product.image2 ? product.image2 : product.image)
              }
              onMouseLeave={() => setImage(product.image)}
            />
          </div>
          <div className='px-2 pt-4 pb-0 flex mb-2'>
            <h3
              className={
                'text-sm text-[#787671] border-b border-[#787671] flex dark:text-white'
              }
            >
              Ver {product.name}
            </h3>
          </div>
        </Link>
      </div>
    )
  }

  return (
    <div className='bg-white shadow-md rounded-sm overflow-hidden w-full'>
      <div
        className={`relative ${
          from === 'featured'
            ? styles.fromFeatured
            : 'lg:h-80 max-[400px]:h-[400px] max-[460px]:h-[400px] h-[450px] 2xl:h-[450px]'
        }`}
      >
        <Image
          src={image || '/placeholder.svg'}
          alt={product.name}
          fill
          className='object-cover transition-opacity duration-300 ease-in-out'
          onMouseEnter={() =>
            setImage(product.image2 ? product.image2 : product.image)
          }
          onMouseLeave={() => setImage(product.image)}
        />
      </div>
      <div
        className={`${
          from === 'featured' ? 'px-2 pt-2 pb-0' : 'pt-1 pb-2 px-2'
        }`}
      >
        <h3
          className={`${
            from === 'featured' ? 'text-sm' : 'text-lg'
          } font-semibold text-sm mb-0 text-[#31302e]`}
        >
          {product.name}
        </h3>
        {
          <div className='text-gray-600 mb-1 w-full flex justify-between'>
            <p className='text-sm'>S/ {Number(product.price).toFixed(2)}</p>

            <div className='flex justify-between mt-0'>
              <form className='flex gap-2'>
                {product.size &&
                  product.size?.split(' - ').map((ele, index) => (
                    <div
                      className='radio-container gap-[2px] flex items-center'
                      key={index}
                    >
                      <input
                        type='radio'
                        id={ele}
                        value={ele}
                        name='size'
                        onChange={() => setSelectedSize(ele)}
                        checked={selectedSize === ele}
                        className="appearance-none w-3 h-3 border-2 border-gray-400 rounded-full checked:border-4 checked:border-blue-800 focus:outline-none transition duration-200 relative after:content-[''] after:absolute after:hidden checked:after:block after:w-0 after:h-0 after:bg-blue-800 after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 cursor-pointer"
                      />
                      <label className='m-0 text-sm'>{ele}</label>
                    </div>
                  ))}
              </form>
            </div>
          </div>
        }
        <Button
          className={`w-full ${
            from === 'featured' ? 'mb-2' : 'mb-0'
          } flex items-center justify-center gap-2 text-white bg-black hover:bg-gray-700`}
          onClick={handleAddToCart}
          disabled={
            product.estado === 'NO DISPONIBLE' || product.stock == 0
              ? true
              : buttonState === 'loading' ||
                buttonState === 'success' ||
                (selectedSize ? false : !product.size ? false : true)
          }
        >
          {buttonState === 'loading' && (
            <ImSpinner2 className='animate-spin h-5 w-5' />
          )}
          {buttonState === 'success' && (
            <FiCheckCircle className='h-5 w-5 text-green-600' />
          )}
          {buttonState === 'idle' && (
            <>
              {product.estado === 'NO DISPONIBLE' || product.stock === 0 ? (
                'NO DISPONIBLE'
              ) : (
                <>
                  Añadir al carrito <MdOutlineShoppingCart />
                </>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
