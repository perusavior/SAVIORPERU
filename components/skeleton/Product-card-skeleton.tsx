// components/product-card-skeleton.tsx
import styles from '../product-card.module.css'

export default function ProductCardSkeleton() {
  return (
    <div className='bg-white overflow-hidden w-full'>
      {/* Contenedor de imagen con skeleton */}
      <div className={styles.fromBestSellers}>
        <div className='relative w-full h-full bg-gray-200 animate-pulse'>
          {/* Imagen skeleton */}
          <div className='absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200'></div>
        </div>
      </div>

      {/* Contenedor de texto con skeleton */}
      <div className='px-2 pt-4 pb-0 flex mb-2'>
        <div className='w-3/4 h-6 bg-gray-200 animate-pulse rounded'></div>
      </div>
    </div>
  )
}
