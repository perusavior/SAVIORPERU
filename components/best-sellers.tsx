'use client'

import { useState, useEffect } from 'react'
import ProductCard from './product-card'
import styles from './best-sellers.module.css'

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

export default function BestSellers() {
  const [data, setData] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const response = await fetch('/api/colecciones')

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const collectionData = await response.json()

        setData(collectionData.data.colecciones)
      } catch (error) {
        console.error('❌ [CLIENT] Error cargando Colecciones:', error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // const interval = setInterval(fetchData, 60000)
    // return () => clearInterval(interval)
  }, [])

  // Mostrar estado de carga CON 4 SKELETONS
  if (loading) {
    return (
      <section className={styles.customWidth}>
        <h2 className={styles.h2}>Ver Colección</h2>
        <div className={styles.cardContainer}>
          {skeletonItems.map((item) => (
            <ProductCard
              key={`skeleton-${item}`} // ✅ KEY AQUÍ
              product={{
                id: item, // Usar item como ID único
                image: '/CargandoImagen.png',
                name: 'Cargando...',
                price: 0,
                stock: 0
              }}
              from='bestSellers'
            />
          ))}
        </div>
      </section>
    )
  }

  // Si no hay datos después de cargar
  if (data.length === 0) {
    return (
      <section className={styles.customWidth}>
        <h2 className={styles.h2}>Ver Colección</h2>
        <p className='text-center py-10'>Próximamente nuevas colecciones.</p>
      </section>
    )
  }

  return (
    <section className={styles.customWidth}>
      <h2 className={styles.h2}>Ver Colección</h2>
      <div className={styles.cardContainer}>
        {data.map((product) => (
          <ProductCard key={product.id} product={product} from='bestSellers' />
        ))}
      </div>
    </section>
  )
}
