// app/hooks/usePDFGenerator.tsx
'use client'

import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { InvoicePDF } from '../components/InvoicePDF'

interface OrderItem {
  producto: { name: string; price: string }
  quantity: number
  totalPrice: string
}

interface PDFData {
  orderId: number
  clientName: string
  status: string
  totalPrice: string
  createdAt: string
  orderItems: OrderItem[]
  address?: string
  agencia?: string
  clientPhone?: string
  dni?: string
  deliveryCost?: string
  discount?: string
}

export function usePDFGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async (orderData: PDFData) => {
    setIsGenerating(true)
    try {
      // Crear el blob del PDF
      const blob = await pdf(<InvoicePDF orderData={orderData} />).toBlob()

      // Crear URL para el blob
      const url = URL.createObjectURL(blob)

      // Crear enlace para descarga
      const a = document.createElement('a')
      a.href = url
      a.download = `Comprabante de compra - ${orderData.orderId}.pdf`
      document.body.appendChild(a)
      a.click()

      // Limpiar después de un tiempo
      setTimeout(() => {
        URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)

      return true
    } catch (error) {
      console.error('Error al generar PDF:', error)
      return false
    } finally {
      setIsGenerating(false)
    }
  }

  const previewPDF = async (orderData: PDFData) => {
    setIsGenerating(true)
    try {
      const blob = await pdf(<InvoicePDF orderData={orderData} />).toBlob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')

      // No revocar la URL inmediatamente para la vista previa
      setTimeout(() => URL.revokeObjectURL(url), 10000)

      return true
    } catch (error) {
      console.error('Error al generar PDF:', error)
      return false
    } finally {
      setIsGenerating(false)
    }
  }

  return { generatePDF, previewPDF, isGenerating }
}
