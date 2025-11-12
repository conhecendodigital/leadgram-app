'use client'

import { motion } from 'framer-motion'
import { Users, Instagram } from 'lucide-react'
import Link from 'next/link'

interface AudienceInsightsProps {
  ideas?: any[]
}

export default function AudienceInsights({ ideas = [] }: AudienceInsightsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Insights da Audiência
          </h3>
          <p className="text-sm text-gray-600">
            Dados demográficos do seu público
          </p>
        </div>
      </div>

      {/* Empty State */}
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-6">
          <Users className="w-10 h-10 text-purple-600" />
        </div>

        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          Dados demográficos não disponíveis
        </h4>

        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Os insights demográficos (idade, gênero, localização, horários) não estão disponíveis nas ideias cadastradas.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto mb-6">
          <p className="text-sm text-blue-900">
            <strong>💡 Para ver dados reais da sua audiência:</strong>
          </p>
          <p className="text-sm text-blue-800 mt-2">
            Conecte sua conta Instagram Business para acessar insights demográficos detalhados dos seus seguidores.
          </p>
        </div>

        <Link
          href="/dashboard/analytics/instagram"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <Instagram className="w-5 h-5" />
          Acessar Analytics do Instagram
        </Link>
      </div>
    </motion.div>
  )
}
