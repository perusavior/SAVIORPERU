const OrderSkeleton = () => {
  return (
    <div className='border border-border rounded-lg p-4 mb-4 animate-pulse'>
      <div className='flex justify-between items-start mb-3'>
        <div>
          <div className='h-4 bg-muted rounded w-32 mb-2'></div>
          <div className='h-3 bg-muted rounded w-24'></div>
        </div>
        <div className='h-6 bg-muted rounded w-20'></div>
      </div>

      <div className='space-y-2 mb-4'>
        <div className='h-3 bg-muted rounded w-full'></div>
        <div className='h-3 bg-muted rounded w-3/4'></div>
      </div>

      <div className='flex justify-between items-center'>
        <div className='h-4 bg-muted rounded w-28'></div>
        <div className='flex space-x-2'>
          <div className='h-8 bg-muted rounded w-20'></div>
          <div className='h-8 bg-muted rounded w-20'></div>
        </div>
      </div>
    </div>
  )
}

export default OrderSkeleton
