import React, { useState, useEffect, useCallback } from 'react'
import {
  MdSearch,
  MdRemoveRedEye,
  MdDelete,
  MdClose,
  MdBadge,
  MdEmail,
  MdPhone,
  MdShoppingCart,
  MdCalendarToday,
  MdOutlineAdminPanelSettings,
  MdOutlinePerson,
  MdChevronLeft,
  MdChevronRight,
  MdFirstPage,
  MdLastPage,
  MdOutlineVerifiedUser,
  MdOutlineWarning
} from 'react-icons/md'
import { toast } from 'sonner'
import KpiCard from './KpiCard'

// --- Interfaces ---
interface User {
  id: number
  name: string | null
  email: string
  role: 'USER' | 'ADMIN'
  phone: string | null
  dni: string | null
  address: string | null
  department: string | null
  deliveryLocation: 'Lima' | 'Provincia' | 'Null'
  clerkId: string | null
  agencia: string | null
  totalOrders: number
  createdAt: string
  updatedAt: string
}

interface UserDetail extends User {
  stats: {
    totalOrders: number
    totalSpent: number
    averageOrderValue: number
    lastOrderDate: string | null
  }
  orders: Array<{
    id: number
    status: string
    totalPrice: number
    createdAt: string
    totalItems: number
    productos: string
  }>
}

interface Pagination {
  total: number
  page: number
  totalPages: number
}

interface UsersResponse {
  data: User[]
  pagination: Pagination
  filters: {
    search: string
    role: string | null
    sortBy: string
    sortOrder: string
  }
}

