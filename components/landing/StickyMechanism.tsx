'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const STEPS = [
  {
    num: '01',
    title: 'Comprendre',
    body: "Identifier le schéma inconscient qui pilote tes réactions. Pas de la théorie. Une lecture précise de ce qui se joue en toi — depuis toujours.",
    accent: '#7DD3FC',
  },
  {
    num: '02',
    title: 'Libérer',
    body: "Décharger l'émotion stockée dans le corps. Protocoles de respiration ventrale, libération somatique, cris silencieux. Ce qui doit sortir sort.",
    accent: '#A78BFA',
  },
  {
    num: '03',
    title: 'Agir',
    body: "Reprogrammer l'automatisme. Miroir, ancrage, rituel du matin. Chaque jour, un nouveau réflexe remplace l'ancien. Tu ne te répares pas. Tu te révèles.",
    accent: '#FBCFE8',
  },
]

export default function StickyMechanism() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  return (
    <section ref={containerRef} className="relative" style={{ height: `${STEPS.length * 100 + 50}vh` }}>
      <div className="sticky top-0 h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full grid md:grid-cols-2 gap-16 md:gap-24 items-center">

          {/* Left — Visual */}
          <div className="relative aspect-square hidden md:flex items-center justify-center">
            {STEPS.map((step, i) => {
              const start = i / STEPS.length
              const end = (i + 1) / STEPS.length
              const mid = (start + end) / 2

              return (
                <StepOrb key={i} color={step.accent} progress={scrollYProgress} start={start} mid={mid} end={end} index={i} />
              )
            })}
          </div>

          {/* Right — Text */}
          <div className="relative h-[60vh] flex items-center">
            {STEPS.map((step, i) => {
              const start = i / STEPS.length
              const end = (i + 1) / STEPS.length
              const mid = (start + end) / 2

              return (
                <StepText key={i} step={step} progress={scrollYProgress} start={start} mid={mid} end={end} />
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function StepOrb({
  color, progress, start, mid, end, index
}: {
  color: string
  progress: ReturnType<typeof useScroll>['scrollYProgress']
  start: number; mid: number; end: number; index: number
}) {
  const opacity = useTransform(progress, [start, mid - 0.05, mid, mid + 0.05, end], [0, 0.8, 1, 0.8, 0])
  const scale = useTransform(progress, [start, mid, end], [0.5, 1, 0.5])

  const sizes = [280, 220, 260]
  const size = sizes[index]

  return (
    <motion.div
      className="absolute rounded-full blur-[80px]"
      style={{
        width: size,
        height: size,
        background: color,
        opacity,
        scale,
      }}
    />
  )
}

function StepText({
  step, progress, start, mid, end
}: {
  step: typeof STEPS[number]
  progress: ReturnType<typeof useScroll>['scrollYProgress']
  start: number; mid: number; end: number
}) {
  const opacity = useTransform(progress, [start, start + 0.08, mid, end - 0.08, end], [0, 1, 1, 1, 0])
  const y = useTransform(progress, [start, mid, end], [60, 0, -60])

  return (
    <motion.div className="absolute w-full" style={{ opacity, y }}>
      <span className="block text-[11px] uppercase tracking-[0.3em] font-medium mb-6" style={{ color: step.accent }}>
        {step.num}
      </span>
      <h3 className="font-display text-[2rem] sm:text-[2.8rem] font-light tracking-[-0.03em] text-[#FAFAF7] mb-6 leading-[1.1]">
        {step.title}
      </h3>
      <p className="text-[15px] text-[#FAFAF7]/50 leading-[1.8] font-light max-w-md">
        {step.body}
      </p>
    </motion.div>
  )
}
