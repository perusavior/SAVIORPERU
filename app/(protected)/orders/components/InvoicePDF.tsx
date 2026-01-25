// app/components/InvoicePDF.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold'
  },
  companyInfo: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666'
  },
  section: {
    marginBottom: 15
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5
  },
  // Estructura de tabla usando Views
  table: {
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#000'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#000'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  productCol: {
    flex: 3,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#ccc'
  },
  priceCol: {
    flex: 1,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    textAlign: 'right'
  },
  qtyCol: {
    flex: 1,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    textAlign: 'center'
  },
  totalCol: {
    flex: 1,
    padding: 5,
    textAlign: 'right'
  },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    marginBottom: 3
  },
  grandTotal: {
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#000',
    fontWeight: 'bold',
    fontSize: 12
  },
  footer: {
    marginTop: 40,
    fontSize: 8,
    textAlign: 'center',
    color: '#666'
  }
})

export interface InvoicePDFProps {
  orderData: {
    orderId: number
    clientName: string
    totalPrice: string
    createdAt: string
    orderItems: Array<{
      producto: { name: string; price: string }
      quantity: number
      totalPrice: string
    }>
    dni?: string
    clientPhone?: string
    address?: string
    agencia?: string
    deliveryCost?: string
    discount?: string
  }
}

export function InvoicePDF({ orderData }: InvoicePDFProps) {
  const subtotal = parseFloat(orderData.totalPrice) || 0
  const delivery = parseFloat(orderData.deliveryCost || '0')
  const calculateDiscount = orderData.discount
    ? (subtotal * parseFloat(orderData.discount)) / 100
    : 0
  const roundedDiscount = Math.ceil(calculateDiscount * 10) / 10
  const discount = parseFloat(orderData.discount || '0')
  const total = (
    (subtotal * 100 + delivery * 100 - roundedDiscount * 100) /
    100
  ).toFixed(2)

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Encabezado */}
        <Text style={styles.title}>COMPROBANTE DE COMPRA</Text>
        <Text style={styles.companyInfo}>
          SAVIOR PERU
          {'\n'}
          Web: saviorperu.com
          {'\n'}
          Whatsapp: (+51) 958284730
        </Text>

        {/* Información del pedido */}
        <View style={styles.section}>
          <Text>
            <Text style={styles.label}>Pedido #:</Text> {orderData.orderId}
          </Text>
          <Text>
            <Text style={styles.label}>Fecha:</Text>{' '}
            {new Date(orderData.createdAt).toLocaleDateString('es-PE')}
          </Text>
          <Text>
            <Text style={styles.label}>Cliente:</Text> {orderData.clientName}
          </Text>
          {orderData.dni && (
            <Text>
              <Text style={styles.label}>DNI:</Text> {orderData.dni}
            </Text>
          )}
          {orderData.clientPhone && (
            <Text>
              <Text style={styles.label}>Teléfono:</Text>{' '}
              {orderData.clientPhone}
            </Text>
          )}
          {orderData.address && (
            <Text>
              <Text style={styles.label}>Dirección:</Text> {orderData.address}
            </Text>
          )}
          {orderData.agencia && (
            <Text>
              <Text style={styles.label}>Agencia:</Text> {orderData.agencia}
            </Text>
          )}

          <Text>
            <Text style={styles.label}>Estado de pedido:</Text> Entregado
          </Text>
        </View>

        {/* Tabla de productos */}
        <View style={styles.table}>
          {/* Encabezado */}
          <View style={styles.tableHeader}>
            <Text style={styles.productCol}>Producto</Text>
            <Text style={styles.priceCol}>Precio Unit.</Text>
            <Text style={styles.qtyCol}>Cant.</Text>
            <Text style={styles.totalCol}>Subtotal</Text>
          </View>

          {/* Filas de productos */}
          {orderData.orderItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.productCol}>{item.producto.name}</Text>
              <Text style={styles.priceCol}>S/. {item.producto.price}</Text>
              <Text style={styles.qtyCol}>{item.quantity}</Text>
              <Text style={styles.totalCol}>S/. {item.totalPrice}</Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>S/. {subtotal.toFixed(2)}</Text>
          </View>
          {delivery > 0 && (
            <View style={styles.totalRow}>
              <Text>Envío:</Text>
              <Text>S/. {delivery.toFixed(2)}</Text>
            </View>
          )}
          {discount > 0 && (
            <View style={styles.totalRow}>
              <Text>Descuento:</Text>
              <Text>-%. {discount.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>TOTAL:</Text>
            <Text>S/. {total}</Text>
          </View>
        </View>

        {/* Pie de página */}
        <View style={styles.footer}>
          <Text>Gracias por su compra</Text>
          <Text>Este documento es un comprobante de compra</Text>
          <Text>Para consultas contactar a: saviorstore.pe@gmail.com</Text>
        </View>
      </Page>
    </Document>
  )
}
