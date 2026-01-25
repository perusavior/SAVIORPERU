'use client'

import type React from 'react'
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react'
import { useAuth } from '@clerk/nextjs'

interface UserData {
  id: string
  role: 'ADMIN' | 'USER' | null
  // Agrega otros campos que devuelva tu API aquí
  [key: string]: any
}

interface AuthContextType {
  userData: UserData | null
  isAdmin: boolean
  isLoading: boolean
  error: string | null
  refetchUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { userId, isSignedIn } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserData = useCallback(
    async (signal?: AbortSignal) => {
      if (!isSignedIn || !userId) {
        setUserData(null)
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/users/${userId}`, {
          signal,
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Error fetching user data')
        }

        const data = await response.json()

        const userRole = data.data?.role || null

        setUserData({
          id: userId,
          role: userRole,
          ...data.data // Incluye todos los demás datos del usuario
        })

        setIsAdmin(userRole === 'ADMIN')
      } catch (error) {
        // Solo manejar errores que no sean de aborto
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching user:', error)
          setError(error.message)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [isSignedIn, userId]
  )

  // Función para re-fetch manualmente
  const refetchUserData = useCallback(async () => {
    await fetchUserData()
  }, [fetchUserData])

  useEffect(() => {
    const controller = new AbortController()

    // Pequeño delay para asegurar que Clerk esté listo
    const timer = setTimeout(() => {
      fetchUserData(controller.signal)
    }, 100)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [fetchUserData])

  return (
    <AuthContext.Provider
      value={{
        userData,
        isAdmin,
        isLoading,
        error,
        refetchUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
