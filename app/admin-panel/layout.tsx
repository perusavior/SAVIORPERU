// app/admin-panel/layout.tsx - SERVER COMPONENT
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getIsAdmin } from '@/lib/admin' // Tu función para verificar admin

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  // 1. Obtener usuario actual DESDE EL SERVIDOR
  const user = await currentUser()

  // 2. Si no está autenticado, redirigir inmediatamente
  if (!user) {
    redirect('/')
  }

  // 3. Verificar si es admin (necesitas implementar esta lógica)
  const isAdmin = await getIsAdmin(user.id)

  // 4. Si no es admin, redirigir
  if (!isAdmin) {
    redirect('/')
  }

  // 5. Solo si pasa todas las verificaciones, mostrar el layout
  return <div className='bg-gray-50 dark:bg-gray-900'>{children}</div>
}
