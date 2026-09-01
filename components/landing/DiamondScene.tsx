'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Diamond({ scroll }: { scroll: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.OctahedronGeometry(1.4, 0)
    geo.computeVertexNormals()
    return geo
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime

    meshRef.current.rotation.y = t * 0.15 + scroll * 2
    meshRef.current.rotation.x = Math.sin(t * 0.1) * 0.1 + scroll * 0.5
    meshRef.current.scale.setScalar(0.6 + scroll * 0.8 + Math.sin(t * 0.5) * 0.02)

    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(t * 0.3) * 3
      lightRef.current.position.y = Math.cos(t * 0.2) * 2 + 1
    }
  })

  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh ref={meshRef} geometry={geometry}>
          <MeshTransmissionMaterial
            backside
            samples={8}
            thickness={0.4}
            chromaticAberration={0.15}
            anisotropy={0.3}
            distortion={0.2}
            distortionScale={0.3}
            temporalDistortion={0.1}
            ior={1.5}
            color="#D4C99A"
            roughness={0.05}
            transmission={0.95}
            clearcoat={1}
            clearcoatRoughness={0}
          />
        </mesh>
      </Float>

      <pointLight ref={lightRef} position={[2, 2, 4]} intensity={30} color="#7DD3FC" />
      <pointLight position={[-3, -1, 3]} intensity={20} color="#A78BFA" />
      <pointLight position={[0, 3, -2]} intensity={15} color="#FBCFE8" />
      <ambientLight intensity={0.08} />
    </group>
  )
}

export default function DiamondScene({ scrollProgress = 0 }: { scrollProgress?: number }) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Diamond scroll={scrollProgress} />
      </Canvas>
    </div>
  )
}
