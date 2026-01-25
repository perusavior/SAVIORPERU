'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  MdSearch,
  MdEdit,
  MdDelete,
  MdClose,
  MdAdd,
  MdImage,
  MdPhone,
  MdLink,
  MdLocalShipping,
  MdCollections,
  MdSettings,
  MdSave,
  MdCancel,
  MdWarning
} from 'react-icons/md'
import { toast } from 'sonner'
import { z } from 'zod'
import ImageManager from './products/ImageManager'
import CategoriesCRUD from './CategoriesCRUD'
import CuponesCRUD from './CuponesCRUD'

// --- Interfaces ---
interface Coleccion {
  id: number
  name: string
  image: string
  createdAt: string
  updatedAt: string
}

interface Pagination {
  total: number
}

// --- Esquemas de Validación ---
const settingSchema = z.object({
  // Delivery
  minimoDelivery: z.string().regex(/^\d+$/, 'Debe ser un número válido'),
  maximoDelivery: z.string().regex(/^\d+$/, 'Debe ser un número válido'),

  // Imágenes
  imagenIzquierda: z.string().url('Debe ser una URL válida'),
  imagenDerecha: z.string().url('Debe ser una URL válida'),
  fotoTienda: z.string().url('Debe ser una URL válida'),

  // Contacto
  telefono: z
    .string()
    .regex(/^9\d{8}$/, 'Teléfono peruano inválido (9XXXXXXXX)'),
  correo: z.string().email('Correo electrónico inválido'),

  // Redes Sociales
  instagram: z.string().url('Debe ser una URL válida'),
  facebook: z.string().url('Debe ser una URL válida'),
  tiktok: z.string().url('Debe ser una URL válida')
})

const coleccionSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'Nombre muy largo'),
  image: z.string().url('La imagen debe ser una URL válida')
})

