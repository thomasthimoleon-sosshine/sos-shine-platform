'use client'

import OrganicObject from '../OrganicObject'
import Particles from '../Particles'
import Lighting from '../Lighting'
import CameraRig from '../CameraRig'

// Acte I → début Chapitre 01 : la présence dans le noir, puis l'avancée.
export default function HeroScene({ quality = 'high' }: { quality?: 'high' | 'low' }) {
  return (
    <>
      <color attach="background" args={['#05040A']} />
      <fog attach="fog" args={['#05040A', 3.5, 11]} />
      <CameraRig />
      <Lighting />
      <OrganicObject detail={quality === 'high' ? 128 : 48} />
      <Particles count={quality === 'high' ? 900 : 320} />
    </>
  )
}
