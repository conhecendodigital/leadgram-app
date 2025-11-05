'use client'

import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Users, Eye, Target } from 'lucide-react'

interface GrowthMetricsProps {
  ideas?: any[]
}

export default function GrowthMetrics({ ideas = [] }: GrowthMetricsProps) {
  const growthData = [
    { date: '01 Mai', seguidores: 98000, visualizacoes: 450000, engajamento: 28000 },
    { date: '08 Mai', seguidores: 102000, visualizacoes: 520000, engajamento: 32000 },
    { date: '15 Mai', seguidores: 108000, visualizacoes: 580000, engajamento: 35000 },
    { date: '22 Mai', seguidores: 115000, visualizacoes: 620000, engajamento: 38000 },
    { date: '29 Mai', seguidores: 127500, visualizacoes: 680000, engajamento: 42000 },
    { date: '05 Jun', seguidores: 135000, visualizacoes: 720000, engajamento: 45000 },
  ]

  const metrics = [
    {
      label: 'Taxa de Crescimento',
      value: '+23.4%',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      description: 'Últimos 30 dias',
    },
    {
      label: 'Novos Seguidores',
      value: '+12.5K',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      description: 'Este mês',
    },
    {
      label: 'Taxa de Engajamento',
      value: '6.8%',
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      description: 'Média mensal',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Métricas de Crescimento
          </h3>
          <p className="text-sm text-gray-600">
            Evolução nos últimos 30 dias
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-gray-50 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 bg-gradient-to-br ${metric.color} rounded-lg`}>
                <metric.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm text-gray-600">
                {metric.label}
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {metric.value}
            </p>
            <p className="text-xs text-gray-500">
              {metric.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Growth Chart */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">
          Evolução Geral
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="colorSeguidores" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorVisualizacoes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEngajamento" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="seguidores"
                stroke="#8B5CF6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSeguidores)"
              />
              <Area
                type="monotone"
                dataKey="visualizacoes"
                stroke="#EC4899"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVisualizacoes)"
              />
              <Area
                type="monotone"
                dataKey="engajamento"
                stroke="#F59E0B"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEngajamento)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h5 className="font-semibold text-green-900">
              Melhor Desempenho
            </h5>
          </div>
          <p className="text-sm text-green-700">
            Crescimento de <strong>37.5%</strong> nos últimos 30 dias, ultrapassando a meta mensal em 12%.
          </p>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-primary" />
            <h5 className="font-semibold text-blue-900">
              Projeção
            </h5>
          </div>
          <p className="text-sm text-blue-700">
            Mantendo este ritmo, você alcançará <strong>150K seguidores</strong> até o final do mês.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
