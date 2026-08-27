import type { Metadata } from 'next'
import DuoClient from './DuoClient'

export const metadata: Metadata = {
  title: 'Notre duo — SOS Meet',
  description: 'Créer ou rejoindre votre duo.',
  robots: { index: false, follow: false },
}

export default async function DuoPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams
  return <DuoClient initialCode={code || ''} />
}
