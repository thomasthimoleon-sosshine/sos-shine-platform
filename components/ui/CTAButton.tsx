'use client'

import { ReactNode, ButtonHTMLAttributes } from 'react'

interface CTAButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'outline' | 'accent'
  fullWidth?: boolean
  size?: 'md' | 'lg'
}

export function CTAButton({
  children,
  variant = 'primary',
  fullWidth,
  size = 'md',
  className = '',
  ...props
}: CTAButtonProps) {
  return (
    <button
      className={[
        'rounded-full font-medium tracking-wide transition-all duration-300 cursor-pointer',
        variant === 'primary' && 'cta-glow',
        fullWidth && 'w-full',
        size === 'lg' ? 'px-12 py-5 text-lg' : 'px-8 py-4 text-base',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
