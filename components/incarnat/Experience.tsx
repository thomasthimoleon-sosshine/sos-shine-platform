'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import HeroScene from './scenes/HeroScene'
import { incarnatState } from './hooks/incarnatState'

// La scène WebGL plein écran, permanente, en fond de toute l'expérience.
export default function Experience() {
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    setMobile(window.matchMedia('(max-width: 820px)').matches)
    // silence visuel, puis la présence apparaît lentement
    const t = setTimeout(() => { incarnatState.reveal = 1; incarnatState.ready = true }, 700)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="incarnat-canvas">
      <Canvas
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={mobile ? [1, 1.5] : [1, 2]}
        camera={{ position: [0, 0.1, 5.4], fov: 42, near: 0.1, far: 100 }}
      >
        <Suspense fallback={null}>
          <HeroScene quality={mobile ? 'low' : 'high'} />
        </Suspense>
      </Canvas>
    </div>
  )
}
