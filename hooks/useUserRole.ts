// hooks/useUserRole.ts
import { useAuthContext } from '@/contexts/AuthContext'

export function useUserRole() {
  const { isAdmin, userData, isLoading } = useAuthContext()

  return {
    isAdmin,
    userRole: userData?.role,
    isLoading,
    userData
  }
}
