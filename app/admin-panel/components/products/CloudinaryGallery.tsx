'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { MdClose, MdDelete, MdCheckCircle, MdExpandMore } from 'react-icons/md'
import { toast } from 'sonner'

interface CloudinaryGalleryProps {
  onClose: () => void
  onSelectImages: (images: string[]) => void
  maxSeleted: number
}

interface CloudinaryImage {
  public_id: string
  secure_url: string
  created_at: string
  bytes: number
  format: string
}

const CloudinaryGallery: React.FC<CloudinaryGalleryProps> = ({
  onClose,
  onSelectImages,
  maxSeleted
}) => {
  const [cloudinaryImages, setCloudinaryImages] = useState<CloudinaryImage[]>(
    []
  )
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMoreImages, setHasMoreImages] = useState(true)

  // Fetch imágenes de Cloudinary con paginación
  const fetchCloudinaryImages = useCallback(
    async (cursor: string | null = null, isLoadMore: boolean = false) => {
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      try {
        const url = cursor
          ? `/api/cloudinary-list?next_cursor=${cursor}&max_results=30`
          : '/api/cloudinary-list?max_results=30'

        const response = await fetch(url)
        if (!response.ok) throw new Error('Error al obtener imágenes')

        const result = await response.json()

        if (isLoadMore) {
          // Agregar nuevas imágenes a las existentes
          setCloudinaryImages((prev) => [...prev, ...result.resources])
        } else {
          // Reemplazar todas las imágenes
          setCloudinaryImages(result.resources)
        }

        setNextCursor(result.next_cursor)
        setHasMoreImages(result.has_more)
      } catch (error) {
        console.error('Error fetching cloudinary images:', error)
        if (!isLoadMore) {
          toast.error('No se pudieron cargar las imágenes')
        }
      } finally {
        if (isLoadMore) {
          setLoadingMore(false)
        } else {
          setLoading(false)
        }
      }
    },
    []
  )

  // Cargar más imágenes
  const handleLoadMore = () => {
    if (nextCursor && !loadingMore && hasMoreImages) {
      fetchCloudinaryImages(nextCursor, true)
    }
  }

  // Verificar si estamos cerca del final del scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget
      const scrollThreshold = 100 // px desde el fondo

      if (
        container.scrollHeight - container.scrollTop <=
          container.clientHeight + scrollThreshold &&
        !loadingMore &&
        hasMoreImages &&
        nextCursor
      ) {
        handleLoadMore()
      }
    },
    [loadingMore, hasMoreImages, nextCursor]
  )

  useEffect(() => {
    fetchCloudinaryImages()
  }, [fetchCloudinaryImages])

  // Seleccionar/deseleccionar imagen
  const toggleImageSelection = (imageUrl: string) => {
    if (selectedImages.includes(imageUrl)) {
      setSelectedImages((prev) => prev.filter((url) => url !== imageUrl))
    } else if (selectedImages.length < maxSeleted) {
      setSelectedImages((prev) => [...prev, imageUrl])
    } else {
      toast.warning(`Solo puedes seleccionar hasta ${maxSeleted} imágenes`)
    }
  }

  // Eliminar imagen de Cloudinary
  const deleteImage = async (imageUrl: string) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen permanentemente?'))
      return

    try {
      const response = await fetch('/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      })

      if (!response.ok) throw new Error()

      // Eliminar imagen de la lista local
      setCloudinaryImages((prev) =>
        prev.filter((img) => img.secure_url !== imageUrl)
      )
      setSelectedImages((prev) => prev.filter((url) => url !== imageUrl))
      toast.success('Imagen eliminada exitosamente')
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Error al eliminar la imagen')
    }
  }

  // Usar imágenes seleccionadas
  const handleUseSelectedImages = () => {
    if (selectedImages.length === 0) {
      toast.warning('Selecciona al menos una imagen')
      return
    }
    onSelectImages(selectedImages)
    onClose()
    toast.success('Imágenes seleccionadas')
  }

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm'>
      <div className='w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 dark:bg-gray-800'>
        {/* Header */}
        <div className='flex items-center justify-between border-b p-6 dark:border-gray-700'>
          <div>
            <h3 className='text-xl font-bold dark:text-white'>
              Galería de Imágenes
            </h3>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
              {cloudinaryImages.length} imágenes cargadas
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              {selectedImages.length}/{maxSeleted} seleccionadas
            </span>
            <button
              onClick={onClose}
              className='rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400'
            >
              <MdClose size={24} />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className='overflow-y-auto p-6 flex-1' onScroll={handleScroll}>
          {loading && !loadingMore ? (
            <div className='flex justify-center py-12'>
              <div className='h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'></div>
            </div>
          ) : cloudinaryImages.length === 0 && !loadingMore ? (
            <div className='text-center py-12 text-gray-500 dark:text-gray-400'>
              No hay imágenes en la galería
            </div>
          ) : (
            <>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                {cloudinaryImages.map((image) => (
                  <ImageCard
                    key={image.public_id}
                    image={image}
                    isSelected={selectedImages.includes(image.secure_url)}
                    onSelect={() => toggleImageSelection(image.secure_url)}
                    onDelete={() => deleteImage(image.secure_url)}
                  />
                ))}
              </div>

              {/* Indicador de carga para más imágenes */}
              {loadingMore && (
                <div className='flex justify-center py-6'>
                  <div className='h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'></div>
                </div>
              )}

              {/* Botón para cargar más (si no hay infinite scroll) */}
              {!loadingMore && hasMoreImages && nextCursor && (
                <div className='flex justify-center py-4'>
                  <button
                    onClick={handleLoadMore}
                    className='flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors'
                  >
                    <MdExpandMore />
                    Cargar más imágenes
                  </button>
                </div>
              )}

              {/* Mensaje cuando no hay más imágenes */}
              {!hasMoreImages && cloudinaryImages.length > 0 && (
                <div className='text-center py-4 text-sm text-gray-500 dark:text-gray-400'>
                  No hay más imágenes por cargar
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className='border-t p-6 bg-gray-50 dark:bg-gray-700/30 dark:border-gray-700 flex justify-between items-center'>
          <div className='flex gap-3'>
            <button
              onClick={() => fetchCloudinaryImages()}
              className='px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Actualizar galería'}
            </button>
            {hasMoreImages && (
              <span className='text-xs text-gray-500 dark:text-gray-400 self-center'>
                Usa scroll para cargar más
              </span>
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
              onClick={handleUseSelectedImages}
              disabled={selectedImages.length === 0}
              className='px-6 py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              Usar Imágenes Seleccionadas
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente interno para tarjeta de imagen (sin cambios)
interface ImageCardProps {
  image: CloudinaryImage
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  isSelected,
  onSelect,
  onDelete
}) => (
  <div
    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
      isSelected
        ? 'border-blue-500 ring-2 ring-blue-500/20'
        : 'border-gray-200 dark:border-gray-700'
    }`}
    onClick={onSelect}
  >
    <img
      src={image.secure_url}
      alt={image.public_id}
      className='h-40 w-full object-cover'
    />
    <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity'>
      <div className='absolute bottom-2 left-2 right-2'>
        <p className='text-xs text-white truncate'>
          {image.public_id.split('/').pop()}
        </p>
        <p className='text-xs text-gray-300'>
          {new Date(image.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
    {isSelected && (
      <div className='absolute top-2 right-2'>
        <MdCheckCircle className='text-blue-500 text-2xl' />
      </div>
    )}
    <button
      onClick={(e) => {
        e.stopPropagation()
        onDelete()
      }}
      className='absolute top-2 left-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors'
    >
      <MdDelete size={14} />
    </button>
  </div>
)

export default CloudinaryGallery
