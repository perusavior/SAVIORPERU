'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import ProductsTable from './ProductsTable'
import ProductForm from './ProductForm'
import ImageManager from './ImageManager'
import FilterPanel from './FilterPanel'
import KpiDashboard from './KpiDashboard'
import Pagination from './Pagination'
import { MdSearch, MdAdd, MdClose } from 'react-icons/md'

// Interfaces (separar en archivo types.ts)
interface Producto {
  id: number
  name: string
  category: string
  estado: string
  size: string | null
  price: number
  image: string
  image2: string | null
  stock: number
  destacado: boolean
  createdAt: string
  updatedAt: string
  newCategory: string
}

interface ApiResponse {
  data: Producto[]
  pagination: {
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
  }
  productsDetails: {
    totalInventoryAmount: number
    notAvailable: number
    totalStock: number
    totalProducts: number
    destacados: number
    categories: [{ name: string }]
  }
}

interface KpiData {
  totalProducts: number
  totalStock: number
  noDisponibleCount: number
  inventoryValue: number
  destacadosCount: number
  categories: [{ name: string }]
}

const ProductsManagement: React.FC = () => {
  // Estados principales
  const [products, setProducts] = useState<Producto[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pagination, setPagination] = useState<ApiResponse['pagination']>({
    totalCount: 0,
    page: 1,
    pageSize: 16,
    totalPages: 0
  })

  // Estados para KPIs
  const [kpiData, setKpiData] = useState<KpiData>({
    totalProducts: 0,
    totalStock: 0,
    noDisponibleCount: 0,
    inventoryValue: 0,
    destacadosCount: 0,
    categories: [{ name: '' }]
  })

  // Estados para filtros y modales
  const [filter, setFilter] = useState<string>('')
  const [sort, setSort] = useState<string>('created-desc')
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)

  // Fetch de productos
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        ...(filter && { filter }),
        ...(sort && { sort })
      })

      const response = await fetch(`/api/products?${queryParams}`)
      if (!response.ok) throw new Error('Error al obtener productos')
      const result: ApiResponse = await response.json()

      setProducts(result.data)
      setPagination(result.pagination)

      setKpiData({
        totalProducts: result.productsDetails.totalProducts,
        totalStock: result.productsDetails.totalStock,
        noDisponibleCount: result.productsDetails.notAvailable,
        inventoryValue: result.productsDetails.totalInventoryAmount,
        destacadosCount: result.productsDetails.destacados,
        categories: result.productsDetails.categories
      })
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('No se pudieron cargar los productos')
    } finally {
      setLoading(false)
    }
  }, [currentPage, filter, sort])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Handlers
  const handleSearch = () => {
    setFilter(searchTerm)
    setCurrentPage(1)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilter('')
  }

  const handleProductCreated = () => {
    setShowCreateModal(false)
    fetchProducts()
  }

  const handleProductUpdated = () => {
    setShowEditModal(false)
    fetchProducts()
  }

  const handleProductDeleted = () => {
    fetchProducts()
  }

  return (
    <>
      <main className='flex flex-1 flex-col bg-gray-50 dark:bg-gray-900 pb-12'>
        <div className='mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 lg:p-8'>
          {/* Header & Search */}
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-white lg:text-3xl'>
                Gestión de Productos
              </h2>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Administra el inventario y catálogo de tu tienda.
              </p>
            </div>
            <div className='flex gap-3'>
              <div className='relative w-full sm:w-80'>
                <MdSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl dark:text-gray-500' />
                <input
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className='h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-500/30'
                  placeholder='Buscar por nombre o categoría...'
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400'
                  >
                    <MdClose />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className='flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
              >
                <MdSearch />
                <span className='hidden sm:inline'>Filtros</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className='flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 transition-colors'
              >
                <MdAdd size={20} />
                <span className='hidden sm:inline'>Nuevo Producto</span>
              </button>
            </div>
          </div>

          {/* Panel de Filtros */}
          {showFilters && (
            <FilterPanel
              sort={sort}
              setSort={setSort}
              onClearFilters={() => {
                setFilter('')
                setSort('')
                setSearchTerm('')
              }}
            />
          )}

          {/* KPI Dashboard */}
          <KpiDashboard kpiData={kpiData} />

          {/* Contador de Resultados */}
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              Mostrando <span className='font-bold'>{products.length}</span> de{' '}
              <span className='font-bold'>{pagination.totalCount}</span>{' '}
              productos
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              Página <span className='font-bold'>{currentPage}</span> de{' '}
              <span className='font-bold'>{pagination.totalPages}</span>
            </div>
          </div>

          {/* Products Table */}
          <ProductsTable
            products={products}
            loading={loading}
            filter={filter}
            kpiData={kpiData}
            onEditProduct={(product) => {
              setSelectedProduct(product)
              setShowEditModal(true)
            }}
            onDeleteProduct={handleProductDeleted}
            onToggleDestacado={fetchProducts}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && !loading && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </main>

      {/* Modal para Crear Producto */}
      {showCreateModal && (
        <ProductForm
          mode='create'
          kpiData={kpiData}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleProductCreated}
        />
      )}

      {/* Modal para Editar Producto */}
      {showEditModal && selectedProduct && (
        <ProductForm
          mode='edit'
          product={selectedProduct}
          kpiData={kpiData}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleProductUpdated}
        />
      )}
    </>
  )
}

export default ProductsManagement
