'use client'

import { GitCompare } from 'lucide-react'
import { showToast } from '@/lib/toast'

export default function CompareButton({ username }: { username: string }) {
  const handleCompare = () => {
    showToast.custom('Funcionalidade de comparação em breve! 🔍', '⚖️')
  }

  return (
    <button
      onClick={handleCompare}
      className="flex items-center gap-2 px-4 py-2 bg-primary hover:opacity-90 text-white rounded-xl font-semibold shadow-lg transition-all"
    >
      <GitCompare className="w-5 h-5" />
      Comparar Perfis
    </button>
  )
}
