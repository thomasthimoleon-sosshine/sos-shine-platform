'use client'

import React, { useEffect, useCallback } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import FocusTrap from 'focus-trap-react'

const overlay = cva([
  'fixed inset-0',
  'bg-[rgba(0,0,0,0.7)] backdrop-blur-sm',
].join(' '))

const panel = cva(
  [
    'relative rounded-[var(--radius-xl)] overflow-hidden w-full',
    'bg-[var(--surface)]',
    'border border-[var(--border)]',
    'shadow-[var(--shadow-lg)]',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface ModalProps extends VariantProps<typeof panel> {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, title, size, children }, ref) => {
    const handleEsc = useCallback(
      (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() },
      [onClose]
    )

    useEffect(() => {
      if (isOpen) {
        document.addEventListener('keydown', handleEsc)
        document.body.style.overflow = 'hidden'
      }
      return () => {
        document.removeEventListener('keydown', handleEsc)
        document.body.style.overflow = ''
      }
    }, [isOpen, handleEsc])

    return (
      <AnimatePresence>
        {isOpen && (
          <FocusTrap
            focusTrapOptions={{
              allowOutsideClick: true,
              returnFocusOnDeactivate: true,
              escapeDeactivates: false,
            }}
          >
            <div
              ref={ref}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-label={title}
            >
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={overlay()}
                onClick={onClose}
                aria-hidden="true"
              />

              {/* Panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={panel({ size })}
              >
                {/* Header */}
                {title && (
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                    <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                      {title}
                    </h2>
                    <button
                      onClick={onClose}
                      className={[
                        'w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center',
                        'text-[var(--text-muted)]',
                        'transition-colors duration-[var(--transition-fast)]',
                        'hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-secondary)]',
                        'cursor-pointer',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]',
                      ].join(' ')}
                      aria-label="Fermer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Body */}
                <div className="p-6">{children}</div>
              </motion.div>
            </div>
          </FocusTrap>
        )}
      </AnimatePresence>
    )
  }
)
Modal.displayName = 'Modal'

export { Modal }
