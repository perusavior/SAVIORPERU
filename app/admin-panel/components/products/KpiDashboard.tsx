'use client'

import React from 'react'
import {
  MdInventory2,
  MdLocalShipping,
  MdWarning,
  MdAttachMoney,
  MdStar
} from 'react-icons/md'
// import KpiCard from '../shared/KpiCard'
import type { KpiData } from '../types'
import KpiCard from '../KpiCard'

interface KpiDashboardProps {
  kpiData: KpiData
}

const KpiDashboard: React.FC<KpiDashboardProps> = ({ kpiData }) => {
  const kpis = [
    {
      title: 'Total Productos',
      value: kpiData.totalProducts.toString(),
      trend: 'Productos registrados',
      Icon: MdInventory2,
      color: 'blue' as const
    },
    {
      title: 'Stock Total',
      value: kpiData.totalStock.toString(),
      trend: 'En inventario',
      Icon: MdLocalShipping,
      color: 'indigo' as const
    },
    {
      title: 'No Disponible',
      value: kpiData.noDisponibleCount.toString(),
      trend: 'Sin stock',
      Icon: MdWarning,
      color: 'orange' as const
    },
    {
      title: 'Valor Inventario',
      value: `S/ ${kpiData.inventoryValue.toFixed(2)}`,
      trend: 'Productos disponibles',
      Icon: MdAttachMoney,
      color: 'purple' as const
    }
  ]

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {kpis.map((kpi, index) => (
        <KpiCard
          key={index}
          title={kpi.title}
          value={kpi.value}
          trend={kpi.trend}
          Icon={kpi.Icon}
          color={kpi.color}
        />
      ))}
    </div>
  )
}

export default KpiDashboard
