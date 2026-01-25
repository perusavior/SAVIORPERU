'use client'

import React, { useState } from 'react'
import {
  MdImage,
  MdCloudUpload,
  MdPhotoLibrary,
  MdClose,
  MdCheckCircle
} from 'react-icons/md'
import { toast } from 'sonner'
import CloudinaryGallery from './CloudinaryGallery'

interface ImageManagerProps {
  mainImage: string
  secondaryImage?: string
  onMainImageChange: (url: string) => void
  onSecondaryImageChange?: (url: string) => void
  imageFrom?: string
  editImage?: boolean
}

interface CloudinaryImage {
  public_id: string
  secure_url: string
  created_at: string
  bytes: number
  format: string
}

const ImageManager: React.FC<ImageManagerProps> = ({
  mainImage,
  secondaryImage,
  onMainImageChange,
  onSecondaryImageChange,
  imageFrom,
  editImage
}) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploadingToCloudinary, setUploadingToCloudinary] = useState(false)
  const [showCloudinaryGallery, setShowCloudinaryGallery] = useState(false)

  // Subir imagen a Cloudinary
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Solo se permiten archivos de imagen')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'saviorperu')
    formData.append('folder', 'ecommerce-products')

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/saviorperu/image/upload',
      {
        method: 'POST',
        body: formData
      }
    )

    if (!response.ok) {
      throw new Error(`Error al subir imagen: ${response.statusText}`)
    }

    const data = await response.json()

    // --- TRANSFORMACIÓN AQUÍ ---
    // Insertamos f_auto (formato) y q_auto (compresión inteligente)
    // Esto hará que si el navegador soporta WebP, Cloudinary lo envíe así.
    const optimizedUrl = data.secure_url.replace(
      '/upload/',
      '/upload/f_auto,q_auto/'
    )

    return optimizedUrl
  }

  // Manejar subida de imagen
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingToCloudinary(true)
    try {
      const imageUrl = await uploadImageToCloudinary(file)

      setUploadedImages((prev) => [...prev, imageUrl])

      // Asignar automáticamente si falta alguna imagen
      if (!mainImage) {
        onMainImageChange(imageUrl)
      } else if (!secondaryImage) {
        if (onSecondaryImageChange) {
          onSecondaryImageChange(imageUrl)
        }
      } else if (imageFrom === 'systemImages') {
        onMainImageChange(imageUrl)
      }

      toast.success('Imagen subida exitosamente')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error al subir la imagen')
    } finally {
      setUploadingToCloudinary(false)
    }
  }

  // Seleccionar imagen de la galería
  const handleSelectFromGallery = (images: string[]) => {
    if (images[0]) onMainImageChange(images[0])
    if (images[1] && onSecondaryImageChange) onSecondaryImageChange(images[1])
  }

  // Eliminar imagen subida
  const removeUploadedImage = (url: string) => {
    if (mainImage === url) onMainImageChange('')
    if (secondaryImage === url && onSecondaryImageChange)
      onSecondaryImageChange('')
    setUploadedImages((prev) => prev.filter((img) => img !== url))
  }

  const uploadAndGalery = (
    <div
      className={`${
        imageFrom === 'systemImages' ? 'flex-col' : ''
      } flex gap-3 mb-4`}
    >
      <div>
        <input
          type='file'
          id='image-upload'
          accept='.jpg, .jpeg, .png, .webp'
          onChange={handleImageUpload}
          className='hidden'
          disabled={uploadingToCloudinary}
        />
        <label
          htmlFor='image-upload'
          className={`flex items-center gap-1 rounded-lg px-2 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
            uploadingToCloudinary
              ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
          }`}
        >
          <MdCloudUpload />
          {uploadingToCloudinary ? 'Subiendo...' : 'Subir Imagen'}
        </label>
      </div>

      <button
        onClick={() => setShowCloudinaryGallery(true)}
        className='flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors'
      >
        <MdPhotoLibrary />
        Galería
      </button>
    </div>
  )

  return (
    <>
      <div
        className={`${
          imageFrom === 'systemImages' ? 'grid grid-cols-2 gap-1' : ''
        }`}
      >
        {!imageFrom && (
          <>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Imágenes del Producto
            </label>
            <p className='mb-3 text-xs text-gray-500 dark:text-gray-400'>
              Sube hasta 2 imágenes (primera imagen es obligatoria)
            </p>
          </>
        )}

        {/* Botones para subir imágenes */}
        {editImage === undefined
          ? uploadAndGalery
          : editImage === true
          ? uploadAndGalery
          : null}

        {/* Vista previa de imágenes */}
        <div
          className={`${
            imageFrom === 'systemImages'
              ? 'w-32 pb-2 grid row-start-1'
              : 'grid grid-cols-2 gap-4'
          }`}
        >
          {/* Imagen principal */}
          <ImagePreview
            imageUrl={mainImage}
            label='Imagen Principal'
            onRemove={() => onMainImageChange('')}
            showIconRemove={editImage}
            onSecondaryImageChange={onSecondaryImageChange === undefined}
          />

          {/* Imagen secundaria */}
          {onSecondaryImageChange && (
            <ImagePreview
              imageUrl={secondaryImage || ''}
              label='Imagen Secundaria (Opcional)'
              onRemove={() => onSecondaryImageChange('')}
              showIconRemove={editImage}
            />
          )}
        </div>

        {/* Imágenes recién subidas */}
        {uploadedImages.length > 0 && !imageFrom && (
          <div className='mt-4'>
            <p className='mb-2 text-xs font-medium text-gray-500 dark:text-gray-400'>
              Imágenes subidas recientemente:
            </p>
            <div className='flex flex-wrap gap-2'>
              {uploadedImages.map((url, index) => (
                <div key={index} className='relative'>
                  <img
                    src={url}
                    alt={`Subida ${index + 1}`}
                    className='h-16 w-16 rounded-lg object-cover border'
                  />
                  <button
                    onClick={() => removeUploadedImage(url)}
                    className='absolute -top-1 -right-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600'
                  >
                    <MdClose size={12} />
                  </button>
                  {(mainImage === url || secondaryImage === url) && (
                    <div className='absolute bottom-1 left-1'>
                      <MdCheckCircle className='text-green-500 text-sm' />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Galería Cloudinary */}
      {showCloudinaryGallery && (
        <CloudinaryGallery
          onClose={() => setShowCloudinaryGallery(false)}
          onSelectImages={handleSelectFromGallery}
          maxSeleted={2}
        />
      )}
    </>
  )
}

// Componente interno para vista previa de imagen
interface ImagePreviewProps {
  imageUrl: string
  label: string
  onRemove: () => void
  showIconRemove?: boolean
  onSecondaryImageChange?: boolean
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  label,
  onRemove,
  showIconRemove,
  onSecondaryImageChange
}) => (
  <div className='relative'>
    <div className='aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-700/50'>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt='Preview'
          className='h-full w-full object-cover'
        />
      ) : (
        <div className='flex h-full items-center justify-center'>
          <MdImage className='text-gray-400 dark:text-gray-500 text-4xl' />
        </div>
      )}
    </div>
    {!onSecondaryImageChange && (
      <div className='mt-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400'>
        {label}
      </div>
    )}
    {showIconRemove === undefined ? (
      imageUrl && (
        <button
          onClick={onRemove}
          className='absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600'
        >
          <MdClose size={14} />
        </button>
      )
    ) : showIconRemove && imageUrl ? (
      <button
        onClick={onRemove}
        className='absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600'
      >
        <MdClose size={14} />
      </button>
    ) : null}
  </div>
)

export default ImageManager
