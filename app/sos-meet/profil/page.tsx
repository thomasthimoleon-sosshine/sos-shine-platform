import type { Metadata } from 'next'
import ProfilClient from './ProfilClient'

export const metadata: Metadata = {
  title: 'Mon profil de compatibilité, SOS Meet',
  description: 'Créez votre profil de compatibilité SOS Meet.',
  robots: { index: false, follow: false },
}

export default function ProfilPage() {
  return <ProfilClient />
}
