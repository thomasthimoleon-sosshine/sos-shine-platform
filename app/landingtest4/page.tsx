import type { Metadata } from 'next'
import Landing4Client from './Landing4Client'

const DESC = "Ce test gratuit révèle la mécanique émotionnelle qui pilote tes comportements depuis des années. 3 minutes, résultat personnalisé, aucun engagement."

export const metadata: Metadata = {
  title: 'SOS Shine — Comprends enfin tes mécanismes émotionnels',
  description: DESC,
  openGraph: { title: 'SOS Shine — Comprends enfin tes mécanismes émotionnels', description: DESC, type: 'website', locale: 'fr_FR', siteName: 'SOS Shine' },
  twitter: { card: 'summary_large_image', title: 'SOS Shine', description: DESC },
}

export default function Landing4Page() {
  return <Landing4Client />
}
