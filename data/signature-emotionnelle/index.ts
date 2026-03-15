/**
 * ============================================================
 * SOS SHINE - DONNEES QUIZ SIGNATURE EMOTIONNELLE
 * ============================================================
 *
 * Ce dossier contient toutes les donnees de reference du quiz
 * "Signature Emotionnelle" de la plateforme SOS Shine.
 *
 * Fichiers :
 * - profils.ts              → Les 10 profils complets (archetype, essence, lumiere, ombre, protocole)
 * - quiz-questions-reponses.ts → Les 15 questions avec les 4 reponses et leur scoring
 *
 * Le quiz original utilise dans l'application se trouve dans :
 * - lib/signature-test.ts (version utilisee en production)
 */

export { PROFILS_COMPLETS, type ProfilComplet } from './profils';
export { QUIZ_COMPLET, type QuestionQuiz, type ReponseQuiz } from './quiz-questions-reponses';
