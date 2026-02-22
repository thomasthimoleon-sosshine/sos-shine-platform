'use client'

import { useState, useEffect, useCallback } from 'react'
import { translations, type Locale } from './translations'

const DEFAULT_LOCALE: Locale = 'fr'
const STORAGE_KEY = 'sos-shine-locale'

export function getLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
  if (saved && translations[saved]) return saved
  return DEFAULT_LOCALE
}

export function setLocale(locale: Locale) {
  localStorage.setItem(STORAGE_KEY, locale)
  document.documentElement.setAttribute('lang', locale)
  window.dispatchEvent(new CustomEvent('locale-changed', { detail: locale }))
}

export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setLocaleState(getLocale())

    function onLocaleChange(e: Event) {
      const customEvent = e as CustomEvent<Locale>
      setLocaleState(customEvent.detail)
    }
    window.addEventListener('locale-changed', onLocaleChange)
    return () => window.removeEventListener('locale-changed', onLocaleChange)
  }, [])

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const currentLocale = mounted ? locale : DEFAULT_LOCALE
    let value = translations[currentLocale]?.[key] || translations[DEFAULT_LOCALE]?.[key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v))
      })
    }
    return value
  }, [locale, mounted])

  const changeLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale)
    setLocaleState(newLocale)
  }, [])

  return { t, locale, changeLocale, mounted }
}
