'use client'

import { useEffect, useRef } from 'react'

// Curseur minimal : un point + un anneau fin en léger retard. Aucun cliché.
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    let mx = innerWidth / 2, my = innerHeight / 2
    let rx = mx, ry = my
    let raf = 0
    const move = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY
      if (dot.current) dot.current.style.transform = `translate(${mx}px,${my}px)`
    }
    const tick = () => {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px)`
      raf = requestAnimationFrame(tick)
    }
    addEventListener('pointermove', move, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => { removeEventListener('pointermove', move); cancelAnimationFrame(raf) }
  }, [])

  return (
    <>
      <div ref={ring} className="i-cursor-ring" />
      <div ref={dot} className="i-cursor-dot" />
    </>
  )
}
