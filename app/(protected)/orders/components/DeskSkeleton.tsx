const TableSkeleton = () => {
  return (
    <div className='overflow-hidden rounded-lg border border-border'>
      <div className='bg-foreground h-12'></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className='border-b border-border p-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-2 flex-1'>
              <div className='h-4 bg-muted rounded w-1/4'></div>
              <div className='h-3 bg-muted rounded w-1/3'></div>
            </div>
            <div className='h-4 bg-muted rounded w-16 mx-4'></div>
            <div className='h-4 bg-muted rounded w-20 mx-4'></div>
            <div className='h-4 bg-muted rounded w-24 mx-4'></div>
            <div className='h-4 bg-muted rounded w-32'></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TableSkeleton
