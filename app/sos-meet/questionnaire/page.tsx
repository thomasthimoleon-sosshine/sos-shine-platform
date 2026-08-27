import type { Metadata } from 'next'
import QuestionnaireClient from './QuestionnaireClient'

export const metadata: Metadata = {
  title: 'Mon profil de compatibilité — SOS Meet',
  description: 'Le questionnaire de compatibilité SOS Meet.',
  robots: { index: false, follow: false },
}

export default function QuestionnairePage() {
  return <QuestionnaireClient />
}
