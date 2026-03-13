'use client'

import React, { useState, useEffect } from 'react'
import { MdClose } from 'react-icons/md'
import { toast } from 'sonner'
import ImageManager from './ImageManager'
import type { Producto, KpiData } from '../types'

interface ProductFormProps {
  mode: 'create' | 'edit'
  product?: Producto
  kpiData: KpiData
  onClose: () => void
  onSubmit: () => void
}

interface FormData {
  name: string
  category: string
  estado: string
  size: string
  price: number
  stock: number
  destacado: boolean
  image: string
  image2: string
  newCategory: string
}

const ProductForm: React.FC<ProductFormProps> = ({
  mode,
  product,
  kpiData,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    estado: 'DISPONIBLE',
    size: '',
    price: 0,
    stock: 0,
    destacado: false,
    image: '',
    image2: '',
    newCategory: ''
  })

  const [selectorCategory, setSelectorCategory] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Inicializar formulario con datos del producto en modo edición
  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData({
        name: product.name,
        category: product.category,
        estado: product.estado,
        size: product.size || '',
        price: product.price,
        stock: product.stock,
        destacado: product.destacado,
        image: product.image,
        image2: product.image2 || '',
        newCategory: product.newCategory
      })
    }
  }, [mode, product])

  // Validar límite de destacados
  const validateDestacado = () => {
    if (
      formData.destacado &&
      mode === 'create' &&
      kpiData.destacadosCount >= 4
    ) {
      toast.warning('Solo puedes tener 4 productos destacados como máximo')
      return false
    }
    if (
      formData.destacado &&
      mode === 'edit' &&
      !product?.destacado &&
      kpiData.destacadosCount >= 4
    ) {
      toast.warning('Solo puedes tener 4 productos destacados como máximo')
      return false
    }
    return true
  }

  // Validar formulario
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre del producto es requerido')
      return false
    }
    if (!formData.category.trim()) {
      toast.error('La categoría es requerida')
      return false
    }
    if (!formData.image) {
      toast.error('La imagen principal es requerida')
      return false
    }
    if (formData.price <= 0) {
      toast.error('El precio debe ser mayor a 0')
      return false
    }
    if (formData.stock < 0) {
      toast.error('El stock no puede ser negativo')
      return false
    }
    return true
  }

  // Manejar submit del formulario
  const handleSubmit = async () => {
    if (!validateForm() || !validateDestacado()) return

    setIsSubmitting(true)

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        estado: formData.estado,
        image: formData.image,
        destacado: formData.destacado,
        price: Number(formData.price),
        stock: Number(formData.stock),
        image2: formData.image2 || null,
        size: formData.size
          .toUpperCase()
          .split(' ')
          .join('')
          .split('-')
          .join(' - ')
      }

      const url =
        mode === 'create' ? '/api/products' : `/api/products/${product?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error()

      toast.success(
        mode === 'create'
          ? 'Producto creado exitosamente'
          : 'Producto actualizado exitosamente'
      )

      onSubmit()
      onClose()
    } catch (error) {
      console.error(
        `Error ${mode === 'create' ? 'creating' : 'updating'} product:`,
        error
      )
      toast.error(
        `Error al ${mode === 'create' ? 'crear' : 'actualizar'} el producto`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 dark:bg-gray-800'>
        {/* Header */}
        <div className='flex items-center justify-between border-b p-6 dark:border-gray-700'>
          <h3 className='text-xl font-bold dark:text-white'>
            {mode === 'create'
              ? 'Crear Nuevo Producto'
              : `Editar Producto #${product?.id}`}
          </h3>
          <button
            onClick={onClose}
            className='rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400'
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Formulario */}
        <div className='overflow-y-auto p-6 flex-1'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Columna Izquierda - Datos básicos */}
            <div className='space-y-4'>
              {/* Nombre */}
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Nombre del Producto *
                </label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                  placeholder='Ej: Camiseta básica'
                />
              </div>

              {/* Categoría */}
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Categoría *
                </label>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        category: e.target.value.toUpperCase()
                      })
                      setSelectorCategory('CATEGORIES')
                    }}
                    className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                    placeholder='Ej: Ropa, Accesorios'
                  />
                  <select
                    className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                    value={selectorCategory}
                    onChange={(e) => {
                      if (e.target.value === 'CATEGORIES') {
                        setFormData({ ...formData, category: '' })
                        setSelectorCategory('CATEGORIES')
                      } else {
                        setFormData({ ...formData, category: e.target.value })
                        setSelectorCategory(e.target.value)
                      }
                    }}
                  >
                    <option value='CATEGORIES'>Seleccionar</option>
                    {kpiData.categories?.map((category, index) => (
                      <option key={index} value={category.name}>
                        {category.name || 'No hay categorías'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Talla */}
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Talla
                </label>
                <input
                  type='text'
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      size: e.target.value.toUpperCase()
                    })
                  }
                  className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                  placeholder='Ej: M, 42, Única'
                />
              </div>

              {/* Precio y Stock */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Precio (S/) *
                  </label>
                  <input
                    type='number'
                    value={formData.price === 0 ? '' : formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0
                      })
                    }
                    step='0.1'
                    min='0'
                    className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                    placeholder='0.00'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Stock *
                  </label>
                  <input
                    type='number'
                    value={formData.stock === 0 ? '' : formData.stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: parseInt(e.target.value) || 0
                      })
                    }
                    min='0'
                    className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                    placeholder='0'
                  />
                </div>
              </div>

              {/* Estado y Destacado */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({ ...formData, estado: e.target.value })
                    }
                    className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                  >
                    <option value='DISPONIBLE'>DISPONIBLE</option>
                    <option value='NO DISPONIBLE'>NO DISPONIBLE</option>
                  </select>
                </div>

                <div className='flex items-center'>
                  <div className='mt-6'>
                    <label className='flex items-center gap-2'>
                      <input
                        type='checkbox'
                        checked={formData.destacado}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            destacado: e.target.checked
                          })
                        }
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700'
                        disabled={kpiData.destacadosCount >= 4}
                      />
                      <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        {kpiData.destacadosCount >= 4 && !formData.destacado
                          ? 'Destacados 4/4'
                          : 'Destacado'}
                      </span>
                    </label>
                    {formData.destacado && (
                      <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                        Máximo 4 productos destacados
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha - Gestión de Imágenes */}
            <div className='space-y-4'>
              <ImageManager
                mainImage={formData.image}
                secondaryImage={formData.image2}
                onMainImageChange={async (url) => {
                  setFormData((prev) => {
                    return {
                      ...prev,
                      image: url
                    }
                  })
                }}
                onSecondaryImageChange={async (url) => {
                  setFormData((prev) => {
                    return { ...prev, image2: url }
                  })
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='border-t p-6 bg-gray-50 dark:bg-gray-700/30 dark:border-gray-700 flex justify-between items-center'>
          <div className='text-sm text-gray-500 dark:text-gray-400'>
            {mode === 'edit' && product ? (
              <>
                Última actualización:{' '}
                {new Date(product.updatedAt).toLocaleDateString()}
              </>
            ) : (
              <>Los campos marcados con * son obligatorios</>
            )}
          </div>
          <div className='flex gap-3'>
            <button
              onClick={onClose}
              className='px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors'
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !formData.name ||
                !formData.category ||
                !formData.image ||
                formData.price <= 0
              }
              className='px-6 py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isSubmitting
                ? 'Guardando...'
                : mode === 'create'
                ? 'Crear Producto'
                : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductForm
