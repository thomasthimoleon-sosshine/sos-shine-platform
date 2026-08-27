import type { Metadata } from 'next'
import { previewReport } from '@/lib/sosmeet/couple/preview'
import CoupleReportView from '@/components/sosmeet/CoupleReportView'

export const metadata: Metadata = {
  title: 'Démonstration de la lecture — SOS Meet',
  description: 'À quoi ressemble le livrable du parcours à deux.',
  robots: { index: false, follow: false },
}

/** Même composant d'affichage que la vraie carte : la démo ne peut pas mentir. */
export default function ApercuPage() {
  return <CoupleReportView report={previewReport()} prenomA="Camille" prenomB="Alex" demo />
}
