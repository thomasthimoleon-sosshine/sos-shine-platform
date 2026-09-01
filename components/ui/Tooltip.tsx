'use client'

import React, { useState } from 'react'
import { cva } from 'class-variance-authority'
import { motion, AnimatePresence } from 'framer-motion'

const tooltipBubble = cva(
  [
    'absolute left-1/2 -translate-x-1/2',
    'px-3 py-1.5 rounded-[var(--radius-md)]',
    'text-[12px] whitespace-nowrap pointer-events-none',
    'bg-[var(--surface-card)]',
    'border border-[var(--border)]',
    'text-[var(--text-primary)]',
    'shadow-[var(--shadow-md)]',
    'z-[100]',
  ].join(' '),
  {
    variants: {
      position: {
        top: 'bottom-full mb-2',
        bottom: 'top-full mt-2',
      },
    },
    defaultVariants: {
      position: 'top',
    },
  }
)

export interface TooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom'
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, children, position = 'top' }, ref) => {
    const [show, setShow] = useState(false)

    return (
      <div
        ref={ref}
        className="relative inline-flex"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      >
        {children}
        <AnimatePresence>
          {show && (
            <motion.div
              initial={{ opacity: 0, y: position === 'top' ? 4 : -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: position === 'top' ? 4 : -4 }}
              transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              className={tooltipBubble({ position })}
              role="tooltip"
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)
Tooltip.displayName = 'Tooltip'

export { Tooltip }
