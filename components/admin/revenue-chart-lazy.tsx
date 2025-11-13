'use client'

import dynamic from 'next/dynamic'
import ChartSkeleton from '@/components/ui/chart-skeleton'

const RevenueChart = dynamic(() => import('./revenue-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
})

export default RevenueChart
