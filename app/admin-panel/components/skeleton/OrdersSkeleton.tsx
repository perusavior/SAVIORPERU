import React from 'react'

const OrdersSkeleton = () => {
  return (
    <>
      {/* Header & Search Skeleton */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='space-y-2'>
          <div className='h-8 w-48 bg-gray-200 rounded-lg dark:bg-gray-700 animate-pulse'></div>
          <div className='h-4 w-64 bg-gray-200 rounded dark:bg-gray-700 animate-pulse'></div>
        </div>
        <div className='relative w-full sm:w-80'>
          <div className='absolute left-3 top-1/2 -translate-y-1/2'>
            <div className='h-5 w-5 bg-gray-200 rounded dark:bg-gray-700 animate-pulse'></div>
          </div>
          <div className='h-11 w-full bg-gray-200 rounded-xl dark:bg-gray-700 animate-pulse'></div>
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className='flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 dark:bg-gray-800 dark:border-gray-700'
          >
            <div className='flex items-center justify-between'>
              <div className='h-4 w-20 bg-gray-200 rounded dark:bg-gray-700 animate-pulse'></div>
              <div className='h-10 w-10 bg-gray-200 rounded-xl dark:bg-gray-700 animate-pulse'></div>
            </div>
            <div className='flex items-end justify-between'>
              <div className='h-8 w-16 bg-gray-200 rounded dark:bg-gray-700 animate-pulse'></div>
              <div className='h-6 w-12 bg-gray-200 rounded-lg dark:bg-gray-700 animate-pulse'></div>
            </div>
          </div>
        ))}
      </div>

      {/* Contador de Resultados Skeleton */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-1'>
          <div className='h-4 w-24 bg-gray-200 rounded dark:bg-gray-700 animate-pulse'></div>
        </div>
        <div className='flex items-center gap-1'>
          <div className='h-4 w-20 bg-gray-200 rounded dark:bg-gray-700 animate-pulse'></div>
        </div>
      </div>
    </>
  )
}

export default OrdersSkeleton
