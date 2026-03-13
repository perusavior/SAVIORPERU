import { IconType } from 'react-icons'

interface KpiCardProps {
  title: string
  value: string
  trend?: string
  Icon: IconType
  color: 'blue' | 'indigo' | 'purple' | 'orange' | 'blue'
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
    <div className='flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700'>
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
        <h3 className='text-xl font-black text-gray-900 dark:text-white'>
          {value}
        </h3>
        {trend && (
          <span
            className={`text-xs font-bold px-2 py-1 rounded-lg ${trendColor}`}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  )
}

export default KpiCard
