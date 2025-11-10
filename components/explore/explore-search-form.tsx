'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, User, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Suggestion {
  username: string
  name: string
  category: string
}

export default function ExploreSearchForm() {
  const [username, setUsername] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Buscar sugestões quando o usuário digitar
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (username.length === 0) {
        // Buscar perfis populares quando o campo está vazio
        setLoading(true)
        try {
          const response = await fetch('/api/instagram/search')
          const data = await response.json()
          setSuggestions(data.suggestions || [])
        } catch (error) {
          console.error('Failed to fetch popular profiles:', error)
          setSuggestions([])
        } finally {
          setLoading(false)
        }
        return
      }

      if (username.length < 2) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/instagram/search?q=${encodeURIComponent(username)}`)
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [username])

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      // Remover @ se o usuário digitou
      const cleanUsername = username.trim().replace('@', '')
      setShowSuggestions(false)
      router.push(`/dashboard/explore/profile/${cleanUsername}`)
    }
  }

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setUsername(suggestion.username)
    setShowSuggestions(false)
    router.push(`/dashboard/explore/profile/${suggestion.username}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelectSuggestion(suggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
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
                ref={inputRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                placeholder="username"
                className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900 text-lg"
                autoComplete="off"
              />

              {/* Dropdown de sugestões */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto"
                >
                  {username.length === 0 && (
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-medium">Perfis Populares</span>
                      </div>
                    </div>
                  )}

                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.username}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${
                        index === selectedIndex ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {suggestion.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            @{suggestion.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600 truncate">{suggestion.name}</span>
                          {suggestion.category && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-500 text-xs">{suggestion.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                  ))}

                  {loading && (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      Buscando...
                    </div>
                  )}
                </div>
              )}
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
