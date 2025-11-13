'use client'

import dynamic from 'next/dynamic'
import ChartSkeleton from '@/components/ui/chart-skeleton'

const PerformanceChart = dynamic(() => import('./performance-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
})

export default PerformanceChart
