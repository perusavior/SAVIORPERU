import { NextRequest, NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    // Crear documento PDF
    const doc = new PDFDocument({ margin: 50 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => {})

    // Configuración del documento
    doc.fontSize(20).text('COMPROBANTE DE PEDIDO', { align: 'center' })
    doc.moveDown()

    // Información de la empresa
    doc
      .fontSize(10)
      .text('TU EMPRESA S.A.C.', { align: 'center' })
      .text('RUC: 20123456789', { align: 'center' })
      .text('Dirección: Av. Principal 123, Lima', { align: 'center' })
      .text('Teléfono: (01) 234-5678', { align: 'center' })
      .moveDown()

    // Línea divisoria
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown()

    // Información del pedido
    doc.fontSize(12)
    doc.text(`Pedido #: ${orderData.orderId}`)
    doc.text(
      `Fecha: ${new Date(orderData.createdAt).toLocaleDateString('es-PE')}`
    )
    doc.text(`Cliente: ${orderData.clientName}`)

    if (orderData.dni) {
      doc.text(`DNI: ${orderData.dni}`)
    }

    if (orderData.clientPhone) {
      doc.text(`Teléfono: ${orderData.clientPhone}`)
    }

    if (orderData.address) {
      doc.text(`Dirección: ${orderData.address}`)
    }

    if (orderData.agencia) {
      doc.text(`Agencia: ${orderData.agencia}`)
    }

    doc.moveDown()

    // Tabla de productos
    const tableTop = doc.y + 20
    const itemHeaderTop = tableTop
    const marginLeft = 50
    const nameWidth = 250
    const priceWidth = 100
    const qtyWidth = 80
    const totalWidth = 100

    // Encabezado de tabla
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Producto', marginLeft, itemHeaderTop)
      .text('Precio', marginLeft + nameWidth, itemHeaderTop)
      .text('Cant.', marginLeft + nameWidth + priceWidth, itemHeaderTop)
      .text(
        'Total',
        marginLeft + nameWidth + priceWidth + qtyWidth,
        itemHeaderTop
      )

    // Línea bajo encabezado
    doc
      .moveTo(marginLeft, itemHeaderTop + 15)
      .lineTo(
        marginLeft + nameWidth + priceWidth + qtyWidth + totalWidth,
        itemHeaderTop + 15
      )
      .stroke()

    // Productos
    let y = itemHeaderTop + 25
    doc.font('Helvetica')

    orderData.orderItems.forEach((item: any, i: number) => {
      if (y > 700) {
        doc.addPage()
        y = 50
      }

      doc
        .fontSize(9)
        .text(item.producto.name, marginLeft, y, { width: nameWidth - 10 })
        .text(`S/. ${item.producto.price}`, marginLeft + nameWidth, y)
        .text(item.quantity.toString(), marginLeft + nameWidth + priceWidth, y)
        .text(
          `S/. ${item.totalPrice}`,
          marginLeft + nameWidth + priceWidth + qtyWidth,
          y
        )

      y += 20
    })

    // Totales
    y += 10
    doc
      .moveTo(marginLeft, y)
      .lineTo(marginLeft + nameWidth + priceWidth + qtyWidth + totalWidth, y)
      .stroke()

    y += 10

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('SUBTOTAL:', marginLeft + nameWidth + priceWidth, y)
      .text(
        `S/. ${orderData.totalPrice}`,
        marginLeft + nameWidth + priceWidth + qtyWidth,
        y
      )

    if (orderData.deliveryCost) {
      y += 20
      doc
        .text('ENVÍO:', marginLeft + nameWidth + priceWidth, y)
        .text(
          `S/. ${orderData.deliveryCost}`,
          marginLeft + nameWidth + priceWidth + qtyWidth,
          y
        )
    }

    if (orderData.discount) {
      y += 20
      doc
        .text('DESCUENTO:', marginLeft + nameWidth + priceWidth, y)
        .text(
          `-S/. ${orderData.discount}`,
          marginLeft + nameWidth + priceWidth + qtyWidth,
          y
        )
    }

    y += 20
    doc
      .moveTo(marginLeft, y)
      .lineTo(marginLeft + nameWidth + priceWidth + qtyWidth + totalWidth, y)
      .stroke()

    y += 10
    doc
      .fontSize(12)
      .text('TOTAL:', marginLeft + nameWidth + priceWidth, y)
      .text(
        `S/. ${(
          parseFloat(orderData.totalPrice) +
          (orderData.deliveryCost ? parseFloat(orderData.deliveryCost) : 0) -
          (orderData.discount ? parseFloat(orderData.discount) : 0)
        ).toFixed(2)}`,
        marginLeft + nameWidth + priceWidth + qtyWidth,
        y
      )

    // Pie de página
    const pageHeight = doc.page.height
    const footerY = pageHeight - 50

    doc
      .fontSize(8)
      .font('Helvetica')
      .text('Gracias por su compra', marginLeft, footerY, { align: 'center' })
      .text(
        'Este documento es un comprobante de pedido',
        marginLeft,
        footerY + 10,
        { align: 'center' }
      )
      .text(
        'Para consultas contactar a: contacto@tuempresa.com',
        marginLeft,
        footerY + 20,
        { align: 'center' }
      )

    doc.end()

    // Esperar a que se termine de generar el PDF
    await new Promise<void>((resolve) => {
      doc.on('end', resolve)
    })

    // Convertir chunks a Buffer
    const pdfBuffer = Buffer.concat(chunks)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="pedido-${orderData.orderId}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generando PDF:', error)
    return NextResponse.json(
      { error: 'Error al generar el PDF' },
      { status: 500 }
    )
  }
}
