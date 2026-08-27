import type { Metadata } from 'next'
import DecouverteClient from './DecouverteClient'

export const metadata: Metadata = {
  title: 'Découverte — SOS Meet',
  description: 'Vos compatibilités, en conscience.',
  robots: { index: false, follow: false },
}

export default function DecouvertePage() {
  return <DecouverteClient />
}
