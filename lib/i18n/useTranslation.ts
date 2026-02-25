'use client'

import { useCallback } from 'react'
import { translations } from './translations'

export function useTranslation() {
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let value = translations[key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v))
      })
    }
    return value
  }, [])

  return { t }
}
