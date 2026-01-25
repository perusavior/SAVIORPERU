'use clients'

import { useState } from 'react'
import { IconType } from 'react-icons'
import { IoMdEye, IoMdEyeOff } from 'react-icons/io'

interface KpiCardProps {
  title: string
  value: string
  trend: string
  Icon: IconType
  color: 'blue' | 'indigo' | 'purple' | 'orange'
  isNegative?: boolean
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  trend,
  Icon,
  color,
  isNegative
}) => {
  const [showMoney, setShowMoney] = useState(false)
  const [showBoton, setShowBoton] = useState(false)
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    indigo:
      'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    purple:
      'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    orange:
      'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
  }
  const trendColor = isNegative
    ? 'bg-red-50 text-red-600 dark:bg-red-900/30'
    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30'

  return (
    <div
      onMouseEnter={() => setShowBoton(true)}
      onMouseLeave={() => setShowBoton(false)}
      className='flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700'
    >
      <div className='flex items-center justify-between'>
        <p className='text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
          {title}
        </p>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[color]}`}
        >
          <Icon size={24} />
        </div>
      </div>
      <div className='flex items-end justify-between'>
        <h3 className='text-2xl font-black text-gray-900 dark:text-white'>
          {title === 'Ingresos' || title === 'Valor Inventario'
            ? showMoney && value
            : value}
        </h3>
        {((title === 'Ingresos' && showBoton) ||
          (title === 'Valor Inventario' && showBoton)) && (
          <button
            className='h-8 w-8 flex justify-center items-center'
            onClick={() => setShowMoney(!showMoney)}
          >
            <IoMdEye className='h-4 w-4' />
          </button>
        )}
      </div>
    </div>
  )
}

export default KpiCard
