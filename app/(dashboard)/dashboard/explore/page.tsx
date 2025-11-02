import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Search } from 'lucide-react'
import ExploreSearchForm from '@/components/explore/explore-search-form'

export default async function ExplorePage() {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 md:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl md:rounded-2xl">
            <Search className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
            Explorar Perfis
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Analise perfis do Instagram e descubra insights valiosos
        </p>
      </div>

      {/* Search Form */}
      <ExploreSearchForm />

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            📊 Análise Completa
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Visualize estatísticas detalhadas de seguidores, engajamento e crescimento
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            🎯 Top Posts
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Descubra quais conteúdos geraram mais engajamento
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            📈 Métricas em Tempo Real
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Dados atualizados direto do Instagram
          </p>
        </div>
      </div>
    </div>
  )
}
