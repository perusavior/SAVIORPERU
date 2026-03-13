'use client'

import { useUser } from '@clerk/nextjs'
import React, { useState, useEffect, useMemo } from 'react'
import TableSkeleton from './components/DeskSkeleton'
import OrderSkeleton from './components/MobilSkeleton'
import OrderDetailsModal from './components/OrderDetailsModal'
import { usePDFGenerator } from './components/usePDFGenerator'
import {
  FileText,
  Eye,
  Search,
  ChevronUp,
  ChevronDown,
  Info
} from 'lucide-react'

interface OrderItem {
  id: number
  producto: {
    name: string
    price: string
  }
  quantity: number
  totalPrice: string
}

interface Order {
  id: number
  clientName: string
  status: string
  totalPrice: string
  createdAt: string
  orderItems: OrderItem[]
  address?: string
  agencia?: string
  clientPhone?: string
  dni?: string
  locationToSend?: string
  deliveryCost?: string
  totalProducts?: number
  discount?: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function OrdersList({
  orders: initialOrders,
  pagination: initialPagination
}: {
  orders: Order[]
  pagination: Pagination
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [pagination, setPagination] = useState<Pagination>(initialPagination)
  const [page, setPage] = useState(initialPagination.page)
  const [loading, setLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { user, isSignedIn } = useUser()
  const { generatePDF, isGenerating } = usePDFGenerator()

  // Estados para filtros y ordenamiento
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortField, setSortField] = useState<'date' | 'total' | 'name'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // OrdersList.tsx - MODIFICAR el useEffect
  useEffect(() => {
    // Solo hacer fetch si NO tenemos datos iniciales (first page)
    // o si el usuario cambia de página
    if (page !== initialPagination.page) {
      const fetchOrders = async () => {
        setLoading(true)
        try {
          const res = await fetch(
            `/api/orders?page=${page}&limit=${pagination.limit}&email=${user?.emailAddresses[0].emailAddress}`,
            {
              cache: 'no-store'
            }
          )
          if (res.ok) {
            const { data, pagination: newPagination } = await res.json()
            setOrders(data)
            setPagination(newPagination)
          }
        } catch (error) {
          console.error('Error en fetch:', error)
        } finally {
          setLoading(false)
        }
      }

      if (isSignedIn) {
        fetchOrders()
      }
    }
  }, [
    page,
    isSignedIn,
    user?.emailAddresses[0].emailAddress,
    initialPagination.page
  ])

  // Función para filtrar y ordenar los pedidos
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders]

    // Filtro por estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(
        (order) => order.status.toLowerCase() === statusFilter.toLowerCase()
      )
    }

    // Filtro por búsqueda (cliente o ID)
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.clientName.toLowerCase().includes(term) ||
          order.id.toString().includes(term) ||
          order.orderItems.some((item) =>
            item.producto.name.toLowerCase().includes(term)
          )
      )
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortField) {
        case 'date':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'total':
          aValue =
            parseFloat(a.totalPrice) +
            (a.deliveryCost ? parseFloat(a.deliveryCost) : 0) -
            (a.discount
              ? (parseFloat(a.totalPrice) * parseFloat(a.discount)) / 100
              : 0)
          bValue =
            parseFloat(b.totalPrice) +
            (b.deliveryCost ? parseFloat(b.deliveryCost) : 0) -
            (b.discount
              ? (parseFloat(b.totalPrice) * parseFloat(b.discount)) / 100
              : 0)
          break
        case 'name':
          aValue = a.clientName.toLowerCase()
          bValue = b.clientName.toLowerCase()
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [orders, statusFilter, searchTerm, sortField, sortOrder])

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
  }

  const handleGeneratePDF = async (order: Order) => {
    const pdfData = {
      orderId: order.id,
      clientName: order.clientName,
      status: order.status,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      orderItems: order.orderItems,
      address: order.address,
      agencia: order.agencia,
      clientPhone: order.clientPhone,
      dni: order.dni,
      deliveryCost: order.deliveryCost,
      discount: order.discount
    }

    await generatePDF(pdfData)
  }

  // Función para obtener el color según el estado
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'entregado':
        return 'bg-emerald-100 text-green-500 dark:bg-green-600 dark:text-emerald-200'
      case 'enviado':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'pagado':
        return 'bg-sky-100 text-sky-700 dark:bg-sky-700/30 dark:text-sky-400'
      case 'cancelado':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    }
  }

  // Función para calcular el total con descuento
  const calculateTotalWithDiscount = (order: Order) => {
    const subtotal = parseFloat(order.totalPrice) || 0
    const delivery = order.deliveryCost ? parseFloat(order.deliveryCost) : 0
    const calculateDiscount = order.discount
      ? (subtotal * parseFloat(order.discount)) / 100
      : 0
    const discount = Math.ceil(calculateDiscount * 10) / 10

    return ((subtotal * 100 + delivery * 100 - discount * 100) / 100).toFixed(2)
  }

  return (
    <div className='space-y-4 md:space-y-6 max-w-screen-2xl w-full'>
      {' '}
      {/* Menor espacio superior en móvil */}
      {/* Encabezado */}
      <div className='flex xs:flex-row justify-between items-start xs:items-center gap-3'>
        <div>
          <h1 className='text-xl md:text-2xl font-bold text-foreground leading-tight'>
            Historial de Pedidos
          </h1>
          <p className='text-xs md:text-sm text-muted-foreground mt-0.5'>
            {pagination.total} pedidos encontrados
          </p>
        </div>
        <div className='px-3 py-1.5 rounded-lg bg-card border border-border text-xs md:text-sm self-end xs:self-auto'>
          <span className='text-muted-foreground'>Pág.</span>
          <span className='mx-1.5 font-semibold text-foreground'>{page}</span>
          <span className='text-muted-foreground'>
            de {pagination.totalPages}
          </span>
        </div>
      </div>
      {/* Filtros y Búsqueda - Optimizados para 375px */}
      <div className='flex flex-col gap-3 p-3 bg-card border border-border rounded-lg shadow-sm'>
        <div className='flex sm:flex-row gap-2'>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='w-full sm:w-auto px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20'
          >
            <option value='todos'>Todos los estados</option>
            <option value='pendiente'>Pendiente</option>
            <option value='pagado'>Pagado</option>
            <option value='enviado'>Enviado</option>
            <option value='entregado'>Entregado</option>
            <option value='cancelado'>Cancelado</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className='w-full sm:w-auto justify-center px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-2 text-sm'
          >
            {sortOrder === 'asc' ? (
              <ChevronUp className='w-4 h-4' />
            ) : (
              <ChevronDown className='w-4 h-4' />
            )}
            <span className='sm:hidden'>Invertir orden</span>
          </button>
        </div>
      </div>
      {/* Leyenda de Estados - Grid para mejor lectura en móvil */}
      <div className='bg-card border border-border rounded-lg p-3'>
        <div className='flex items-center gap-2 mb-2'>
          <Info className='w-4 h-4 text-foreground' />
          <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Estados:
          </h3>
          {/* <span className='text-xs tracking-wide'>
            click estado para mas detalles
          </span> */}
        </div>
        <div className='gap-2 flex'>
          <div className='flex items-center gap-1.5'>
            <div className='w-2.5 h-2.5 rounded-full bg-amber-400'></div>
            <span className='text-[10px] md:text-xs font-medium flex'>
              Pendiente{' '}
              <span className='text-[10px] text-muted-foreground sm:hidden'>
                {'>'}
              </span>
            </span>
            <span className='text-xs text-muted-foreground max-sm:hidden'>
              - Pedido recibido, en espera de pago
            </span>
          </div>
          <div className='flex items-center gap-1.5'>
            <div className='w-2.5 h-2.5 rounded-full bg-sky-400'></div>
            <span className='text-[10px] md:text-xs font-medium'>
              Pagado{' '}
              <span className='text-[10px] text-muted-foreground sm:hidden'>
                {'>'}
              </span>
            </span>
            <span className='text-xs text-muted-foreground max-sm:hidden'>
              - Pago confirmado, preparando pedido
            </span>
          </div>
          <div className='flex items-center gap-1.5'>
            <div className='w-2.5 h-2.5 rounded-full bg-blue-500'></div>
            <span className='text-[10px] md:text-xs font-medium'>
              Enviado{' '}
              <span className='text-[10px] text-muted-foreground sm:hidden'>
                {'>'}
              </span>
            </span>
            <span className='text-xs text-muted-foreground max-sm:hidden'>
              - Pedido en camino
            </span>
          </div>
          <div className='flex items-center gap-1.5'>
            <div className='w-2.5 h-2.5 rounded-full bg-emerald-500'></div>
            <span className='text-[10px] md:text-xs font-medium'>
              Entregado
            </span>
            <span className='text-xs text-muted-foreground max-sm:hidden'>
              - Pedido recibido por el cliente
            </span>
          </div>
        </div>
      </div>
      {/* Lista de pedidos - Vista Tarjetas (Móvil) */}
      <div className='lg:hidden'>
        {!isSignedIn ? (
          [...Array(3)].map((_, i) => <OrderSkeleton key={i} />)
        ) : filteredAndSortedOrders.length === 0 ? (
          <div className='text-center py-10 border border-dashed border-border rounded-lg'>
            <p className='text-sm text-muted-foreground'>No hay pedidos</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {filteredAndSortedOrders.map((order) => (
              <div
                key={order.id}
                className='bg-card border border-border rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform'
              >
                <div className='flex justify-between items-start gap-2 mb-3'>
                  <div className='min-w-0'>
                    {' '}
                    {/* min-w-0 evita que el texto rompa el layout */}
                    <h3 className='font-bold text-foreground text-sm truncate'>
                      {order.clientName}
                    </h3>
                    <p className='text-[10px] text-muted-foreground uppercase tracking-tight'>
                      ID: #{order.id} •{' '}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className='flex items-center justify-between pt-3 border-t border-border/50'>
                  <div>
                    <p className='text-[10px] text-muted-foreground leading-none mb-1'>
                      Total a pagar
                    </p>
                    <span className='text-base font-black text-foreground'>
                      S/. {calculateTotalWithDiscount(order)}
                    </span>
                  </div>
                  <div className='flex gap-2 w-1/2'>
                    <button
                      onClick={() => handleViewOrder(order)}
                      className='flex-1 justify-center py-2 text-xs border border-border rounded-lg bg-background flex items-center gap-1'
                    >
                      <Eye className='w-3.5 h-3.5' /> Ver
                    </button>
                    {order.status === 'Entregado' && (
                      <button
                        onClick={() => handleGeneratePDF(order)}
                        disabled={isGenerating}
                        className='flex-1 justify-center py-2 text-xs bg-foreground text-background rounded-lg flex items-center gap-1'
                      >
                        <FileText className='w-3.5 h-3.5' />{' '}
                        {isGenerating ? '...' : 'PDF'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Tabla de pedidos - Vista Escritorio */}
      <div className='hidden lg:block'>
        {!isSignedIn ? (
          <TableSkeleton />
        ) : (
          <div className='overflow-hidden rounded-xl border border-border bg-card'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='bg-foreground text-background'>
                    <th className='text-left p-4 font-semibold'>Cliente</th>
                    <th className='text-left p-4 font-semibold'>Estado</th>
                    <th className='text-left p-4 font-semibold'>Total</th>
                    <th className='text-left p-4 font-semibold'>Fecha</th>
                    <th className='text-right pr-16 font-semibold'>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className='p-8 text-center text-muted-foreground'
                      >
                        <div className='space-y-2'>
                          <p>
                            {searchTerm || statusFilter !== 'todos'
                              ? 'No hay pedidos que coincidan con los filtros aplicados'
                              : 'No hay pedidos para mostrar'}
                          </p>
                          {(searchTerm || statusFilter !== 'todos') && (
                            <button
                              onClick={() => {
                                setSearchTerm('')
                                setStatusFilter('todos')
                              }}
                              className='px-4 py-2 text-sm bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity'
                            >
                              Limpiar filtros
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedOrders.map((order) => (
                      <tr
                        key={order.id}
                        className='border-b border-border hover:bg-accent/50 transition-colors'
                      >
                        <td className='p-4'>
                          <div className='font-medium text-foreground'>
                            {order.clientName}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            ID: #{order.id}
                          </div>
                        </td>
                        <td className='p-4'>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className='p-4'>
                          <div className='font-bold text-foreground'>
                            S/. {calculateTotalWithDiscount(order)}
                          </div>
                        </td>
                        <td className='p-4'>
                          <div className='text-foreground'>
                            {new Date(order.createdAt).toLocaleDateString(
                              'es-PE'
                            )}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {new Date(order.createdAt).toLocaleTimeString(
                              'es-PE',
                              {
                                hour: '2-digit',
                                minute: '2-digit'
                              }
                            )}
                          </div>
                        </td>
                        <td className='p-4'>
                          <div className='flex space-x-2 justify-end'>
                            {order.status === 'Entregado' && (
                              <button
                                onClick={() => handleGeneratePDF(order)}
                                disabled={isGenerating}
                                className='px-3 py-1.5 text-sm bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1 disabled:opacity-50'
                              >
                                <FileText className='w-4 h-4' />
                                PDF
                              </button>
                            )}
                            <button
                              onClick={() => handleViewOrder(order)}
                              className='px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-1'
                            >
                              <Eye className='w-4 h-4' />
                              Ver
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
        )}
      </div>
      {/* Paginación */}
      <div className='flex flex-col sm:flex-row justify-between items-center gap-4 pt-4'>
        <div className='text-sm text-muted-foreground'>
          <div className='flex flex-col sm:flex-row gap-2 items-start sm:items-center'>
            <span>
              Mostrando {filteredAndSortedOrders.length} de {pagination.total}{' '}
              pedidos
            </span>
            {statusFilter !== 'todos' && (
              <span className='px-2 py-1 text-xs bg-accent rounded'>
                Filtrado por: {statusFilter}
              </span>
            )}
            {searchTerm && (
              <span className='px-2 py-1 text-xs bg-accent rounded'>
                Búsqueda: "{searchTerm}"
              </span>
            )}
            {sortField !== 'date' && (
              <span className='px-2 py-1 text-xs bg-accent rounded'>
                Ordenado por: {sortField === 'total' ? 'Total' : 'Cliente'} (
                {sortOrder === 'asc' ? 'Asc' : 'Desc'})
              </span>
            )}
          </div>
        </div>

        <div className='flex items-center space-x-2 text-xs'>
          <button
            disabled={page <= 1 || loading}
            onClick={() => setPage(page - 1)}
            className='px-2 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center'
          >
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
            Anterior
          </button>

          <div className='flex items-center space-x-1'>
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                let pageNum
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }

                if (pageNum > pagination.totalPages) return null

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg transition-colors ${
                      (page === 0 && pageNum === 1) || page === pageNum
                        ? 'bg-foreground text-background'
                        : 'hover:bg-accent text-foreground'
                    }`}
                    disabled={loading}
                  >
                    {pageNum}
                  </button>
                )
              }
            )}
          </div>

          {/* Modal de detalles */}
          <OrderDetailsModal
            order={selectedOrder}
            isOpen={!!selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />

          <button
            disabled={page >= pagination.totalPages || loading}
            onClick={() => setPage(page === 0 ? page + 2 : page + 1)}
            className='px-2 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center'
          >
            Siguiente
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5l7 7-7 7'
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
