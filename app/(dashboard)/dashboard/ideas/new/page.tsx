import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import IdeaForm from '@/components/ideas/idea-form'

export default function NewIdeaPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/dashboard/ideas" className="hover:text-primary transition-colors">
            Ideias
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Nova Ideia</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Nova Ideia</h1>
          <p className="text-gray-600">
            Preencha os detalhes da sua nova ideia de conteúdo
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <IdeaForm mode="create" />
        </div>
      </div>
    </div>
  )
}
