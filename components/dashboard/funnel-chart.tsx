'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface FunnelData {
  name: string
  ideias: number
}

export default function FunnelChart() {
  const [data, setData] = useState<FunnelData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { data: ideas } = await (supabase
          .from('ideas') as any)
          .select('funnel_stage')
          .eq('user_id', user.id)

        if (ideas) {
          const funnelData: FunnelData[] = [
            {
              name: 'Topo',
              ideias: ideas.filter((i: any) => i.funnel_stage === 'top').length,
            },
            {
              name: 'Meio',
              ideias: ideas.filter((i: any) => i.funnel_stage === 'middle').length,
            },
            {
              name: 'Fundo',
              ideias: ideas.filter((i: any) => i.funnel_stage === 'bottom').length,
            },
          ]

          setData(funnelData)
        }
      } catch (error) {
        console.error('Error fetching funnel data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Funil</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Bar dataKey="ideias" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0866FF" />
              <stop offset="100%" stopColor="#9333EA" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
