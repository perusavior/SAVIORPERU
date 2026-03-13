// components/CuponesCRUD.tsx
'use client'

import { useState, useEffect } from 'react'
import KpiCard from './shared/KpiCard'
import { BiSolidCoupon } from 'react-icons/bi'
import { LuActivity } from 'react-icons/lu'
import { IoAdd } from 'react-icons/io5'
import { MdDelete, MdEdit } from 'react-icons/md'
import { IoIosCopy } from 'react-icons/io'

interface Cupon {
  id: number
  codigoCupon: string
  mostrarCupon: boolean
  descuento: number
  createdAt: string
  updatedAt: string
}

export default function CuponesCRUD() {
  const [cupones, setCupones] = useState<Cupon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filtroMostrar, setFiltroMostrar] = useState<string>('todos')
  const [formData, setFormData] = useState({
    codigoCupon: '',
    mostrarCupon: false,
    descuento: 0
  })
  const [editingId, setEditingId] = useState<number | null>(null)

  // Cargar cupones
  const fetchCupones = async () => {
    setLoading(true)
    setError(null)
    try {
      const url =
        filtroMostrar === 'todos'
          ? '/api/cupones'
          : `/api/cupones?mostrar=${filtroMostrar}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Error al cargar cupones')
      }
      const data = await response.json()
      setCupones(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCupones()
  }, [filtroMostrar])

  // Crear o actualizar cupón
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validaciones
    if (formData.descuento < 0 || formData.descuento > 100) {
      setError('El descuento debe estar entre 0 y 100')
      return
    }

    try {
      if (editingId) {
        // Actualizar
        const response = await fetch(`/api/cupones/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Error al actualizar')
        }

        const updated = await response.json()
        setCupones(cupones.map((cup) => (cup.id === editingId ? updated : cup)))
        setEditingId(null)
        setSuccess('Cupón actualizado correctamente')
      } else {
        // Crear
        const response = await fetch('/api/cupones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Error al crear')
        }

        const newCupon = await response.json()
        setCupones([newCupon, ...cupones])
        setSuccess('Cupón creado correctamente')
      }

      setFormData({
        codigoCupon: '',
        mostrarCupon: false,
        descuento: 0
      })

      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setTimeout(() => setError(null), 5000)
    }
  }

  // Eliminar cupón
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este cupón?')) return

    try {
      const response = await fetch(`/api/cupones/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar')
      }

      setCupones(cupones.filter((cup) => cup.id !== id))
      setSuccess('Cupón eliminado correctamente')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setTimeout(() => setError(null), 5000)
    }
  }

  // Editar cupón
  const handleEdit = (cupon: Cupon) => {
    setFormData({
      codigoCupon: cupon.codigoCupon,
      mostrarCupon: cupon.mostrarCupon,
      descuento: cupon.descuento
    })
    setEditingId(cupon.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Cancelar edición
  const handleCancel = () => {
    setFormData({
      codigoCupon: '',
      mostrarCupon: false,
      descuento: 0
    })
    setEditingId(null)
  }

  // Generar código aleatorio
  const generarCodigo = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let codigo = ''
    for (let i = 0; i < 8; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
    }
    setFormData({ ...formData, codigoCupon: codigo })
  }

  return (
    <main className='flex flex-1 flex-col bg-gray-50 dark:bg-gray-900 pb-12'>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 lg:p-8'>
        <h1 className='text-2xl md:text-3xl font-bold mb-6'>
          Gestión de Cupones
        </h1>

        {/* Mensajes de éxito/error */}
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-fade-in'>
            {error}
          </div>
        )}

        {success && (
          <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 animate-fade-in'>
            {success}
          </div>
        )}

        {/* Estadísticas */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <KpiCard
            Icon={BiSolidCoupon}
            color='blue'
            title='Total Cupones'
            value={cupones.length.toString()}
            isNegative={cupones.length === 0}
            trend='Cupones registrados'
          />
          <KpiCard
            Icon={LuActivity}
            color='purple'
            title='Total Activos'
            value={cupones.filter((c) => c.mostrarCupon).length.toString()}
            isNegative={cupones.length === 0}
            trend='Cupones funcionando'
          />
          {/* <KpiCard
            Icon={BiSolidCoupon}
            color='indigo'
            title='Descuento Promedio'
            value={`${
              cupones.length > 0
                ? Math.round(
                    cupones.reduce((acc, c) => acc + c.descuento, 0) /
                      cupones.length
                  )
                : 0
            }%`}
            isNegative={cupones.length === 0}
            trend='Por cupon'
          />
          <div className='bg-white p-4 rounded-lg shadow'>
            <h4 className='text-sm font-medium text-gray-500'>
              Descuento Promedio
            </h4>
            <p className='text-2xl font-bold text-blue-600'>
              {cupones.length > 0
                ? Math.round(
                    cupones.reduce((acc, c) => acc + c.descuento, 0) /
                      cupones.length
                  )
                : 0}
              %
            </p>
          </div> */}
        </div>

        {/* Formulario */}
        <div className='bg-whit dark:bg-gray-800 p-6 rounded-lg shadow-md'>
          <h2 className='text-lg md:text-xl font-semibold mb-4'>
            {editingId ? (
              '✏️ Editar Cupón'
            ) : (
              <div className='flex items-center gap-1'>
                <IoAdd /> Nuevo Cupón
              </div>
            )}
          </h2>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='codigoCupon'
                  className='block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300'
                >
                  Código del Cupón
                </label>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    id='codigoCupon'
                    value={formData.codigoCupon}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        codigoCupon: e.target.value.toUpperCase()
                      })
                    }
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white'
                    placeholder='Ej: DESCUENTO20'
                    maxLength={50}
                  />
                  <button
                    type='button'
                    onClick={generarCodigo}
                    className='px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 whitespace-nowrap'
                  >
                    Generar
                  </button>
                </div>
                <p className='text-xs text-gray-500 mt-1 dark:text-gray-400'>
                  Dejar vacío para código automático
                </p>
              </div>

              <div>
                <label
                  htmlFor='descuento'
                  className='block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300'
                >
                  Descuento (%)
                </label>
                <input
                  type='number'
                  id='descuento'
                  value={formData.descuento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      descuento: parseInt(e.target.value) || 0
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  min='0'
                  max='100'
                  step='1'
                />
                <div className='flex items-center mt-2'>
                  <input
                    type='range'
                    min='0'
                    max='100'
                    value={formData.descuento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        descuento: parseInt(e.target.value)
                      })
                    }
                    className='flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                  />
                  <span className='ml-3 text-sm font-medium'>
                    {formData.descuento}%
                  </span>
                </div>
              </div>
            </div>

            <div className='flex items-center'>
              <input
                type='checkbox'
                id='mostrarCupon'
                checked={formData.mostrarCupon}
                onChange={(e) =>
                  setFormData({ ...formData, mostrarCupon: e.target.checked })
                }
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              />
              <label
                htmlFor='mostrarCupon'
                className='ml-2 block text-sm text-gray-700 dark:text-gray-400'
              >
                Mostrar cupón disponible para uso
              </label>
            </div>

            <div className='flex gap-2 pt-2'>
              <button
                type='submit'
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'
              >
                {editingId ? 'Actualizar Cupón' : 'Crear Cupón'}
              </button>

              {editingId && (
                <button
                  type='button'
                  onClick={handleCancel}
                  className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors'
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Filtros */}

        {/* Lista de cupones */}
        <div className='shadow-md overflow-hidden'>
          <div className='flex justify-between'>
            <div className='mb-2'>
              <h2 className='text-lg md:text-xl font-semibold'>
                Lista de Cupones
              </h2>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                Mostrando {cupones.length} cupón
                {cupones.length !== 1 ? 'es' : ''}
              </p>
            </div>
            <div>
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                <h3 className='text-lg font-semibold'>Filtrar Cupones</h3>
                <div className='flex gap-2'>
                  <button
                    onClick={() => setFiltroMostrar('todos')}
                    className={`px-4 py-2 rounded-md ${
                      filtroMostrar === 'todos'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFiltroMostrar('true')}
                    className={`px-4 py-2 rounded-md ${
                      filtroMostrar === 'true'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Activos
                  </button>
                  <button
                    onClick={() => setFiltroMostrar('false')}
                    className={`px-4 py-2 rounded-md ${
                      filtroMostrar === 'false'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Inactivos
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className='p-8 text-center'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              <p className='mt-2 text-gray-600'>Cargando cupones...</p>
            </div>
          ) : cupones.length === 0 ? (
            <div className='p-8 text-center text-gray-500'>
              <p className='text-lg'>No hay cupones creados</p>
              <p className='text-sm mt-1'>Comienza creando tu primer cupón</p>
            </div>
          ) : (
            <div className='overflow-x-auto dark:bg-gray-800 rounded-xl'>
              <table className='w-full text-left text-sm text-gray-600 dark:text-gray-400'>
                <thead className='bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-700/50 dark:text-gray-300'>
                  <tr>
                    <th className='px-6 py-4 font-bold'>ID</th>
                    <th className='px-6 py-4 font-bold'>Código</th>
                    <th className='px-6 py-4 font-bold'>Descuento</th>
                    <th className='px-6 py-4 font-bold'>Estado</th>
                    <th className='px-6 py-4 font-bold'>Creado</th>
                    <th className='px-6 py-4 text-right font-bold'>Acciones</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100 dark:divide-gray-700'>
                  {cupones.map((cupon) => (
                    <tr
                      key={cupon.id}
                      className='hover:bg-gray-50/50 transition-colors group dark:hover:bg-gray-700/30'
                    >
                      <td className='px-6 py-4'>
                        <span className='font-mono text-sm text-gray-900 dark:text-white'>
                          #{cupon.id}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center'>
                          <code className='text-sm font-mono bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded'>
                            {cupon.codigoCupon}
                          </code>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(cupon.codigoCupon)
                            }
                            className='ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            title='Copiar código'
                          >
                            <IoIosCopy className='h-5 w-5' />
                          </button>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-orange-600 dark:bg-red-900/30 dark:text-orange-400'>
                          {cupon.descuento}% OFF
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cupon.mostrarCupon
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-300'
                          }`}
                        >
                          {cupon.mostrarCupon ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <span className='text-sm text-gray-500 dark:text-gray-400'>
                          {new Date(cupon.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <div className='flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all'>
                          <button
                            onClick={() => handleEdit(cupon)}
                            className='p-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-lg transition-colors'
                            title='Editar'
                          >
                            <MdEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(cupon.id)}
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

        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `}</style>
      </div>
    </main>
  )
}
