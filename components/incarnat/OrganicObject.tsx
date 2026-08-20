'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { organicVertexShader, organicFragmentShader } from './shaders/organicShader'
import { incarnatState, damp } from './hooks/incarnatState'

// La présence. Une forme organique ambiguë qui respire dans le noir.
export default function OrganicObject({ detail = 128 }: { detail?: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const mesh = useRef<THREE.Mesh>(null)

  const geometry = useMemo(() => {
    // sphère très subdivisée → surface lisse à déformer par le bruit
    const g = new THREE.IcosahedronGeometry(1, detail > 96 ? 64 : 24)
    return g
  }, [detail])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uReveal: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorDeep: { value: new THREE.Color('#2E0710') },
      uColorFlesh: { value: new THREE.Color('#B24657') },
      uColorGlow: { value: new THREE.Color('#D2536A') },
      uLightDir: { value: new THREE.Vector3(-0.7, 0.35, 0.6).normalize() },
    }),
    [],
  )

  useFrame((_, dt) => {
    if (!mat.current || !mesh.current) return
    const u = mat.current.uniforms
    u.uTime.value += dt
    u.uScroll.value = damp(u.uScroll.value, incarnatState.progress, 3, dt)
    u.uReveal.value = damp(u.uReveal.value, incarnatState.reveal, 1.6, dt)
    u.uMouse.value.x = damp(u.uMouse.value.x, incarnatState.mouseX, 2, dt)
    u.uMouse.value.y = damp(u.uMouse.value.y, incarnatState.mouseY, 2, dt)
    // rotation extrêmement lente + inclinaison qui suit à peine la souris
    mesh.current.rotation.y += dt * 0.04
    mesh.current.rotation.x = damp(mesh.current.rotation.x, incarnatState.mouseY * 0.12, 2, dt)
    mesh.current.rotation.z = damp(mesh.current.rotation.z, incarnatState.mouseX * -0.1, 2, dt)
  })

  return (
    <mesh ref={mesh} geometry={geometry}>
      <shaderMaterial
        ref={mat}
        vertexShader={organicVertexShader}
        fragmentShader={organicFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}
