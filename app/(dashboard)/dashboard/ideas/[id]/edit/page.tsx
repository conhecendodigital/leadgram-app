import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { ChevronRight } from 'lucide-react'
import IdeaForm from '@/components/ideas/idea-form'

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditIdeaPage({ params }: PageProps) {
  const supabase = await createServerClient()

  const { data: idea } = await supabase
    .from('ideas')
    .select(`
      *,
      platforms:idea_platforms(
        id,
        platform,
        platform_post_id,
        post_url,
        posted_at,
        is_posted
      )
    `)
    .eq('id', params.id)
    .single()

  if (!idea) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/dashboard/ideas" className="hover:text-blue-600 transition-colors">
            Ideias
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/dashboard/ideas/${idea.id}`} className="hover:text-blue-600 transition-colors">
            {idea.title}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Editar</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar Ideia</h1>
          <p className="text-gray-600">
            Atualize os detalhes da sua ideia de conteúdo
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <IdeaForm mode="edit" idea={idea} />
        </div>
      </div>
    </div>
  )
}
