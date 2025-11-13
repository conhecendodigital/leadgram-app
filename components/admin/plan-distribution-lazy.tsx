'use client'

import dynamic from 'next/dynamic'
import ChartSkeleton from '@/components/ui/chart-skeleton'

const PlanDistribution = dynamic(() => import('./plan-distribution'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
})

export default PlanDistribution