// --- Componente Principal ---
const SettingsManagement: React.FC = () => {
  // Estados para Configuraciones
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [editingSettings, setEditingSettings] = useState(false)
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({})
  const [settingsErrors, setSettingsErrors] = useState<Record<string, string>>(
    {}
  )

  // Estados para Colecciones
  const [colecciones, setColecciones] = useState<Coleccion[]>([])
  const [loadingColecciones, setLoadingColecciones] = useState(true)
  const [selectedColeccion, setSelectedColeccion] = useState<Coleccion | null>(
    null
  )
  const [isEditingColeccion, setIsEditingColeccion] = useState(false)
  const [coleccionForm, setColeccionForm] = useState({ name: '', image: '' })
  const [coleccionErrors, setColeccionErrors] = useState<{
    name: string
    image: string
  }>({
    name: '',
    image: ''
  })

  // Estados para Paginación
  const [pagination, setPagination] = useState<Pagination>({
    total: 0
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Cargar Configuraciones
  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true)
    try {
      const response = await fetch('/api/settings')
      if (!response.ok) throw new Error('Error al obtener configuraciones')
      const result = await response.json()
      setSettings(result.data)
      setSettingsForm(result.data)
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('No se pudieron cargar las configuraciones')
    } finally {
      setLoadingSettings(false)
    }
  }, [])

  // Cargar Colecciones - CORREGIDO
  const fetchColecciones = useCallback(async (search: string = '') => {
    setLoadingColecciones(true)
    try {
      let queryParam = `page=1&limit=10`
      if (search) queryParam += `&search=${encodeURIComponent(search)}`

      const response = await fetch(`/api/colecciones?${queryParam}`)
      if (!response.ok) throw new Error('Error al obtener colecciones')
      const result = await response.json()

      // Estructura corregida según tu endpoint
      setColecciones(result.data.colecciones)
      setPagination(result.pagination)
    } catch (error) {
      console.error('Error fetching colecciones:', error)
      toast.error('No se pudieron cargar las colecciones')
    } finally {
      setLoadingColecciones(false)
    }
  }, [])

  // Inicializar
  useEffect(() => {
    fetchSettings()
    fetchColecciones()
  }, [fetchSettings, fetchColecciones])

  // Buscar con debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(
      () => {
        fetchColecciones(searchTerm)
      },
      searchTerm ? 500 : 0
    )

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, fetchColecciones])

  // --- Funciones para Configuraciones ---
  const handleSaveSettings = async () => {
    try {
      // Validar
      const validatedData = settingSchema.parse(settingsForm)
      setSettingsErrors({})

      // Guardar
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData)
      })

      if (!response.ok) throw new Error()

      toast.success('Configuraciones guardadas exitosamente')
      setEditingSettings(false)
      fetchSettings()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) errors[err.path[0].toString()] = err.message
        })
        setSettingsErrors(errors)
        toast.error('Hay errores en el formulario')
      } else {
        toast.error('Error al guardar configuraciones')
      }
    }
  }

  const handleSettingChange = (key: string, value: string) => {
    setSettingsForm((prev) => ({ ...prev, [key]: value }))
    if (settingsErrors[key]) {
      setSettingsErrors((prev) => ({ ...prev, [key]: '' }))
    }
  }

  // --- Funciones para Colecciones ---
  const handleSaveColeccion = async () => {
    try {
      // Validar
      const validatedData = coleccionSchema.parse(coleccionForm)
      setColeccionErrors({ name: '', image: '' })

      if (colecciones.length >= 4 && !selectedColeccion) {
        toast.error('Máximo 4 colecciones permitidas')
        return
      }

      let response: Response
      if (selectedColeccion) {
        // Actualizar
        response = await fetch(`/api/colecciones/${selectedColeccion.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validatedData)
        })
      } else {
        // Crear
        response = await fetch('/api/colecciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validatedData)
        })
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al guardar colección')
      }

      toast.success(
        `Colección ${selectedColeccion ? 'actualizada' : 'creada'} exitosamente`
      )
      resetColeccionForm()
      fetchColecciones(searchTerm)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: { name: string; image: string } = { name: '', image: '' }
        error.errors.forEach((err) => {
          if (err.path[0]) {
            const key = err.path[0].toString() as 'name' | 'image'
            errors[key] = err.message
          }
        })
        setColeccionErrors(errors)
        toast.error('Hay errores en el formulario')
      } else {
        toast.error(
          error instanceof Error ? error.message : 'Error al guardar colección'
        )
      }
    }
  }

  const handleDeleteColeccion = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta colección?')) return

    try {
      const response = await fetch(`/api/colecciones/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error()

      toast.success('Colección eliminada exitosamente')
      fetchColecciones(searchTerm)
    } catch (error) {
      toast.error('Error al eliminar la colección')
    }
  }

  const resetColeccionForm = () => {
    setSelectedColeccion(null)
    setIsEditingColeccion(false)
    setColeccionForm({ name: '', image: '' })
    setColeccionErrors({ name: '', image: '' })
  }

  const handleEditColeccion = (coleccion: Coleccion) => {
    setSelectedColeccion(coleccion)
    setIsEditingColeccion(true)
    setColeccionForm({
      name: coleccion.name,
      image: coleccion.image
    })
  }

  return (
    <>
      <main className='flex flex-1 flex-col bg-gray-50 dark:bg-gray-900 pb-12'>
        <div className='mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 lg:p-8'>
          {/* Header */}
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-white lg:text-3xl'>
                Panel de Configuraciones
              </h2>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Gestiona configuraciones globales y colecciones del sistema.
              </p>
            </div>
          </div>

          {/* Sección de Configuraciones */}
          <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
                <MdSettings className='inline mr-2' />
                Configuraciones del Sistema
              </h3>
              {!editingSettings ? (
                <button
                  onClick={() => setEditingSettings(true)}
                  className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors'
                >
                  <MdEdit /> Editar Configuraciones
                </button>
              ) : (
                <div className='flex gap-2'>
                  <button
                    onClick={() => {
                      setEditingSettings(false)
                      setSettingsForm(settings)
                      setSettingsErrors({})
                    }}
                    className='flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors'
                  >
                    <MdCancel /> Cancelar
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className='flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors'
                  >
                    <MdSave /> Guardar Cambios
                  </button>
                </div>
              )}
            </div>

            {/* Formulario de Configuraciones */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Delivery */}
              <div
                className={`${
                  loadingSettings ? 'animate-pulse' : ''
                } space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:bg-gray-800 dark:border-gray-700`}
              >
                <h4 className='flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300'>
                  <MdLocalShipping /> Configuración de Delivery
                </h4>
                <div className='space-y-3'>
                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Mínimo Delivery (S/)
                    </label>
                    <input
                      type='text'
                      value={settingsForm.minimoDelivery || ''}
                      onChange={(e) =>
                        handleSettingChange('minimoDelivery', e.target.value)
                      }
                      disabled={!editingSettings}
                      className={`w-full rounded-lg border px-3 py-2 ${
                        settingsErrors.minimoDelivery
                          ? 'border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 disabled:opacity-50`}
                    />
                    {settingsErrors.minimoDelivery && (
                      <p className='mt-1 text-xs text-red-500'>
                        {settingsErrors.minimoDelivery}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Máximo Delivery (S/)
                    </label>
                    <input
                      type='text'
                      value={settingsForm.maximoDelivery || ''}
                      onChange={(e) =>
                        handleSettingChange('maximoDelivery', e.target.value)
                      }
                      disabled={!editingSettings}
                      className={`w-full rounded-lg border px-3 py-2 ${
                        settingsErrors.maximoDelivery
                          ? 'border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 disabled:opacity-50`}
                    />
                    {settingsErrors.maximoDelivery && (
                      <p className='mt-1 text-xs text-red-500'>
                        {settingsErrors.maximoDelivery}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div
                className={`${
                  loadingSettings ? 'animate-pulse' : ''
                } space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:bg-gray-800 dark:border-gray-700`}
              >
                <h4 className='flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300'>
                  <MdPhone /> Información de Contacto
                </h4>
                <div className='space-y-3'>
                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Teléfono
                    </label>
                    <input
                      type='text'
                      value={settingsForm.telefono || ''}
                      onChange={(e) =>
                        handleSettingChange('telefono', e.target.value)
                      }
                      disabled={!editingSettings}
                      className={`w-full rounded-lg border px-3 py-2 ${
                        settingsErrors.telefono
                          ? 'border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 disabled:opacity-50`}
                      placeholder='9XXXXXXXX'
                    />
                    {settingsErrors.telefono && (
                      <p className='mt-1 text-xs text-red-500'>
                        {settingsErrors.telefono}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Correo Electrónico
                    </label>
                    <input
                      type='email'
                      value={settingsForm.correo || ''}
                      onChange={(e) =>
                        handleSettingChange('correo', e.target.value)
                      }
                      disabled={!editingSettings}
                      className={`w-full rounded-lg border px-3 py-2 ${
                        settingsErrors.correo
                          ? 'border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 disabled:opacity-50`}
                    />
                    {settingsErrors.correo && (
                      <p className='mt-1 text-xs text-red-500'>
                        {settingsErrors.correo}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Imágenes */}
              <div
                className={`${
                  loadingSettings ? 'animate-pulse' : ''
                } space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:bg-gray-800 dark:border-gray-700`}
              >
                <h4 className='flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300'>
                  <MdImage /> Imágenes del Sistema
                </h4>
                <div className='grid grid-cols-2 gap-4'>
                  {['imagenIzquierda', 'imagenDerecha', 'fotoTienda'].map(
                    (key) => (
                      <div key={key}>
                        <label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                          {key === 'imagenIzquierda'
                            ? 'Imagen Izquierda'
                            : key === 'imagenDerecha'
                            ? 'Imagen Derecha'
                            : 'Foto de Tienda'}
                        </label>
                        <div className='flex gap-2'>
                          <ImageManager
                            mainImage={settingsForm[key] || ''}
                            onMainImageChange={(url) => {
                              handleSettingChange(key, url)
                            }}
                            imageFrom={'systemImages'}
                            editImage={editingSettings}
                          />
                        </div>
                        {settingsErrors[key] && (
                          <p className='mt-1 text-xs text-red-500'>
                            {settingsErrors[key]}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Redes Sociales */}
              <div
                className={`${
                  loadingSettings ? 'animate-pulse' : ''
                } space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:bg-gray-800 dark:border-gray-700`}
              >
                <h4 className='flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300'>
                  <MdLink /> Redes Sociales
                </h4>
                <div className='space-y-3'>
                  {['instagram', 'facebook', 'tiktok'].map((key) => (
                    <div key={key}>
                      <label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize'>
                        {key}
                      </label>
                      <input
                        type='text'
                        value={settingsForm[key] || ''}
                        onChange={(e) =>
                          handleSettingChange(key, e.target.value)
                        }
                        disabled={!editingSettings}
                        className={`w-full rounded-lg border px-3 py-2 ${
                          settingsErrors[key]
                            ? 'border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 disabled:opacity-50`}
                        placeholder='https://...'
                      />
                      {settingsErrors[key] && (
                        <p className='mt-1 text-xs text-red-500'>
                          {settingsErrors[key]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Seccion de Categorias */}
          <CategoriesCRUD />

          {/* Sección de Colecciones */}
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
              <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
                <MdCollections className='inline mr-2' />
                Gestión de Colecciones
                <span className='ml-2 text-sm font-normal text-gray-500'>
                  (Máximo 4 colecciones)
                </span>
              </h3>

              <div className='flex gap-4'>
                <div className='relative w-full sm:w-64'>
                  <MdSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl dark:text-gray-500' />
                  {/* <input
                    type='text'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-500/30'
                    placeholder='Buscar colecciones...'
                  /> */}
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400'
                    >
                      <MdClose />
                    </button>
                  )}
                </div>

                {colecciones.length < 4 && (
                  <button
                    onClick={() => setIsEditingColeccion(true)}
                    className='flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors'
                  >
                    <MdAdd /> Nueva Colección
                  </button>
                )}
              </div>
            </div>

            {/* Contador */}
            <div className='flex items-center justify-between'>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Mostrando{' '}
                <span className='font-bold'>{colecciones.length}</span> de{' '}
                <span className='font-bold'>{pagination.total}</span>{' '}
                colecciones
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Límite:{' '}
                <span className='font-bold'>{colecciones.length}/4</span>
              </div>
            </div>

            {/* Tabla de Colecciones */}
            <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700'>
              <div className='overflow-x-auto'>
                <table className='w-full text-left text-sm text-gray-600 dark:text-gray-400'>
                  <thead className='bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-700/50 dark:text-gray-300'>
                    <tr>
                      <th className='px-6 py-4 font-bold'>Imagen</th>
                      <th className='px-6 py-4 font-bold'>Nombre</th>
                      <th className='px-6 py-4 font-bold'>Actualizado</th>
                      <th className='px-6 py-4 font-bold'>Creado</th>
                      <th className='px-6 py-4 text-right font-bold'>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100 dark:divide-gray-700'>
                    {loadingColecciones ? (
                      <tr>
                        <td colSpan={5} className='px-6 py-12 text-center'>
                          <div className='flex justify-center'>
                            <div className='h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'></div>
                          </div>
                        </td>
                      </tr>
                    ) : colecciones.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className='px-6 py-12 text-center text-gray-500 dark:text-gray-400'
                        >
                          {searchTerm
                            ? 'No se encontraron colecciones'
                            : 'No hay colecciones registradas'}
                        </td>
                      </tr>
                    ) : (
                      colecciones.map((coleccion) => (
                        <tr
                          key={coleccion.id}
                          className='hover:bg-gray-50/50 transition-colors group dark:hover:bg-gray-700/30'
                        >
                          <td className='px-6 py-4'>
                            <img
                              src={coleccion.image}
                              alt={coleccion.name}
                              className='h-12 w-12 rounded-lg object-cover border'
                            />
                          </td>
                          <td className='px-6 py-4'>
                            <span className='font-semibold text-gray-900 dark:text-white'>
                              {coleccion.name}
                            </span>
                          </td>
                          <td className='px-6 py-4'>
                            <span className='text-sm'>
                              {new Date(
                                coleccion.updatedAt
                              ).toLocaleDateString()}
                            </span>
                          </td>
                          <td className='px-6 py-4'>
                            <span className='text-sm'>
                              {new Date(
                                coleccion.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </td>
                          <td className='px-6 py-4 text-right'>
                            <div className='flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all'>
                              <button
                                onClick={() => handleEditColeccion(coleccion)}
                                className='p-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-lg transition-colors'
                                title='Editar'
                              >
                                <MdEdit size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteColeccion(coleccion.id)
                                }
                                className='p-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-colors'
                                title='Eliminar'
                              >
                                <MdDelete size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal para Colecciones */}
      {(isEditingColeccion || selectedColeccion) && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'>
          <div className='w-full max-w-md max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 dark:bg-gray-800'>
            <div className='flex items-center justify-between border-b p-6 dark:border-gray-700'>
              <h3 className='text-xl font-bold dark:text-white'>
                {selectedColeccion ? 'Editar Colección' : 'Nueva Colección'}
              </h3>
              <button
                onClick={resetColeccionForm}
                className='rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400'
              >
                <MdClose size={24} />
              </button>
            </div>

            <div className='overflow-y-auto p-6 flex-1'>
              <div className='space-y-4'>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Nombre de la Colección *
                  </label>
                  <input
                    type='text'
                    value={coleccionForm.name}
                    onChange={(e) => {
                      setColeccionForm((prev) => ({
                        ...prev,
                        name: e.target.value
                      }))
                      if (coleccionErrors.name)
                        setColeccionErrors((prev) => ({ ...prev, name: '' }))
                    }}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      coleccionErrors.name
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700`}
                    placeholder='Ej: Colección Verano 2024'
                  />
                  {coleccionErrors.name && (
                    <p className='mt-1 text-xs text-red-500'>
                      {coleccionErrors.name}
                    </p>
                  )}
                </div>

                <div className='space-y-4'>
                  <ImageManager
                    mainImage={coleccionForm.image}
                    onMainImageChange={async (url) => {
                      setColeccionForm((prev) => ({
                        ...prev,
                        image: url
                      }))
                    }}
                    imageFrom={'colection'}
                  />
                </div>

                {colecciones.length >= 4 && !selectedColeccion && (
                  <div className='p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700'>
                    <div className='flex items-center gap-2 text-amber-700 dark:text-amber-400'>
                      <MdWarning />
                      <span className='text-sm font-medium'>
                        Has alcanzado el límite máximo de 4 colecciones.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='border-t p-6 bg-gray-50 dark:bg-gray-700/30 dark:border-gray-700 flex justify-between items-center'>
              <button
                onClick={resetColeccionForm}
                className='px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors'
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveColeccion}
                disabled={!coleccionForm.image || !coleccionForm.name}
                className='px-6 py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 disabled:bg-blue-700'
              >
                <>
                  <MdSave />
                  Aceptar
                </>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SettingsManagement
