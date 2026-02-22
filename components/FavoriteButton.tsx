'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/useTranslation'

function getFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('sos-shine-favorites') || '[]')
  } catch { return [] }
}

function toggleFavorite(slug: string): boolean {
  const favs = getFavorites()
  const idx = favs.indexOf(slug)
  if (idx >= 0) {
    favs.splice(idx, 1)
    localStorage.setItem('sos-shine-favorites', JSON.stringify(favs))
    window.dispatchEvent(new Event('favorites-changed'))
    return false
  } else {
    favs.push(slug)
    localStorage.setItem('sos-shine-favorites', JSON.stringify(favs))
    window.dispatchEvent(new Event('favorites-changed'))
    return true
  }
}

export { getFavorites }

export default function FavoriteButton({ slug, size = 'md' }: { slug: string; size?: 'sm' | 'md' }) {
  const { t } = useTranslation()
  const [isFav, setIsFav] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsFav(getFavorites().includes(slug))
    
    function onUpdate() {
      setIsFav(getFavorites().includes(slug))
    }
    window.addEventListener('favorites-changed', onUpdate)
    return () => window.removeEventListener('favorites-changed', onUpdate)
  }, [slug])

  if (!mounted) return null

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const btnSize = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'

  return (
    <motion.button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        const newState = toggleFavorite(slug)
        setIsFav(newState)
      }}
      whileTap={{ scale: 0.85 }}
      className={`${btnSize} rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer`}
      style={{
        background: isFav ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${isFav ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.08)'}`,
      }}
      title={isFav ? t('favorites.remove') : t('favorites.add')}
      aria-label={isFav ? t('favorites.remove') : t('favorites.add')}
    >
      <motion.svg
        animate={isFav ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
        className={iconSize}
        viewBox="0 0 24 24"
        fill={isFav ? 'var(--gold)' : 'none'}
        stroke={isFav ? 'var(--gold)' : 'var(--text-muted)'}
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </motion.svg>
    </motion.button>
  )
}
