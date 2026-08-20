'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Lumière cinématographique : une seule source latérale douce qui révèle la
// matière. Le reste reste dans l'ombre — l'obscurité fait partie de la scène.
export default function Lighting() {
  const key = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (!key.current) return
    const t = state.clock.elapsedTime
    // dérive très lente, comme une bougie lointaine
    key.current.position.x = -2.6 + Math.sin(t * 0.12) * 0.3
    key.current.position.y = 1.6 + Math.cos(t * 0.1) * 0.2
  })

  return (
    <>
      {/* ambiance basse, presque nulle : on ne veut pas tout éclairer */}
      <ambientLight intensity={0.06} color={'#2E0710'} />
      {/* la source principale, latérale, chaude */}
      <pointLight ref={key} position={[-2.6, 1.6, 1.4]} intensity={7} color={'#D2536A'} distance={12} decay={2} />
      {/* contre-jour très faible pour détacher la silhouette du noir */}
      <pointLight position={[2.2, -0.6, -2.4]} intensity={2.2} color={'#7E1027'} distance={10} decay={2} />
    </>
  )
}
