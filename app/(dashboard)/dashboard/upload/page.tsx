import { Metadata } from 'next'
import { Upload as UploadIcon, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import UploadForm from '@/components/upload/upload-form'

export const metadata: Metadata = {
  title: 'Upload de Conteúdo | Leadgram',
  description: 'Faça upload dos seus vídeos e imagens',
}

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 sm:mb-6">
          <Link href="/dashboard" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Upload</span>
        </div>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
              <UploadIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Upload de Conteúdo
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Envie seus vídeos ou imagens e crie uma ideia automaticamente
          </p>
        </div>

        {/* Upload Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
          <UploadForm />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <h3 className="font-semibold text-gray-900">Selecione o arquivo</h3>
            </div>
            <p className="text-sm text-gray-600">
              Escolha um vídeo ou imagem do seu dispositivo
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <h3 className="font-semibold text-gray-900">Adicione informações</h3>
            </div>
            <p className="text-sm text-gray-600">
              Preencha título, tema e plataformas
            </p>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <h3 className="font-semibold text-gray-900">Pronto!</h3>
            </div>
            <p className="text-sm text-gray-600">
              Sua ideia será criada automaticamente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
