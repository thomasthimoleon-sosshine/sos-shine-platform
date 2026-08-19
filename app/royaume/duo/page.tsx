import Link from "next/link";
import AmbientBackdrop from "@/components/royaume/AmbientBackdrop";
import Reveal from "@/components/royaume/Reveal";
import { ROUTES } from "@/lib/royaume/brand";
import { DUO_THEMES } from "@/lib/royaume/duo-questions";

export const metadata = {
  title: "À deux — Se redécouvrir",
};

/**
 * Le seuil du parcours Couple.
 *
 * Ici, la règle prime sur le contenu : chacun répond seul, sur son
 * propre compte, et rien ne s’ouvre avant que les deux aient fini.
 * Cette page énonce le pacte avant de demander quoi que ce soit —
 * c’est la condition qui rend les réponses honnêtes.
 */
export default function DuoPage() {
  return (
    <main className="relative">
      <AmbientBackdrop />

      <div className="relative z-10 px-6 py-32">
        <div className="mx-auto w-full max-w-[46rem]">
          <Reveal>
            <p className="rm-kicker">Parcours II — À deux</p>
            <h1 className="rm-serif mt-6 text-[clamp(2rem,5vw,3.2rem)] max-w-[16ch]">
              Se redécouvrir.
            </h1>
            <p className="rm-prose mt-8 max-w-[48ch]">
              On ne retombe pas amoureux de l’autre. On redevient quelqu’un dont
              on peut tomber amoureux. Ce parcours ne répare pas un couple : il
              rend à chacun ce qu’il a rangé.
            </p>
          </Reveal>

          {/* ── Le pacte ── */}
          <Reveal delay={0.2}>
            <section className="mt-20">
              <hr className="rm-rule max-w-28" />
              <p className="rm-kicker mt-10">Le pacte</p>

              <ul className="mt-8 space-y-5">
                {[
                  "Chacun répond seul, sur son propre compte. Jamais côte à côte, jamais sur le même téléphone.",
                  "Aucune réponse n’est visible avant que les deux aient terminé. Ni un aperçu, ni un pourcentage, ni un indice.",
                  "Vingt questions, cinq chapitres. Comptez quarante minutes chacun, quand vous êtes seul et au calme.",
                  "À la fin, la lecture s’ouvre en même temps pour les deux. Elle ne désigne personne : elle montre des écarts.",
                  "Ce qui est écrit ne peut plus être retiré. Écrivez en le sachant, et écrivez vrai quand même.",
                ].map((line, i) => (
                  <li key={i} className="rm-prose flex gap-4 text-[0.98rem]">
                    <span className="mt-[0.7em] h-px w-6 shrink-0 bg-[var(--rm-gold-dim)]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          {/* ── Les cinq chapitres ── */}
          <Reveal delay={0.3}>
            <section className="mt-24">
              <hr className="rm-rule max-w-28" />
              <p className="rm-kicker mt-10">La traversée</p>

              <div className="mt-10 space-y-8">
                {DUO_THEMES.map((theme) => (
                  <div key={theme.id}>
                    <p className="rm-serif text-[1.45rem]">
                      <span className="rm-gold-text mr-4 text-[0.8em]">
                        {theme.numeral}
                      </span>
                      {theme.title}
                    </p>
                    <p className="rm-whisper mt-2 text-[1rem] leading-relaxed">
                      {theme.epigraph}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          {/* ── L’entrée ── */}
          <Reveal delay={0.4}>
            <section className="mt-24">
              <hr className="rm-rule max-w-28" />
              <p className="rm-kicker mt-10">Ouvrir le lien</p>
              <p className="rm-prose mt-6 max-w-[46ch]">
                Le parcours à deux demande un compte pour chacun : c’est ce qui
                garantit que personne ne lit avant l’heure. L’un ouvre le lien et
                reçoit un code ; l’autre le rejoint avec ce code.
              </p>

              <div className="mt-12 flex flex-wrap items-center gap-8">
                <Link
                  href="/login"
                  className="group flex items-center gap-4 text-[0.66rem] uppercase tracking-[0.36em] text-[var(--rm-gold-dim)] transition-colors duration-700 hover:text-[var(--rm-gold-soft)]"
                >
                  Entrer avec mon compte
                  <span className="h-px w-10 bg-current transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-20" />
                </Link>

                <Link
                  href={ROUTES.solo}
                  className="text-[0.62rem] uppercase tracking-[0.34em] text-[var(--rm-text-mute)] transition-colors duration-700 hover:text-[var(--rm-text-soft)]"
                >
                  Commencer seul·e d’abord
                </Link>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <div className="mt-28 flex flex-col items-center gap-8 text-center">
              <hr className="rm-rule w-40" />
              <Link
                href={ROUTES.home}
                className="text-[0.62rem] uppercase tracking-[0.36em] text-[var(--rm-text-mute)] transition-colors duration-700 hover:text-[var(--rm-gold-soft)]"
              >
                Revenir au seuil
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
