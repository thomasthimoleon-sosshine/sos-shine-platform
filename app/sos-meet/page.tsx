import type { Metadata } from 'next'
import SosMeetClient from './SosMeetClient'

const DESC =
  "SOS Meet, l'app de rencontres conscientes pour celles et ceux qui ont déjà commencé le chemin. Slow dating, profondeur spirituelle, zéro superficialité. Rejoignez la liste d'attente."

export const metadata: Metadata = {
  title: 'SOS Meet, Rencontres conscientes pour personnes éveillées',
  description: DESC,
  openGraph: {
    title: 'SOS Meet, Rencontres conscientes',
    description: DESC,
    type: 'website',
    locale: 'fr_FR',
    siteName: 'SOS Meet',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SOS Meet, Rencontres conscientes',
    description: DESC,
  },
  alternates: { canonical: '/sos-meet' },
}

export default function SosMeetPage() {
  return <SosMeetClient />
}
