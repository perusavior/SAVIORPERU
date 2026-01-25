'use client'

import { useEffect, useState } from 'react'
import ProductCard from '@/components/product-card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { RiArrowUpDoubleLine } from 'react-icons/ri'
import './page.css'
import { ProductsProps } from './interface'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

interface Pagination {
  page: number
  pageSize: number
  totalPages: number
  totalCount: number
}

interface Categories {
  name: string
}

export default function Collection() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category')
  const [filter, setFilter] = useState(category || '')
  const [sort, setSort] = useState('name')
  const [showCategory, setShowCategory] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [products, setProducts] = useState<ProductsProps[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [page, setPage] = useState(1)
  const [categories, setCategories] = useState<Categories[]>([])

  // Fetch productos desde el backend con filtros y paginación
  const getProducts = async () => {
    try {
      const response = await fetch(
        `/api/products?page=${page}&filter=${filter}&sort=${sort}`
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const productos = await response.json()
      setProducts(productos.data)
      setPagination(productos.pagination)
      setCategories(productos.productsDetails.categories)
    } catch (error) {
      console.log('Error fetching products:', error)
    }
  }

  useEffect(() => {
    getProducts()

    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [page, filter, sort])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const pathname = usePathname() // Obtenemos la ruta actual
  const router = useRouter()
  const handleFilterChange = (value: string) => {
    // Solo hace push si NO estamos en /collection
    if (category) {
      router.push('/collection')
    }
    setFilter(value)
    setShowCategory(value)
    setPage(1)
  }

  return (
    <div className='container mx-auto px-4 py-8 relative pb-12'>
      <h1 className='text-3xl font-bold mb-8'>Colecciones</h1>
      <div className='flex flex-col md:flex-row gap-4 mb-8'>
        <Input
          type='text'
          placeholder='Buscar productos...'
          value={filter}
          onChange={(e) => {
            setShowCategory('')
            setFilter(e.target.value)
            setPage(1) // reset paginación al aplicar filtro
          }}
          className='md:w-64 border border-border outline-0'
        />
        <Select value={showCategory} onValueChange={handleFilterChange}>
          <SelectTrigger className='md:w-48 border border-border'>
            <SelectValue placeholder='Ver todos' />
          </SelectTrigger>
          <SelectContent>
            {categories && categories.length >= 1
              ? categories.map((ele) => {
                  return (
                    <SelectItem key={ele.name} value={ele.name}>
                      {ele.name}
                    </SelectItem>
                  )
                })
              : null}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className='md:w-48 border border-border'>
            <SelectValue placeholder='Ordenar por' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='name'>Nombre</SelectItem>
            <SelectItem value='price-asc'>Precio: menos a más</SelectItem>
            <SelectItem value='price-desc'>Precio: más a menos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid de productos */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Paginación */}
      {pagination && (
        <div className='flex justify-center items-center gap-4 mt-8'>
          <button
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
            className='px-4 py-2 border rounded disabled:opacity-50'
          >
            Anterior
          </button>
          <span>
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className='px-4 py-2 border rounded disabled:opacity-50'
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Botón scroll to top */}
      {/* {isVisible && ( */}
      <button
        onClick={scrollToTop}
        className='buttonUp'
        aria-label='Volver arriba'
      >
        <RiArrowUpDoubleLine className='w-10 h-10' />
      </button>
      {/* )} */}
    </div>
  )
}
