import { useEffect, useRef } from 'react'
import { showToast } from '@/lib/toast'

export function useAutoSave(
  data: any,
  onSave: (data: any) => Promise<void>,
  delay: number = 2000
) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const isSavingRef = useRef(false)

  useEffect(() => {
    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Não fazer nada se estiver salvando
    if (isSavingRef.current) return

    // Criar novo timeout
    timeoutRef.current = setTimeout(async () => {
      if (data && Object.keys(data).length > 0) {
        isSavingRef.current = true
        try {
          await onSave(data)
          showToast.custom('Rascunho salvo automaticamente', '💾')
        } catch (error) {
          console.error('Auto-save error:', error)
        } finally {
          isSavingRef.current = false
        }
      }
    }, delay)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, onSave, delay])
}
