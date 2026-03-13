'use client'

import React, { useState } from 'react'
import {
  MdEdit,
  MdDelete,
  MdStar,
  MdStarBorder,
  MdInventory2
} from 'react-icons/md'
import { toast } from 'sonner'
import type { Producto, KpiData } from '../types'

interface ProductsTableProps {
  products: Producto[]
  loading: boolean
  filter: string
  kpiData: KpiData
  onEditProduct: (product: Producto) => void
  onDeleteProduct: () => void
  onToggleDestacado: () => void
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  loading,
  filter,
  kpiData,
  onEditProduct,
  onDeleteProduct,
  onToggleDestacado
}) => {
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  // Eliminar producto
  const handleDeleteProduct = async (id: number) => {
    if (
      !confirm(
        '¿Estás seguro de eliminar este producto? Esta acción es irreversible.'
      )
    ) {
      return
    }

    setIsDeleting(id)
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('Producto eliminado exitosamente')
        onDeleteProduct()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Error al eliminar el producto')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Error al eliminar el producto')
    } finally {
      setIsDeleting(null)
    }
  }

  // Alternar estado de destacado
  const handleToggleDestacado = async (product: Producto) => {
    const nuevoEstado = !product.destacado

    // Validar límite si quiere marcar como destacado
    if (nuevoEstado && kpiData.destacadosCount >= 4) {
      toast.warning('Solo puedes tener 4 productos destacados como máximo')
      return
    }

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destacado: nuevoEstado,
          // Mantener otros datos iguales
          name: product.name,
          category: product.category,
          estado: product.estado,
          size: product.size,
          price: Number(product.price),
          stock: product.stock,
          image: product.image,
          image2: product.image2
        })
      })

      if (!response.ok) throw new Error()

      toast.success(
        nuevoEstado
          ? `"${product.name}" marcado como destacado`
          : `"${product.name}" quitado de destacados`
      )

      onToggleDestacado()
    } catch (error) {
      console.error('Error actualizando destacado:', error)
      toast.error('Error al actualizar el producto')
    }
  }

  // Estado del producto (badge)
  const EstadoBadge = ({ estado }: { estado: string }) => (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
        estado === 'DISPONIBLE'
          ? 'bg-emerald-100 text-green-500 dark:bg-green-600 dark:text-emerald-200'
          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      }`}
    >
      {estado}
    </span>
  )

  // Badge de categoría
  const CategoryBadge = ({ category }: { category: string }) => (
    <span className='inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300'>
      {category}
    </span>
  )

  // Indicador de stock
  const StockIndicator = ({ stock }: { stock: number }) => {
    let textColor = 'text-green-600 dark:text-green-400'

    if (stock > 5) {
      textColor = 'text-green-600 dark:text-green-400'
    } else if (stock > 0) {
      textColor = 'text-amber-600 dark:text-amber-400'
    } else {
      textColor = 'text-red-600 dark:text-red-400'
    }

    return (
      <span className={`text-sm font-medium ${textColor}`}>
        {stock} unidades
      </span>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm text-gray-600 dark:text-gray-400'>
            <thead className='bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-700/50 dark:text-gray-300'>
              <tr>
                <th className='px-6 py-4 font-bold'>Imagen</th>
                <th className='px-6 py-4 font-bold'>Nombre</th>
                <th className='px-6 py-4 font-bold'>Categoría</th>
                <th className='px-6 py-4 font-bold'>Estado</th>
                <th className='px-6 py-4 font-bold'>Precio</th>
                <th className='px-6 py-4 font-bold'>Stock</th>
                <th className='px-6 py-4 font-bold'>Destacado</th>
                <th className='px-6 py-4 text-right font-bold'>Acciones</th>
              </tr>
            </thead>
            {loading ? (
              <tbody className='divide-y divide-gray-100 dark:divide-gray-700'>
                <tr>
                  <td colSpan={8} className='px-6 py-12 text-center'>
                    <div className='flex justify-center'>
                      <div className='h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : products.length === 0 ? (
              <>
                <tbody className='divide-y divide-gray-100 dark:divide-gray-700'>
                  <tr className='px-6 py-12 text-center m-auto'>
                    <td
                      colSpan={8}
                      className='mt-2 text-sm font-medium text-gray-900 dark:text-white py-5'
                    >
                      <p>
                        <MdInventory2 className='mx-auto h-12 w-12 text-gray-400 dark:text-gray-500' />
                      </p>
                      <p>
                        {filter
                          ? 'No se encontraron productos'
                          : 'No hay productos'}
                      </p>
                      <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                        {filter
                          ? 'No hay productos que coincidan con tu búsqueda.'
                          : '¡Empieza creando tu primer producto!'}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </>
            ) : (
              <>
                <tbody className='divide-y divide-gray-100 dark:divide-gray-700'>
                  {products.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      isDeleting={isDeleting === product.id}
                      onEdit={onEditProduct}
                      onDelete={handleDeleteProduct}
                      onToggleDestacado={handleToggleDestacado}
                      EstadoBadge={EstadoBadge}
                      CategoryBadge={CategoryBadge}
                      StockIndicator={StockIndicator}
                    />
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}

// Componente interno para fila de producto
interface ProductRowProps {
  product: Producto
  isDeleting: boolean
  onEdit: (product: Producto) => void
  onDelete: (id: number) => void
  onToggleDestacado: (product: Producto) => void
  EstadoBadge: React.FC<{ estado: string }>
  CategoryBadge: React.FC<{ category: string }>
  StockIndicator: React.FC<{ stock: number }>
}

const ProductRow: React.FC<ProductRowProps> = ({
  product,
  isDeleting,
  onEdit,
  onDelete,
  onToggleDestacado,
  EstadoBadge,
  CategoryBadge,
  StockIndicator
}) => (
  <tr
    className={`hover:bg-gray-50/50 transition-colors group dark:hover:bg-gray-700/30 ${
      isDeleting ? 'opacity-50 pointer-events-none' : ''
    }`}
  >
    {/* Columna de Imagen */}
    <td className='px-6 py-4'>
      <div className='flex -space-x-2'>
        <img
          src={product.image}
          alt={product.name}
          className='h-10 w-10 rounded-lg border-2 border-white dark:border-gray-800 object-cover shadow-sm'
        />
        {product.image2 && (
          <img
            src={product.image2}
            alt={`${product.name} - 2`}
            className='h-10 w-10 rounded-lg border-2 border-white dark:border-gray-800 object-cover shadow-sm'
          />
        )}
      </div>
    </td>

    {/* Columna de Nombre */}
    <td className='px-6 py-4'>
      <div className='flex flex-col'>
        <span className='font-semibold text-gray-900 dark:text-white'>
          {product.name}
        </span>
        <span className='text-xs text-gray-400 dark:text-gray-500'>
          {product.size || 'Sin talla'}
        </span>
      </div>
    </td>

    {/* Columna de Categoría */}
    <td className='px-6 py-4'>
      <CategoryBadge category={product.category} />
    </td>

    {/* Columna de Estado */}
    <td className='px-6 py-4'>
      <EstadoBadge estado={product.estado} />
    </td>

    {/* Columna de Precio */}
    <td className='px-6 py-4 font-bold text-gray-900 dark:text-white'>
      S/ {Number(product.price).toFixed(2)}
    </td>

    {/* Columna de Stock */}
    <td className='px-6 py-4'>
      <StockIndicator stock={product.stock} />
    </td>

    {/* Columna de Destacado */}
    <td className='px-6 py-4'>
      <button
        onClick={() => onToggleDestacado(product)}
        className={`p-1 rounded-lg transition-colors ${
          product.destacado
            ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30'
            : 'text-gray-300 hover:text-amber-500 hover:bg-gray-50 dark:text-gray-600 dark:hover:bg-gray-700'
        }`}
        title={product.destacado ? 'Quitar destacado' : 'Marcar como destacado'}
      >
        {product.destacado ? <MdStar size={22} /> : <MdStarBorder size={22} />}
      </button>
    </td>

    {/* Columna de Acciones */}
    <td className='px-6 py-4 text-right'>
      <div className='flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all'>
        <button
          onClick={() => onEdit(product)}
          className='p-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-lg transition-colors'
          title='Editar producto'
        >
          <MdEdit size={20} />
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className='p-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-colors'
          title='Eliminar producto'
        >
          <MdDelete size={20} />
        </button>
      </div>
    </td>
  </tr>
)

export default ProductsTable
