import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Search } from 'lucide-react'
import ExploreSearchForm from '@/components/explore/explore-search-form'

export default async function ExplorePage() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 md:p-3 gradient-primary rounded-xl md:rounded-2xl">
            <Search className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Explorar Perfis
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-600">
          Analise perfis do Instagram e descubra insights valiosos
        </p>
      </div>

      {/* Search Form */}
      <ExploreSearchForm />

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            📊 Análise Completa
          </h3>
          <p className="text-sm text-gray-600">
            Visualize estatísticas detalhadas de seguidores, engajamento e crescimento
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            🎯 Top Posts
          </h3>
          <p className="text-sm text-gray-600">
            Descubra quais conteúdos geraram mais engajamento
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            📈 Métricas em Tempo Real
          </h3>
          <p className="text-sm text-gray-600">
            Dados atualizados direto do Instagram
          </p>
        </div>
      </div>
    </div>
  )
}
