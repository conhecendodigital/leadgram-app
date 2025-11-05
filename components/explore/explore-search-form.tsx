'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ExploreSearchForm() {
  const [username, setUsername] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      // Remover @ se o usuário digitou
      const cleanUsername = username.trim().replace('@', '')
      router.push(`/dashboard/explore/profile/${cleanUsername}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg">
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">
              Digite o @ do perfil que deseja analisar
            </span>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                @
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900 text-lg"
                required
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 gradient-primary hover:opacity-90  disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed"
          >
            <Search className="w-5 h-5" />
            Analisar Perfil
          </button>
        </div>

        {/* Exemplos */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">
            Exemplos populares:
          </p>
          <div className="flex flex-wrap gap-2">
            {['instagram', 'cristiano', 'leomessi', 'nike'].map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setUsername(example)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                @{example}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  )
}
