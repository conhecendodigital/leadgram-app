import { Metadata } from 'next'
import { Zap, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import AutomationsClient from '@/components/automations/automations-client'

export const metadata: Metadata = {
  title: 'Automações | Leadgram',
  description: 'Configure automações para seu conteúdo',
}

export default function AutomationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 sm:mb-6">
          <Link href="/dashboard" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Automações</span>
        </div>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Automações
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Configure automações para otimizar seu fluxo de trabalho
          </p>
        </div>

        {/* Client Component */}
        <AutomationsClient />
      </div>
    </div>
  )
}
