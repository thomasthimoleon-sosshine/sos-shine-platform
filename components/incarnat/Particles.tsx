'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { incarnatState, damp } from './hooks/incarnatState'

// Poussière / micro-particules flottant dans la profondeur. Pas décoratif :
// elles donnent l'échelle et l'air de l'espace, et dérivent avec la caméra.
export default function Particles({ count = 900 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)
  const mat = useRef<THREE.PointsMaterial>(null)

  const { geometry } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // réparties dans un volume profond autour de l'axe de la caméra
      const r = 2 + Math.random() * 9
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 10
      positions[i * 3] = Math.cos(theta) * r
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = -Math.random() * 16 + 2
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return { geometry: g }
  }, [count])

  useFrame((state, dt) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = t * 0.01
    // dérive verticale imperceptible + réaction infime à la souris
    ref.current.position.y = damp(ref.current.position.y, incarnatState.mouseY * 0.3, 1.2, dt)
    ref.current.position.x = damp(ref.current.position.x, incarnatState.mouseX * -0.3, 1.2, dt)
    if (mat.current) mat.current.opacity = 0.28 * incarnatState.reveal + incarnatState.progress * 0.12
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        ref={mat}
        size={0.014}
        color={'#E8DCCB'}
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
