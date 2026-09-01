'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { incarnatState, damp } from './hooks/incarnatState'
import * as THREE from 'three'

// Le scroll n'est pas un défilement : c'est une avancée physique de la caméra
// dans l'univers. La souris n'ajoute qu'une parallaxe infime (présence, pas gadget).
export default function CameraRig() {
  const { camera } = useThree()
  const target = new THREE.Vector3(0, 0, 0)

  useFrame((_, dt) => {
    const p = incarnatState.progress

    // Dolly : loin dans le noir (z=5.4) → on pénètre vers la matière (z≈1.2)
    const z = 5.4 - p * 4.2
    // léger décentrage vertical au fil de la traversée
    const y = 0.1 + Math.sin(p * Math.PI) * 0.15

    // parallaxe souris — amplitude volontairement minuscule
    const px = incarnatState.mouseX * 0.35
    const py = incarnatState.mouseY * 0.25

    camera.position.x = damp(camera.position.x, px, 2.2, dt)
    camera.position.y = damp(camera.position.y, y + py, 2.2, dt)
    camera.position.z = damp(camera.position.z, z, 2.6, dt)

    // la caméra garde la présence au centre, avec un très léger retard
    target.set(px * 0.3, py * 0.2, 0)
    camera.lookAt(target)
  })

  return null
}
