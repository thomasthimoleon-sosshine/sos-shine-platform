'use client'

import React, { useState } from 'react'
import { cva } from 'class-variance-authority'

const tooltipBubble = cva(
  [
    'absolute left-1/2 -translate-x-1/2',
    'px-3 py-1.5 rounded-[var(--radius-md)]',
    'text-sm whitespace-nowrap pointer-events-none',
    'bg-[rgba(255,255,255,0.1)]',
    'border border-[var(--border)]',
    'text-[var(--text-primary)]',
    'backdrop-blur-xl',
    'z-[200]',
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
        {show && (
          <div className={tooltipBubble({ position })} role="tooltip">
            {content}
          </div>
        )}
      </div>
    )
  }
)
Tooltip.displayName = 'Tooltip'

export { Tooltip }
