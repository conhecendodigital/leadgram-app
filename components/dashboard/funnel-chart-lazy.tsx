'use client'

import dynamic from 'next/dynamic'
import ChartSkeleton from '@/components/ui/chart-skeleton'

const FunnelChart = dynamic(() => import('./funnel-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
})

export default FunnelChart
