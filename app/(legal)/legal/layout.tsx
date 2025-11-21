import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-3 w-fit">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Leadgram</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-600">
            <Link href="/legal/privacy" className="hover:text-primary transition-colors">
              Política de Privacidade
            </Link>
            <Link href="/legal/terms" className="hover:text-primary transition-colors">
              Termos de Uso
            </Link>
            <Link href="/legal/cookies" className="hover:text-primary transition-colors">
              Política de Cookies
            </Link>
          </div>
          <p className="text-xs text-gray-500 text-center mt-6">
            © 2025 Leadgram. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
