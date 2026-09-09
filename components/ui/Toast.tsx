'use client'

import React, { useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, AlertTriangle, Info } from 'lucide-react'

const toast = cva(
  [
    'fixed top-5 right-5 z-[90]',
    'flex items-center gap-3 px-5 py-3.5',
    'rounded-[var(--radius-lg)] text-[13px] max-w-sm',
    'bg-[var(--surface-card)] border',
    'shadow-[var(--shadow-lg)]',
    'backdrop-blur-xl',
  ].join(' '),
  {
    variants: {
      variant: {
        success: [
          'border-[var(--success-alpha-medium)]',
          'text-[var(--success)]',
        ].join(' '),
        error: [
          'border-[var(--danger-alpha-medium)]',
          'text-[var(--danger)]',
        ].join(' '),
        warning: [
          'border-[rgba(212,160,84,0.15)]',
          'text-[var(--warning)]',
        ].join(' '),
        info: [
          'border-[var(--brand-alpha-medium)]',
          'text-[var(--brand)]',
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
)

const iconMap = {
  success: Check,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
} as const

export interface ToastProps extends VariantProps<typeof toast> {
  message: string
  isVisible: boolean
  onDismiss: () => void
  duration?: number
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ message, variant, isVisible, onDismiss, duration = 4000 }, ref) => {
    useEffect(() => {
      if (isVisible && duration > 0) {
        const timer = setTimeout(onDismiss, duration)
        return () => clearTimeout(timer)
      }
    }, [isVisible, duration, onDismiss])

    const v = variant || 'info'
    const Icon = iconMap[v]

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: 24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={toast({ variant })}
            role="alert"
          >
            <Icon className="w-4 h-4 flex-shrink-0 opacity-80" />
            <span className="flex-1 text-[var(--text-primary)]">{message}</span>
            <button
              onClick={onDismiss}
              className="opacity-40 hover:opacity-80 cursor-pointer flex-shrink-0 transition-opacity"
              aria-label="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
)
Toast.displayName = 'Toast'

export { Toast }
