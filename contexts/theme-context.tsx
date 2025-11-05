'use client'

import { ReactNode } from 'react'

// ThemeProvider simplificado - apenas envolve a aplicação
export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
