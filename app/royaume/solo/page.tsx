import AmbientBackdrop from "@/components/royaume/AmbientBackdrop";
import QuestionnaireRunner from "@/components/royaume/QuestionnaireRunner";
import Threshold from "@/components/royaume/Threshold";
import { ROUTES, STORAGE_KEYS } from "@/lib/royaume/brand";
import { SOLO_ORDER, SOLO_QUESTIONS, SOLO_THEMES } from "@/lib/royaume/solo-questions";

export const metadata = {
  title: "Seul·e — Préparer le terrain",
};

export default function SoloPage() {
  return (
    <main className="relative">
      <AmbientBackdrop />

      <Threshold
        numeral="Parcours I — Seul·e"
        title="Préparer le terrain."
        lines={[
          "Sept chapitres, vingt-deux questions. Compte une heure, et ne la fais pas en une fois si tu n’en as pas envie.",
          "Chaque question arrive avec une histoire. Lis-la. C’est elle qui fait descendre.",
          "Il n’y a pas de bonne réponse, et rien ici n’est comparé à personne.",
          "Ce que tu écris reste sur cet appareil. Rien n’est envoyé nulle part.",
          "Tu peux t’arrêter à tout moment : la descente reprend là où tu l’as laissée.",
        ]}
        cta="Descendre"
      >
        <QuestionnaireRunner
          themes={SOLO_THEMES}
          questions={SOLO_QUESTIONS}
          order={SOLO_ORDER}
          storageKey={STORAGE_KEYS.solo}
          doneHref={ROUTES.soloResult}
        />
      </Threshold>
    </main>
  );
}
