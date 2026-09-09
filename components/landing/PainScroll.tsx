'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const PAINS = [
  "Tu souris. À l'intérieur, tu hurles.",
  "Tu sais. Tu n'arrives pas à faire.",
  "Tu donnes. Personne ne voit que tu meurs.",
  "Tu contrôles. Parce que lâcher, c'est tomber.",
  "Tu recommences. La même histoire. Le même mur.",
]

export default function PainScroll() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  return (
    <section ref={containerRef} className="relative" style={{ height: `${PAINS.length * 100}vh` }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {PAINS.map((pain, i) => {
          const start = i / PAINS.length
          const end = (i + 1) / PAINS.length
          const mid = (start + end) / 2

          return (
            <PainLine key={i} text={pain} progress={scrollYProgress} start={start} mid={mid} end={end} />
          )
        })}
      </div>
    </section>
  )
}

function PainLine({
  text, progress, start, mid, end
}: {
  text: string
  progress: ReturnType<typeof useScroll>['scrollYProgress']
  start: number
  mid: number
  end: number
}) {
  const opacity = useTransform(progress, [start, mid - 0.05, mid, mid + 0.05, end], [0, 1, 1, 1, 0])
  const y = useTransform(progress, [start, mid, end], [40, 0, -40])
  const scale = useTransform(progress, [start, mid, end], [0.95, 1, 0.95])

  return (
    <motion.p
      className="absolute max-w-4xl px-8 text-center font-display text-[1.6rem] sm:text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-light leading-[1.1] tracking-[-0.03em] italic text-[#FAFAF7]"
      style={{ opacity, y, scale }}
    >
      {text}
    </motion.p>
  )
}