// --- Main Component ---
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    totalPages: 0
  })

  // Estados para funcionalidades
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editForm, setEditForm] = useState<Partial<User>>({})
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  const fetchUsers = useCallback(
    async (page: number = 1, search: string = '', loading: boolean = true) => {
      setLoading(loading)
      try {
        let queryParam = `page=${page}&limit=10`

        if (search) {
          queryParam += `&search=${encodeURIComponent(search)}`
        }

        const response = await fetch(`/api/users?${queryParam}`)
        if (!response.ok) throw new Error('Error al obtener usuarios')
        const result: UsersResponse = await response.json()

        setUsers(result.data)
        setPagination(result.pagination)
        setCurrentPage(result.pagination.page)
      } catch (error) {
        console.error('Error fetching users:', error)
        toast.error('No se pudieron cargar los usuarios')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const fetchUserDetails = async (id: number) => {
    try {
      const response = await fetch(`/api/users/${id}`)
      if (!response.ok) throw new Error('Error al obtener detalles del usuario')
      const result = await response.json()
      setSelectedUser(result.data)
    } catch (error) {
      console.error('Error fetching user details:', error)
      toast.error('No se pudieron cargar los detalles del usuario')
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(
      () => {
        fetchUsers(currentPage, searchTerm)
      },
      searchTerm ? 500 : 0
    ) // Sin delay para búsqueda vacía

    return () => clearTimeout(delayDebounceFn)
  }, [currentPage, searchTerm, fetchUsers])

  // useEffect(() => {
  //   fetchUsers(currentPage, searchTerm)
  // }, [currentPage, fetchUsers, searchTerm])

  // --- Funciones de Paginación ---
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page)
    }
  }

  const goToFirstPage = () => goToPage(1)
  const goToLastPage = () => goToPage(pagination.totalPages)
  const goToNextPage = () => goToPage(currentPage + 1)
  const goToPrevPage = () => goToPage(currentPage - 1)

  // Generar rango de páginas para mostrar (igual al primer componente)
  const getPageNumbers = () => {
    const totalPages = pagination.totalPages
    const current = currentPage
    const delta = 2
    const range: number[] = []
    const rangeWithDots: (number | string)[] = []
    let l: number

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }

  // --- Funciones de CRUD ---
  const handleEditUser = async () => {
    if (!selectedUser) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (!response.ok) throw new Error()

      toast.success('Usuario actualizado correctamente')
      fetchUsers(currentPage, searchTerm, false)
      setSelectedUser(null)
      setIsEditing(false)
      setEditForm({})
    } catch (error) {
      toast.error('Error al actualizar el usuario')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (
      !confirm(
        '¿Estás seguro de eliminar este usuario? Esta acción es irreversible.'
      )
    )
      return

    setIsDeleting(id)
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id))
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }))
        toast.success('Usuario eliminado correctamente')

        if (users.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1)
        } else {
          fetchUsers(currentPage, searchTerm, false)
        }
      } else {
        const error = await response.json()
        toast.error(error.message || 'No se pudo eliminar el usuario')
      }
    } catch (error) {
      toast.error('Error al eliminar el usuario')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleRoleChange = async (
    userId: number,
    newRole: 'USER' | 'ADMIN'
  ) => {
    if (!confirm(`¿Cambiar el rol del usuario a ${newRole}?`)) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) throw new Error()

      toast.success(`Rol cambiado a ${newRole}`)
      fetchUsers(currentPage, searchTerm, false)

      if (selectedUser?.id === userId) {
        fetchUserDetails(userId)
      }
    } catch (error) {
      toast.error('Error al cambiar el rol')
    }
  }

  // --- Estadísticas para KPIs ---
  const stats = {
    totalUsers: pagination.total || 0,
    admins: users.filter((u) => u.role === 'ADMIN').length,
    totalOrders: users.reduce((acc, curr) => acc + curr.totalOrders, 0)
  }

  // --- Iconos para KPIs ---
  const AdminIcon = () => <MdOutlineAdminPanelSettings size={24} />
  const UserIcon = () => <MdOutlinePerson size={24} />
  const OrdersIcon = () => <MdShoppingCart size={24} />
  const ActivityIcon = () => <MdCalendarToday size={24} />

  return (
    <>
      <main className='flex flex-1 flex-col bg-gray-50 dark:bg-gray-900 pb-12'>
        <div className='mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 lg:p-8'>
          {/* Header & Search */}
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-white lg:text-3xl'>
                Panel de Usuarios
              </h2>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Gestiona los usuarios registrados en tu tienda.
              </p>
            </div>
            <div className='relative w-full sm:w-80'>
              <MdSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl dark:text-gray-500' />
              <input
                type='text'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-500/30'
                placeholder='Buscar por nombre, email, DNI...'
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400'
                >
                  <MdClose />
                </button>
              )}
            </div>
          </div>

          {/* KPI Cards */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <KpiCard
              title='Total Usuarios'
              value={stats.totalUsers.toString()}
              trend='+5%'
              Icon={UserIcon}
              color='blue'
            />
            <KpiCard
              title='Administradores'
              value={stats.admins.toString()}
              trend='Estable'
              Icon={AdminIcon}
              color='purple'
            />
          </div>

          {/* Contador de Resultados */}
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              Mostrando <span className='font-bold'>{users.length}</span> de{' '}
              <span className='font-bold'>{pagination.total}</span> usuarios
              totales
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              Página <span className='font-bold'>{currentPage}</span> de{' '}
              <span className='font-bold'>{pagination.totalPages}</span>
            </div>
          </div>

          {/* Table */}
          <div className='flex flex-col gap-4'>
            <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700'>
              <div className='overflow-x-auto'>
                <table className='w-full text-left text-sm text-gray-600 dark:text-gray-400'>
                  <thead className='bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-700/50 dark:text-gray-300'>
                    <tr>
                      <th className='px-6 py-4 font-bold'>Usuario</th>
                      <th className='px-6 py-4 font-bold'>Contacto</th>
                      <th className='px-6 py-4 font-bold'>Rol</th>
                      <th className='px-6 py-4 font-bold'>Pedidos</th>
                      <th className='px-6 py-4 font-bold'>Registro</th>
                      <th className='px-6 py-4 text-right font-bold'>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100 dark:divide-gray-700'>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className='px-6 py-12 text-center'>
                          <div className='flex justify-center'>
                            <div className='h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'></div>
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className='px-6 py-12 text-center text-gray-500 dark:text-gray-400'
                        >
                          {searchTerm
                            ? 'No se encontraron usuarios para la búsqueda'
                            : 'No hay usuarios registrados.'}
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr
                          key={user.id}
                          className={`hover:bg-gray-50/50 transition-colors group dark:hover:bg-gray-700/30 ${
                            isDeleting === user.id
                              ? 'opacity-50 pointer-events-none'
                              : ''
                          }`}
                        >
                          <td className='px-6 py-4'>
                            <div className='flex flex-col'>
                              <span className='font-semibold text-gray-900 dark:text-white'>
                                {user.name || 'Sin nombre'}
                              </span>
                              <span className='text-xs text-gray-400 dark:text-gray-500'>
                                ID: {user.id}
                              </span>
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex flex-col'>
                              <span className='text-sm dark:text-gray-300'>
                                {user.email}
                              </span>
                              {user.phone && (
                                <span className='text-xs text-gray-500'>
                                  {user.phone}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex flex-col gap-1'>
                              <span
                                className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold ${
                                  user.role === 'ADMIN'
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300'
                                }`}
                              >
                                {user.role}
                              </span>
                              {user.role === 'ADMIN' && user.id === 1 && (
                                <span className='text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1'>
                                  <MdOutlineVerifiedUser /> Principal
                                </span>
                              )}
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-2'>
                              <MdShoppingCart className='text-gray-400 dark:text-gray-500' />
                              <span className='font-medium dark:text-gray-300'>
                                {user.totalOrders}
                              </span>
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex flex-col'>
                              <span className='text-sm dark:text-gray-300'>
                                {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                              <span className='text-xs text-gray-500'>
                                {new Date(user.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }
                                )}
                              </span>
                            </div>
                          </td>
                          <td className='px-6 py-4 text-right'>
                            <div className='flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all'>
                              <button
                                onClick={() => fetchUserDetails(user.id)}
                                className='p-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-lg transition-colors'
                                title='Ver detalles'
                              >
                                <MdRemoveRedEye size={20} />
                              </button>
                              {/* <button
                                onClick={() => fetchUserDetails(user.id)}
                                className='p-2 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 rounded-lg transition-colors'
                                title='Editar'
                              >
                                <MdEdit size={20} />
                              </button> */}
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={user.id === 1}
                                className='p-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
                                title={
                                  user.id === 1
                                    ? 'No se puede eliminar el admin principal'
                                    : 'Eliminar'
                                }
                              >
                                <MdDelete size={20} />
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

            {/* Paginación - IDÉNTICA al primer componente */}
            {pagination.totalPages > 1 && !loading && (
              <div className='flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 rounded-b-xl'>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className='flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors'
                    aria-label='Primera página'
                  >
                    <MdFirstPage size={20} />
                  </button>
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className='flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors'
                    aria-label='Página anterior'
                  >
                    <MdChevronLeft size={20} />
                  </button>
                </div>

                <div className='flex items-center gap-1'>
                  {getPageNumbers().map((pageNum, index) => (
                    <React.Fragment key={index}>
                      {pageNum === '...' ? (
                        <span className='px-3 py-1 text-gray-400 dark:text-gray-500'>
                          ...
                        </span>
                      ) : (
                        <button
                          onClick={() => goToPage(Number(pageNum))}
                          className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white border border-blue-600'
                              : 'border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className='flex items-center gap-2'>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === pagination.totalPages}
                    className='flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors'
                    aria-label='Página siguiente'
                  >
                    <MdChevronRight size={20} />
                  </button>
                  <button
                    onClick={goToLastPage}
                    disabled={currentPage === pagination.totalPages}
                    className='flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors'
                    aria-label='Última página'
                  >
                    <MdLastPage size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- MODAL DE DETALLES - IDÉNTICO al primer componente --- */}
      {selectedUser && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'>
          <div className='w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 dark:bg-gray-800'>
            <div className='flex items-center justify-between border-b p-6 dark:border-gray-700'>
              <h3 className='text-xl font-bold dark:text-white'>
                {isEditing ? 'Editar Usuario' : 'Detalles de Usuario'}
              </h3>
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setIsEditing(false)
                  setEditForm({})
                }}
                className='rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400'
              >
                <MdClose size={24} />
              </button>
            </div>

            <div className='overflow-y-auto p-6 flex-1'>
              {/* Cambiar Rol */}
              <div className='mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 dark:bg-gray-700/30 dark:border-gray-700'>
                <p className='text-xs font-bold text-gray-400 uppercase mb-3 dark:text-gray-500'>
                  Cambiar Rol
                </p>
                <div className='flex flex-wrap gap-2'>
                  {(['USER', 'ADMIN'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(selectedUser.id, role)}
                      disabled={selectedUser.id === 1 && role !== 'ADMIN'}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                        selectedUser.role === role
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      } ${
                        selectedUser.id === 1 && role !== 'ADMIN'
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                  {selectedUser.id === 1 && (
                    <div className='flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 mt-2'>
                      <MdOutlineWarning /> No se puede cambiar el rol del admin
                      principal
                    </div>
                  )}
                </div>
              </div>

              {/* Información del Usuario */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
                <div className='space-y-4'>
                  <div>
                    <p className='text-xs font-bold text-gray-400 uppercase mb-2 dark:text-gray-500'>
                      Información Personal
                    </p>
                    {isEditing ? (
                      <div className='space-y-3'>
                        <input
                          type='text'
                          value={editForm.name || selectedUser.name || ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className='w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                          placeholder='Nombre'
                        />
                        <input
                          type='email'
                          value={editForm.email || selectedUser.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                          className='w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                          placeholder='Email'
                        />
                      </div>
                    ) : (
                      <div className='space-y-3'>
                        <div className='flex items-center gap-2 text-sm dark:text-gray-300'>
                          <MdBadge /> {selectedUser.name || 'Sin nombre'}
                        </div>
                        <div className='flex items-center gap-2 text-sm dark:text-gray-300'>
                          <MdEmail /> {selectedUser.email}
                        </div>
                        {selectedUser.phone && (
                          <div className='flex items-center gap-2 text-sm dark:text-gray-300'>
                            <MdPhone /> {selectedUser.phone}
                          </div>
                        )}
                        {selectedUser.dni && (
                          <div className='text-sm text-gray-600 dark:text-gray-400 pl-6'>
                            DNI: {selectedUser.dni}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className='mb-6'>
                <p className='text-xs font-bold text-gray-400 uppercase mb-3 dark:text-gray-500'>
                  Estadísticas
                </p>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                  <div className='bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg'>
                    <p className='text-xs text-blue-700 dark:text-blue-300 font-bold'>
                      TOTAL PEDIDOS
                    </p>
                    <p className='text-2xl font-black text-blue-600 dark:text-blue-400'>
                      {selectedUser.stats.totalOrders}
                    </p>
                  </div>
                  <div className='bg-green-50 dark:bg-green-900/20 p-3 rounded-lg'>
                    <p className='text-xs text-green-700 dark:text-green-300 font-bold'>
                      TOTAL GASTADO
                    </p>
                    <p className='text-2xl font-black text-green-600 dark:text-green-400'>
                      S/ {selectedUser.stats.totalSpent.toFixed(2)}
                    </p>
                  </div>
                  <div className='bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg'>
                    <p className='text-xs text-purple-700 dark:text-purple-300 font-bold'>
                      VALOR PROMEDIO
                    </p>
                    <p className='text-2xl font-black text-purple-600 dark:text-purple-400'>
                      S/ {selectedUser.stats.averageOrderValue.toFixed(2)}
                    </p>
                  </div>
                  <div className='bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg'>
                    <p className='text-xs text-orange-700 dark:text-orange-300 font-bold'>
                      ÚLTIMO PEDIDO
                    </p>
                    <p className='text-lg font-black text-orange-600 dark:text-orange-400'>
                      {selectedUser.stats.lastOrderDate
                        ? new Date(
                            selectedUser.stats.lastOrderDate
                          ).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Historial de Pedidos */}
              {selectedUser.orders.length > 0 && (
                <div className='space-y-4'>
                  <p className='text-xs font-bold text-gray-400 uppercase dark:text-gray-500'>
                    Historial de Pedidos (Últimos 10)
                  </p>
                  <div className='divide-y border rounded-xl overflow-hidden dark:border-gray-700'>
                    {selectedUser.orders.map((order) => (
                      <div
                        key={order.id}
                        className='flex items-center justify-between p-3 bg-gray-50/30 dark:bg-gray-700/30'
                      >
                        <div>
                          <p className='text-sm font-bold text-gray-800 dark:text-white'>
                            Pedido #{order.id}
                          </p>
                          <p className='text-xs text-gray-500 dark:text-gray-400'>
                            {order.productos}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-sm font-bold dark:text-white'>
                            S/ {order.totalPrice.toFixed(2)}
                          </p>
                          <p className='text-xs text-gray-500 dark:text-gray-400'>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className='border-t p-6 bg-gray-50 dark:bg-gray-700/30 dark:border-gray-700 flex justify-between items-center'>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Registrado:{' '}
                {new Date(selectedUser.createdAt).toLocaleDateString()}
              </div>
              <div className='flex gap-3'>
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className='px-4 py-2 border border-gray-300 rounded-lg font-bold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors'
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleEditUser}
                      disabled={isUpdating}
                      className='px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors'
                    >
                      {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </>
                ) : (
                  <>
                    {/* <button
                      onClick={() => {
                        setEditForm({
                          name: selectedUser.name || '',
                          email: selectedUser.email,
                          phone: selectedUser.phone,
                          dni: selectedUser.dni,
                          address: selectedUser.address,
                          department: selectedUser.department
                        })
                        setIsEditing(true)
                      }}
                      className='px-4 py-2 border border-gray-300 rounded-lg font-bold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors flex items-center gap-2'
                    >
                      <MdOutlineEditNote /> Editar
                    </button> */}
                    <button
                      onClick={() => setSelectedUser(null)}
                      className='px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 dark:bg-gray-700 transition-colors'
                    >
                      Cerrar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UserManagement
