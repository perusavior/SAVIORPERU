'use client'

import { useState, useEffect } from 'react'
import ProductCard from './product-card'
import styles from './featured-products.module.css'

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

// Array para skeletons
const skeletonItems = [1, 2, 3, 4]

export default function FeaturedProducts() {
  const [data, setData] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const response = await fetch('/api/productos-destacados')

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()

        if (result.data.destacados) {
          setData(result.data.destacados)
        } else {
          setData([])
        }

        setError(null)
      } catch (error) {
        console.error('❌ [CLIENT] Error cargando productos destacados:', error)
        setError('No se pudieron cargar los productos destacados')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Opcional: auto-refresh cada 2 minutos
    // const interval = setInterval(fetchData, 2 * 60 * 1000)
    // return () => clearInterval(interval)
  }, [])

  // Mostrar estado de carga CON SKELETONS
  if (loading) {
    return (
      <section className={styles.customWidth}>
        <h2 className={styles.h2}>Productos Destacados</h2>
        <div className={styles.cardContainer}>
          {skeletonItems.map((item) => (
            <ProductCard
              key={`skeleton-${item}`}
              product={{
                id: item,
                image: '/CargandoImagen.png',
                name: 'Cargando...',
                price: 0,
                stock: 0
              }}
              from='featured'
            />
          ))}
        </div>
      </section>
    )
  }

  // Mostrar error
  if (error) {
    return (
      <section className={styles.customWidth}>
        <h2 className={styles.h2}>Productos Destacados</h2>
        <div className='text-center py-10'>
          <p className='text-red-600 mb-2'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            Reintentar
          </button>
        </div>
      </section>
    )
  }

  // Si no hay datos
  if (data.length === 0) {
    return (
      <section className={styles.customWidth}>
        <h2 className={styles.h2}>Productos Destacados</h2>
        <p className='text-center py-10'>
          No hay productos destacados disponibles.
        </p>
      </section>
    )
  }

  return (
    <section className={styles.customWidth}>
      <h2 className={styles.h2}>Productos Destacados</h2>
      <div className={styles.cardContainer}>
        {data.map((product) => (
          <ProductCard key={product.id} product={product} from='featured' />
        ))}
      </div>
    </section>
  )
}
