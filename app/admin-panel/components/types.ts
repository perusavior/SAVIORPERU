export interface Producto {
  id: number
  name: string
  category: string
  estado: string
  size: string | null
  price: number
  image: string
  image2: string | null
  stock: number
  destacado: boolean
  createdAt: string
  updatedAt: string
  newCategory: string
}

export interface ApiResponse {
  data: Producto[]
  pagination: {
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
  }
  productsDetails: {
    totalInventoryAmount: number
    notAvailable: number
    totalStock: number
    totalProducts: number
    destacados: number
    categories: { name: string }[]
  }
}

export interface KpiData {
  totalProducts: number
  totalStock: number
  noDisponibleCount: number
  inventoryValue: number
  destacadosCount: number
  categories: { name: string }[]
}

export interface CloudinaryImage {
  public_id: string
  secure_url: string
  created_at: string
  bytes: number
  format: string
}

export interface CloudinaryApiResponse {
  resources: CloudinaryImage[]
  next_cursor: string | null
  total_count: number
}

export interface FormData {
  name: string
  category: string
  estado: string
  size: string
  price: number
  stock: number
  destacado: boolean
  image: string
  image2: string
  newCategory: string
}
