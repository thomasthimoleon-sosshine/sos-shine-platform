import Test5QClient from '@/app/test/Test5QClient'

// Le test « Signature Émotionnelle » sert désormais le parcours 5 questions
// (spec 500 abonnés). L'ancien Bilan 15 questions (components/quiz-v2/
// BilanExperience) reste dans le code mais n'est plus monté ici : il est en
// pause, pas supprimé.
export default function SignatureEmotionnellePage() {
  return <Test5QClient />
}
