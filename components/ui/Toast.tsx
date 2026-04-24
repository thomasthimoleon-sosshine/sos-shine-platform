'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastProps {
  message: string
  variant?: ToastVariant
  isVisible: boolean
  onDismiss: () => void
  duration?: number
}

const variantConfig: Record<ToastVariant, { icon: string; bg: string; border: string; color: string }> = {
  success: { icon: '✓', bg: 'rgba(85, 239, 196, 0.08)', border: 'rgba(85, 239, 196, 0.2)', color: '#55EFC4' },
  error:   { icon: '✕', bg: 'rgba(232, 93, 93, 0.08)',  border: 'rgba(232, 93, 93, 0.2)',  color: '#E85D5D' },
  info:    { icon: 'ℹ', bg: 'rgba(212, 175, 55, 0.08)', border: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold)' },
}

export function Toast({ message, variant = 'info', isVisible, onDismiss, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onDismiss, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onDismiss])

  const config = variantConfig[variant]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="fixed top-4 right-4 flex items-center gap-3 px-4 py-3 rounded-xl text-sm max-w-sm"
          style={{
            background: config.bg,
            border: `1px solid ${config.border}`,
            color: config.color,
            zIndex: 150,
            backdropFilter: 'blur(12px)',
          }}
        >
          <span className="font-bold text-base">{config.icon}</span>
          <span className="flex-1">{message}</span>
          <button onClick={onDismiss} className="opacity-60 hover:opacity-100 cursor-pointer" aria-label="Fermer">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
