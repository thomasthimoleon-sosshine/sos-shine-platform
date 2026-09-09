'use client'

import { motion } from 'framer-motion'

export default function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.5, duration: 1 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
    >
      <span className="text-[10px] uppercase tracking-[0.3em] text-[#FAFAF7]/20 font-light">
        Scroll
      </span>
      <motion.div
        className="w-px h-12 bg-gradient-to-b from-[#FAFAF7]/30 to-transparent origin-top"
        animate={{ scaleY: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  )
}
