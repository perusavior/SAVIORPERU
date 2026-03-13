// components/CategoriesCRUD.tsx
'use client'

import { useState, useEffect } from 'react'
import { MdEdit, MdDelete, MdCategory } from 'react-icons/md'

interface Category {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export default function CategoriesCRUD() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: ''
  })
  const [editingId, setEditingId] = useState<number | null>(null)

  // Cargar categorías
  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Error al cargar categorías')
      }
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Crear o actualizar categoría
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('El nombre es requerido')
      return
    }

    try {
      if (editingId) {
        // Actualizar
        const response = await fetch(`/api/categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Error al actualizar')
        }

        const updated = await response.json()
        setCategories(
          categories.map((cat) => (cat.id === editingId ? updated : cat))
        )
        setEditingId(null)
      } else {
        // Crear
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Error al crear')
        }

        const newCategory = await response.json()
        setCategories([newCategory, ...categories])
      }

      setFormData({ name: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  // Eliminar categoría
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar')
      }

      setCategories(categories.filter((cat) => cat.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  // Editar categoría
  const handleEdit = (category: Category) => {
    setFormData({ name: category.name })
    setEditingId(category.id)
  }

  // Cancelar edición
  const handleCancel = () => {
    setFormData({ name: '' })
    setEditingId(null)
  }

  return (
    <div className='w-full mb-4 flex flex-col gap-4'>
      <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
        {' '}
        <MdCategory className='inline mr-2' /> Gestión de Categorías
      </h3>
      {/* <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
                      <MdCollections className='inline mr-2' />
                      Gestión de Colecciones
                      <span className='ml-2 text-sm font-normal text-gray-500'>
                        (Máximo 4 colecciones)
                      </span>
                    </h3> */}

      {error && (
        <div className='border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      <div className='grid grid-cols-2 gap-6 h-auto'>
        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className='dark:bg-gray-800 p-6 rounded-lg shadow-md h-full max-h-56'
        >
          <h2 className='text-lg font-semibold mb-4'>
            {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>

          <div className='mb-4'>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2'
            >
              Nombre *
            </label>
            <input
              type='text'
              id='name'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Nombre de la categoría'
              required
            />
          </div>

          <div className='flex gap-2'>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            >
              {editingId ? 'Actualizar' : 'Crear'}
            </button>

            {editingId && (
              <button
                type='button'
                onClick={handleCancel}
                className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Lista de categorías */}
        <div className='shadow-md overflow-hidden'>
          {/* <div className='px-6 py-4'>
            <h2 className='text-lg font-semibold'>Categorías Existentes</h2>
          </div> */}

          {loading ? (
            <div className='p-6 text-center'>
              <p>Cargando categorías...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className='p-6 text-center text-gray-500'>
              No hay categorías creadas
            </div>
          ) : (
            <div className='overflow-x-auto dark:bg-gray-800 rounded-xl'>
              <table className='w-full text-left text-sm text-gray-600 dark:text-gray-400'>
                <thead className='bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-700/50 dark:text-gray-300'>
                  <tr>
                    <th className='px-6 py-4 font-bold'>ID</th>
                    <th className='px-6 py-4 font-bold'>Nombre</th>
                    <th className='px-6 py-4 font-bold'>Creado</th>
                    <th className='px-6 py-4 text-right font-bold'>Acciones</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100 dark:divide-gray-700'>
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className='hover:bg-gray-50/50 transition-colors group dark:hover:bg-gray-700/30'
                    >
                      <td className='px-6 py-4'>
                        <span className='text-sm text-gray-900 dark:text-white'>
                          {category.id}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <span className='font-semibold text-gray-900 dark:text-white'>
                          {category.name}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <span className='text-sm'>
                          {new Date(category.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <div className='flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all'>
                          <button
                            onClick={() => handleEdit(category)}
                            className='p-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-lg transition-colors'
                            title='Editar'
                          >
                            <MdEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className='p-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-colors'
                            title='Eliminar'
                          >
                            <MdDelete size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
