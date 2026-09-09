import type { Metadata } from 'next'
import CoupleQuestionnaireClient from './CoupleQuestionnaireClient'

export const metadata: Metadata = {
  title: 'Notre questionnaire, SOS Meet',
  description: 'Le questionnaire du parcours « Se retrouver ».',
  robots: { index: false, follow: false },
}

export default function CoupleQuestionnairePage() {
  return <CoupleQuestionnaireClient />
}
