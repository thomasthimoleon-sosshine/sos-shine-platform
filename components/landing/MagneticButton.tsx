'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface MagneticButtonProps {
  href: string
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'ghost'
}

export default function MagneticButton({ href, children, className = '', variant = 'primary' }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  function handleMouse(e: React.MouseEvent) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setPosition({ x: x * 0.3, y: y * 0.3 })
  }

  function handleLeave() {
    setPosition({ x: 0, y: 0 })
  }

  const baseStyles = variant === 'primary'
    ? 'bg-[#FAFAF7] text-[#0A0A0F] font-medium'
    : 'bg-transparent text-[#FAFAF7]/60 border border-[#FAFAF7]/10 font-light'

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, mass: 0.5 }}
      className="inline-block"
    >
      <Link
        href={href}
        className={`relative inline-flex items-center gap-3 px-8 py-4 rounded-full text-[14px] tracking-[0.02em] transition-all duration-500 overflow-hidden group ${baseStyles} ${className}`}
      >
        <span className="relative z-10">{children}</span>
        {variant === 'primary' && (
          <motion.div
            className="absolute inset-0 bg-[#D4AF7F]"
            initial={{ x: '-100%' }}
            whileHover={{ x: '0%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
        {variant === 'primary' && (
          <span className="relative z-10 w-5 h-5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1">
              <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </Link>
    </motion.div>
  )
}
