import type { Metadata } from 'next'
import QuestionnaireClient from './QuestionnaireClient'
import { getPalier, type PalierId } from '@/lib/sosmeet/paliers'

export const metadata: Metadata = {
  title: 'Mon profil de compatibilité — SOS Meet',
  description: 'Le questionnaire de compatibilité SOS Meet.',
  robots: { index: false, follow: false },
}

/** `?palier=lien|vie|intime` — sans paramètre, on commence par l'Essentiel. */
export default async function QuestionnairePage({
  searchParams,
}: {
  searchParams: Promise<{ palier?: string }>
}) {
  const { palier } = await searchParams
  const valid = palier && getPalier(palier) ? (palier as PalierId) : 'essentiel'
  return <QuestionnaireClient palier={valid} />
}
