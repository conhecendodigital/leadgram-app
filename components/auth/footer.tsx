import Link from 'next/link'

export default function AuthFooter() {
  return (
    <footer className="mt-8 pt-6 border-t border-gray-200">
      <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-600 mb-3">
        <Link href="/legal/privacy" className="hover:text-primary transition-colors">
          Política de Privacidade
        </Link>
        <span className="text-gray-300">·</span>
        <Link href="/legal/terms" className="hover:text-primary transition-colors">
          Termos de Uso
        </Link>
        <span className="text-gray-300">·</span>
        <Link href="/legal/cookies" className="hover:text-primary transition-colors">
          Cookies
        </Link>
      </div>
      <p className="text-xs text-gray-500 text-center">
        © 2025 Leadgram. Todos os direitos reservados.
      </p>
    </footer>
  )
}
