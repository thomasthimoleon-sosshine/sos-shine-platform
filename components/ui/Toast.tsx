'use client'

import React, { useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, AlertTriangle, Info } from 'lucide-react'

const toast = cva(
  [
    'fixed top-4 right-4 z-[150]',
    'flex items-center gap-3 px-4 py-3',
    'rounded-[var(--radius-lg)] text-sm max-w-sm',
    'backdrop-blur-xl',
  ].join(' '),
  {
    variants: {
      variant: {
        success: [
          'bg-[var(--success-alpha-weak)]',
          'border border-[var(--success-alpha-medium)]',
          'text-[var(--success)]',
        ].join(' '),
        error: [
          'bg-[var(--danger-alpha-weak)]',
          'border border-[var(--danger-alpha-medium)]',
          'text-[var(--danger)]',
        ].join(' '),
        info: [
          'bg-[var(--brand-alpha-weak)]',
          'border border-[var(--brand-alpha-medium)]',
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
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={toast({ variant })}
            role="alert"
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{message}</span>
            <button
              onClick={onDismiss}
              className="opacity-60 hover:opacity-100 cursor-pointer flex-shrink-0"
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
