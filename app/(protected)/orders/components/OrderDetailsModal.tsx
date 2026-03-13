'use client'

import React from 'react'
import { X } from 'lucide-react'

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

interface OrderDetailsModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose
}: OrderDetailsModalProps) {
  if (!isOpen || !order) return null

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

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card rounded-lg border border-border'>
        {/* Header */}
        <div className='sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card z-10'>
          <div>
            <h2 className='text-xl font-bold text-foreground'>
              Detalles del Pedido
            </h2>
            <p className='text-sm text-muted-foreground'>ID: #{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className='p-2 rounded-lg hover:bg-accent transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='p-6 space-y-6'>
          {/* Información General */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold text-foreground mb-2'>
                  Información del Cliente
                </h3>
                <div className='space-y-2 text-sm'>
                  <p>
                    <span className='text-muted-foreground'>Nombre:</span>{' '}
                    {order.clientName}
                  </p>
                  {order.dni && (
                    <p>
                      <span className='text-muted-foreground'>DNI:</span>{' '}
                      {order.dni}
                    </p>
                  )}
                  {order.clientPhone && (
                    <p>
                      <span className='text-muted-foreground'>Teléfono:</span>{' '}
                      {order.clientPhone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className='font-semibold text-foreground mb-2'>
                  Estado del Pedido
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                <p className='text-sm text-muted-foreground mt-2'>
                  Fecha:{' '}
                  {new Date(order.createdAt).toLocaleDateString('es-PE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold text-foreground mb-2'>
                  Información de Envío
                </h3>
                <div className='space-y-2 text-sm'>
                  {order.address && (
                    <p>
                      <span className='text-muted-foreground'>Dirección:</span>{' '}
                      {order.address}
                    </p>
                  )}
                  {order.locationToSend && (
                    <p>
                      <span className='text-muted-foreground'>Ubicación:</span>{' '}
                      {order.locationToSend}
                    </p>
                  )}
                  {order.agencia && (
                    <p>
                      <span className='text-muted-foreground'>Agencia:</span>{' '}
                      {order.agencia}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className='font-semibold text-foreground mb-2'>Costos</h3>
                <div className='space-y-1 text-sm'>
                  <p>
                    <span className='text-muted-foreground'>
                      Subtotal productos:
                    </span>{' '}
                    S/. {Number(order.totalPrice).toFixed(2)}
                  </p>
                  {order.deliveryCost && (
                    <p>
                      <span className='text-muted-foreground'>
                        Costo de envío:
                      </span>{' '}
                      S/. {order.deliveryCost}
                    </p>
                  )}
                  {order.discount && (
                    <p>
                      <span className='text-muted-foreground'>Descuento:</span>{' '}
                      - {order.discount}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div>
            <h3 className='font-semibold text-foreground mb-4'>
              Productos del Pedido
            </h3>
            <div className='border border-border rounded-lg overflow-hidden'>
              <table className='w-full'>
                <thead className='bg-accent'>
                  <tr>
                    <th className='text-left p-3 text-sm font-medium text-foreground'>
                      Producto
                    </th>
                    <th className='text-left p-3 text-sm font-medium text-foreground'>
                      Precio Unitario
                    </th>
                    <th className='text-left p-3 text-sm font-medium text-foreground'>
                      Cantidad
                    </th>
                    <th className='text-left p-3 text-sm font-medium text-foreground'>
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item) => (
                    <tr
                      key={item.id}
                      className='border-b border-border last:border-0'
                    >
                      <td className='p-3'>
                        <div className='font-medium text-foreground'>
                          {item.producto.name}
                        </div>
                      </td>
                      <td className='p-3 text-foreground'>
                        S/. {Number(item.producto.price).toFixed(2)}
                      </td>
                      <td className='p-3 text-foreground'>{item.quantity}</td>
                      <td className='p-3 font-medium text-foreground'>
                        S/. {Number(item.totalPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumen de Total */}
          <div className='flex justify-end'>
            <div className='bg-accent p-4 rounded-lg w-full md:w-1/2'>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-foreground'>Subtotal:</span>
                  <span className='font-medium text-foreground'>
                    S/. {Number(order.totalPrice).toFixed(2)}
                  </span>
                </div>
                {order.discount && (
                  <div className='flex justify-between text-green-600 dark:text-green-400'>
                    <span>Descuento:</span>
                    <span>- {order.discount}%</span>
                  </div>
                )}
                {order.deliveryCost && (
                  <div className='flex justify-between'>
                    <span className='text-foreground'>Envío:</span>
                    <span className='font-medium text-foreground'>
                      S/. {order.deliveryCost}
                    </span>
                  </div>
                )}

                <div className='border-t border-border pt-2 mt-2'>
                  <div className='flex justify-between text-lg font-bold text-foreground'>
                    <span>Total:</span>
                    <span>
                      S/.{' '}
                      {(
                        Math.floor(
                          (parseFloat(order.totalPrice) +
                            (order.deliveryCost
                              ? parseFloat(order.deliveryCost)
                              : 0) -
                            (order.discount
                              ? (parseFloat(order.totalPrice) *
                                  parseFloat(order.discount)) /
                                100
                              : 0)) *
                            10
                        ) / 10
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='sticky bottom-0 border-t border-border p-4 bg-card flex justify-end space-x-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors'
          >
            Cerrar
          </button>
          {order.status === 'Entregado' && (
            <button
              onClick={() => {
                // Llamar a la función para generar PDF
                window.dispatchEvent(
                  new CustomEvent('generate-pdf', { detail: order.id })
                )
                onClose()
              }}
              className='px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity'
            >
              Generar PDF
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
