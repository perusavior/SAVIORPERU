'use client'

import React from 'react'
import {
  MdChevronLeft,
  MdChevronRight,
  MdFirstPage,
  MdLastPage
} from 'react-icons/md'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  // Navegación
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  const goToFirstPage = () => goToPage(1)
  const goToLastPage = () => goToPage(totalPages)
  const goToNextPage = () => goToPage(currentPage + 1)
  const goToPrevPage = () => goToPage(currentPage - 1)

  // Generar números de página con elipsis
  const getPageNumbers = () => {
    const delta = 2
    const range: number[] = []
    const rangeWithDots: (number | string)[] = []
    let l: number

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className='flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 rounded-b-xl'>
      {/* Botones anteriores */}
      <div className='flex items-center gap-2'>
        <PaginationButton
          onClick={goToFirstPage}
          disabled={currentPage === 1}
          aria-label='Primera página'
        >
          <MdFirstPage size={20} />
        </PaginationButton>

        <PaginationButton
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          aria-label='Página anterior'
        >
          <MdChevronLeft size={20} />
        </PaginationButton>
      </div>

      {/* Números de página */}
      <div className='flex items-center gap-1'>
        {pageNumbers.map((pageNum, index) => (
          <React.Fragment key={index}>
            {pageNum === '...' ? (
              <span className='px-3 py-1 text-gray-400 dark:text-gray-500'>
                ...
              </span>
            ) : (
              <PaginationButton
                onClick={() => goToPage(Number(pageNum))}
                isActive={currentPage === pageNum}
                aria-label={`Ir a página ${pageNum}`}
              >
                {pageNum}
              </PaginationButton>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Botones siguientes */}
      <div className='flex items-center gap-2'>
        <PaginationButton
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          aria-label='Página siguiente'
        >
          <MdChevronRight size={20} />
        </PaginationButton>

        <PaginationButton
          onClick={goToLastPage}
          disabled={currentPage === totalPages}
          aria-label='Última página'
        >
          <MdLastPage size={20} />
        </PaginationButton>
      </div>
    </div>
  )
}

// Componente interno para botón de paginación
interface PaginationButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  isActive?: boolean
  ariaLabel?: string
}

const PaginationButton: React.FC<PaginationButtonProps> = ({
  children,
  onClick,
  disabled = false,
  isActive = false,
  ariaLabel
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className={`
      flex items-center justify-center h-9 w-9 rounded-lg border text-sm font-medium transition-colors
      ${
        isActive
          ? 'bg-blue-600 text-white border-blue-600'
          : 'border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
      }
    `}
  >
    {children}
  </button>
)

export default Pagination
