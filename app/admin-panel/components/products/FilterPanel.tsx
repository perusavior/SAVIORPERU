'use client'

import React from 'react'
import { GoSortAsc, GoSortDesc } from 'react-icons/go'
import { MdCalendarToday } from 'react-icons/md'

interface FilterPanelProps {
  sort: string
  setSort: (sort: string) => void
  onClearFilters: () => void
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  sort,
  setSort,
  onClearFilters
}) => {
  const sortOptions = [
    { value: '', label: 'Nombre', icon: null },
    {
      value: 'price-asc',
      label: 'Precio: Menor a Mayor',
      icon: <GoSortAsc className='h-5 w-5' />
    },
    {
      value: 'price-desc',
      label: 'Precio: Mayor a Menor',
      icon: <GoSortDesc className='h-5 w-5' />
    },
    {
      value: 'created-desc',
      label: 'Más Recientes',
      icon: <MdCalendarToday size={14} />
    },
    {
      value: 'created-asc',
      label: 'Más Antiguos',
      icon: <MdCalendarToday size={14} />
    }
  ]

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-4 dark:bg-gray-800 dark:border-gray-700'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center'>
        <div className='flex-1'>
          <label className='mb-2 block text-xs font-bold text-gray-500 dark:text-gray-400'>
            Ordenar por
          </label>
          <div className='flex flex-wrap gap-2'>
            {sortOptions.map((option) => (
              <SortButton
                key={option.value}
                isActive={sort === option.value}
                onClick={() => setSort(option.value)}
                icon={option.icon}
                label={option.label}
              />
            ))}
          </div>
        </div>
        <button
          onClick={onClearFilters}
          className='text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 whitespace-nowrap'
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  )
}

// Componente interno para botón de ordenamiento
interface SortButtonProps {
  isActive: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

const SortButton: React.FC<SortButtonProps> = ({
  isActive,
  onClick,
  icon,
  label
}) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
      ${
        isActive
          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
      }
    `}
  >
    {icon}
    {label}
  </button>
)

export default FilterPanel
