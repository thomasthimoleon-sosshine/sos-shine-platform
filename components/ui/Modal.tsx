'use client'

import React, { useEffect, useCallback } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import FocusTrap from 'focus-trap-react'

const overlay = cva([
  'fixed inset-0',
  'bg-[var(--surface-overlay)] backdrop-blur-md',
].join(' '))

const panel = cva(
  [
    'relative overflow-hidden w-full',
    'bg-[var(--surface-raised)]',
    'border border-[var(--border)]',
    'shadow-[var(--shadow-xl)]',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'max-w-sm rounded-[var(--radius-xl)]',
        md: 'max-w-md rounded-[var(--radius-xl)]',
        lg: 'max-w-lg rounded-[var(--radius-2xl)]',
        xl: 'max-w-xl rounded-[var(--radius-2xl)]',
        full: 'max-w-3xl rounded-[var(--radius-2xl)]',
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
              className="fixed inset-0 z-[80] flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-label={title}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                className={overlay()}
                onClick={onClose}
                aria-hidden="true"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={panel({ size })}
              >
                {title && (
                  <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
                    <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                      {title}
                    </h2>
                    <button
                      onClick={onClose}
                      className={[
                        'w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center',
                        'text-[var(--text-muted)]',
                        'transition-all duration-[var(--transition-fast)]',
                        'hover:bg-[var(--surface-card)] hover:text-[var(--text-secondary)]',
                        'cursor-pointer',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]',
                      ].join(' ')}
                      aria-label="Fermer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

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
