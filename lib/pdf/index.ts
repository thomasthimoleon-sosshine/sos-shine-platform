/**
 * SOS Shine - Librairie PDF
 *
 * Génération de documents PDF avec le branding SOS Shine :
 *   - Factures / reçus d'abonnement
 *   - Rapports d'affiliation
 *   - Export du journal intime
 *   - Certificats (événements, parcours, signature émotionnelle)
 *
 * @example
 *   import { generateInvoicePDF } from '@/lib/pdf'
 *   const pdfBytes = await generateInvoicePDF({ ... })
 */

// Core utilities
export {
  COLORS,
  PAGE,
  CONTENT_WIDTH,
  createDocument,
  addPage,
  drawHeader,
  drawFooter,
  drawWrappedText,
  drawSeparator,
  drawKeyValue,
  drawBadge,
  formatDateFR,
  formatEUR,
  needsNewPage,
} from './core'
export type { PDFContext } from './core'

// Invoice / Receipt
export { generateInvoicePDF } from './invoice'
export type { InvoiceData, InvoiceItem } from './invoice'

// Affiliation Report
export { generateAffiliationReportPDF } from './affiliation'
export type { AffiliationReportData, AffiliationConversion, AffiliationWithdrawal } from './affiliation'

// Journal Export
export { generateJournalPDF } from './journal'
export type { JournalExportData, JournalEntry } from './journal'

// Certificate
export { generateCertificatePDF } from './certificate'
export type { CertificateData } from './certificate'
