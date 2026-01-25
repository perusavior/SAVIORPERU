'use client'

import type React from 'react'
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react'

// Tipos basados en tu esquema Prisma
interface Cupon {
  id: number
  codigoCupon: string
  mostrarCupon: boolean
  descuento: number
  createdAt: string
  updatedAt: string
}

interface Settings {
  [key: string]: string
}

interface ConfigMetadata {
  lastUpdated: string
  etag: string
  totalCupones: number
  totalSettings: number
}

interface ConfigData {
  settings: Settings
  cupones: Cupon[]
  metadata: ConfigMetadata
}

interface ConfigContextType {
  configData: ConfigData | null
  isLoading: boolean
  error: string | null
  refetchConfig: () => Promise<void>
  getSetting: (key: string, defaultValue?: string) => string
  getActiveCoupon: () => Cupon | null
  getCouponByCode: (code: string) => Cupon | null
  lastFetched: Date | null
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined)

// Clave para localStorage
const STORAGE_KEY = 'app_config_cache'

// Interfaz para cache
interface CacheData {
  data: ConfigData
  timestamp: number
  etag: string
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  // 🟢 ESTADO INICIAL: Siempre null para SSR
  const [configData, setConfigData] = useState<ConfigData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const hasLoadedRef = useRef(false)

  // 🟢 Ref para almacenar datos del cache temporalmente
  const cachedDataRef = useRef<CacheData | null>(null)

  // Función para cargar desde cache (solo en cliente)
  const loadFromCache = useCallback((): CacheData | null => {
    if (typeof window === 'undefined') return null

    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (!cached) return null
      return JSON.parse(cached)
    } catch (error) {
      console.warn('Error reading from cache:', error)
      return null
    }
  }, [])

  // Función para guardar en cache (solo en cliente)
  const saveToCache = useCallback((data: ConfigData, etag: string) => {
    if (typeof window === 'undefined') return

    try {
      const cacheData: CacheData = {
        data,
        timestamp: Date.now(),
        etag
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Error saving to cache:', error)
    }
  }, [])

  // 🟢 Función para obtener un setting que PRIORIZA el cache
  const getSettingWithCache = useCallback(
    (key: string, defaultValue: string = '') => {
      // 1. Primero: intentar con configData actual (si ya se cargó)
      if (configData?.settings && configData.settings[key]) {
        return configData.settings[key]
      }

      // 2. Segundo: intentar con datos cacheados (si existen)
      if (
        cachedDataRef.current?.data?.settings &&
        cachedDataRef.current.data.settings[key]
      ) {
        return cachedDataRef.current.data.settings[key]
      }

      // 3. Tercero: retornar valor por defecto
      return defaultValue
    },
    [configData]
  )

  // Función principal para cargar configuración
  const loadConfig = useCallback(
    async (forceRefresh: boolean = false) => {
      // Prevenir ejecuciones múltiples
      if (hasLoadedRef.current && !forceRefresh) return
      hasLoadedRef.current = true

      setIsLoading(true)
      setError(null)

      try {
        // 🟢 1. CARGAR CACHE INMEDIATAMENTE (solo en cliente)
        let cachedData: CacheData | null = null
        if (typeof window !== 'undefined') {
          cachedData = loadFromCache()
          cachedDataRef.current = cachedData // Guardar referencia

          // 🟢 ACTUALIZAR ESTADO INMEDIATAMENTE CON DATOS DEL CACHE
          if (cachedData && !configData) {
            setConfigData(cachedData.data)
            setLastFetched(new Date(cachedData.timestamp))
            setIsLoading(false) // Dejar de mostrar loading
          }
        }

        // 2. Hacer fetch al servidor para verificar cambios
        abortControllerRef.current = new AbortController()

        const headers: HeadersInit = {}
        if (cachedData?.etag && !forceRefresh) {
          headers['If-None-Match'] = cachedData.etag
        }

        const response = await fetch('/api/config', {
          signal: abortControllerRef.current.signal,
          headers,
          // 🟢 Evitar cache del navegador
          cache: 'no-store'
        })

        // 3. Si 304 Not Modified, mantener cache
        if (response.status === 304) {
          setIsLoading(false)
          return
        }

        // 4. Si hay error, mantener cache (si existe)
        if (!response.ok) {
          if (cachedData) {
            console.warn('Server error, using cached config')
            setIsLoading(false)
            return
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        // 5. Procesar nueva data
        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to load configuration')
        }

        const etag =
          response.headers.get('etag') ||
          result.data?.metadata?.etag ||
          `"${Date.now()}"`

        // 6. Verificar si los datos son diferentes
        const currentEtag = cachedData?.etag
        const hasChanged = !currentEtag || currentEtag !== etag

        if (hasChanged) {
          // Guardar en cache
          saveToCache(result.data, etag)

          // Actualizar estado
          setConfigData(result.data)
          setLastFetched(new Date())
        } else {
          console.log('Config unchanged (etag match)')
        }
      } catch (error) {
        // Solo manejar errores que no sean de aborto
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error loading config:', error)
          setError(error.message)

          // Si no tenemos datos y hubo error, establecer estructura vacía
          if (!configData && !cachedDataRef.current) {
            setConfigData({
              settings: {},
              cupones: [],
              metadata: {
                lastUpdated: new Date().toISOString(),
                etag: 'error-fallback',
                totalCupones: 0,
                totalSettings: 0
              }
            })
          }
        }
      } finally {
        setIsLoading(false)
      }
    },
    [loadFromCache, saveToCache, configData]
  )

  // Función para re-fetch manual (fuerza recarga)
  const refetchConfig = useCallback(async () => {
    hasLoadedRef.current = false
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
      cachedDataRef.current = null
    }
    await loadConfig(true)
  }, [loadConfig])

  // Obtener cupón activo
  const getActiveCoupon = useCallback(() => {
    // 🟢 Primero de configData, luego de cache
    const data = configData || cachedDataRef.current?.data
    if (!data?.cupones || data.cupones.length === 0) return null
    return data.cupones.find((cupon) => cupon.mostrarCupon) || null
  }, [configData])

  // Buscar cupón por código
  const getCouponByCode = useCallback(
    (code: string) => {
      // 🟢 Primero de configData, luego de cache
      const data = configData || cachedDataRef.current?.data
      if (!data?.cupones || data.cupones.length === 0) return null
      return (
        data.cupones.find(
          (cupon) => cupon.codigoCupon.toLowerCase() === code.toLowerCase()
        ) || null
      )
    },
    [configData]
  )

  // 🟢 EFECTO PRINCIPAL: Cargar configuración después del mount
  useEffect(() => {
    loadConfig()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [loadConfig])

  return (
    <ConfigContext.Provider
      value={{
        configData,
        isLoading,
        error,
        refetchConfig,
        getSetting: getSettingWithCache,
        getActiveCoupon,
        getCouponByCode,
        lastFetched
      }}
    >
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const context = useContext(ConfigContext)
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return context
}
