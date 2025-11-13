'use client'

import dynamic from 'next/dynamic'
import ChartSkeleton from '@/components/ui/chart-skeleton'

const EngagementChart = dynamic(() => import('./engagement-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
})

export default EngagementChart
