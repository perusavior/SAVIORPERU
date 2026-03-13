'use client'

import { useConfig } from '@/contexts/ConfigContext'
import { useState, useEffect, useCallback } from 'react'

export function useConfigData() {
  const {
    configData,
    isLoading,
    error,
    refetchConfig,
    getSetting,
    getActiveCoupon,
    getCouponByCode,
    lastFetched
  } = useConfig()

  // 🟢 ESTADO: Para manejar valores que son consistentes entre SSR y cliente
  const [isMounted, setIsMounted] = useState(false)
  const [safeValues, setSafeValues] = useState<Record<string, string>>({})

  // 🟢 Marcar cuando el componente se monta (solo en cliente)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 🟢 Actualizar valores seguros cuando configData esté disponible
  useEffect(() => {
    if (configData?.settings) {
      setSafeValues(configData.settings)
    }
  }, [configData])

  // 🟢 Helper que maneja el estado de montaje para evitar hydration errors
  const getSettingSafe = useCallback(
    (key: string, defaultValue: string = '') => {
      // Durante SSR y primera renderización del cliente, usar defaultValue
      if (!isMounted) {
        return defaultValue
      }

      // Una vez montado, usar getSetting que prioriza cache
      return getSetting(key, defaultValue)
    },
    [isMounted, getSetting]
  )

  // 🟢 Helper específico para imágenes con placeholder durante SSR
  const getImageSafe = useCallback(
    (key: string, placeholder: string = '/CargandoImagen.png') => {
      if (!isMounted) {
        return placeholder
      }

      const value = getSetting(key, '')
      return value || placeholder
    },
    [isMounted, getSetting]
  )

  return {
    // Datos
    configData,
    settings: safeValues,
    cupones: configData?.cupones || [],

    // Estado
    isLoading,
    error,
    lastFetched,
    isMounted, // 🟢 Exportar para saber si estamos en cliente

    // Funciones SEGURAS (evitan hydration errors)
    getSetting: getSettingSafe,
    getActiveCoupon: () =>
      configData?.cupones?.find((c) => c.mostrarCupon) || null,
    getCouponByCode,

    // Helpers específicos SEGUROS
    getMinimoDelivery: () => parseFloat(getSettingSafe('minimoDelivery', '0')),
    getMaximoDelivery: () => parseFloat(getSettingSafe('maximoDelivery', '0')),
    getImagenIzquierda: () => getImageSafe('imagenIzquierda'),
    getImagenDerecha: () => getImageSafe('imagenDerecha'),
    getFotoTienda: () => getImageSafe('fotoTienda'), // 🟢 ¡SIN HYDRATION ERROR!
    getTelefono: () => getSettingSafe('telefono'),
    getCorreo: () => getSettingSafe('correo'),
    getInstagram: () => getSettingSafe('instagram'),
    getFacebook: () => getSettingSafe('facebook'),
    getTiktok: () => getSettingSafe('tiktok'),

    // Funciones de control
    refetchConfig,
    forceReload: () => refetchConfig()
  }
}
