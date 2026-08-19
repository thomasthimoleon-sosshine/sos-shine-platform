import Scene from "@/components/royaume/Scene";
import Reveal from "@/components/royaume/Reveal";
import DoorButton from "@/components/royaume/DoorButton";
import { BRAND, ROUTES } from "@/lib/royaume/brand";

/**
 * Landing immersive.
 *
 * La page ne « présente » rien : elle fait descendre. Le décor (Scene) est
 * fixe et se transforme au scroll — nuit, braise, première lumière — pendant
 * que le texte, lui, passe devant. On n’arrive aux deux portes qu’après avoir
 * traversé le noir. C’est volontaire : le seuil se mérite par la descente.
 */
export default function RoyaumeLanding() {
  return (
    <main className="relative">
      <Scene />

      <div className="relative z-10">
        {/* ═══════════════ HERO ═══════════════ */}
        <section className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
          <Reveal>
            <p className="rm-kicker">{BRAND.name}</p>
          </Reveal>

          <Reveal delay={0.25}>
            <h1 className="rm-display mt-10 max-w-[16ch]">
              L’expérience de ta vie
              <br />
              ne frappera pas.
            </h1>
          </Reveal>

          <Reveal delay={0.45}>
            {/* La seconde ligne de l’accroche : plus petite, plus basse,
                elle se dit à voix plus faible que la première. */}
            <p className="rm-whisper rm-gold-text mt-7 text-[clamp(1.5rem,3.3vw,2.5rem)] leading-tight">
              Elle entrera — si la place est faite.
            </p>
          </Reveal>

          <Reveal delay={0.7}>
            <p className="rm-prose mx-auto mt-14 max-w-[46ch] text-balance">
              Un travail intérieur, lent et brut, pour devenir capable de
              recevoir ce qui vient — et de l’habiter jusqu’au bout.
            </p>
          </Reveal>

          <Reveal delay={1}>
            <div className="mt-20 flex flex-col items-center gap-4">
              <span className="text-[0.6rem] uppercase tracking-[0.42em] text-[var(--rm-text-mute)]">
                Descendre
              </span>
              <span className="block h-16 w-px bg-gradient-to-b from-[var(--rm-gold-dim)] to-transparent" />
            </div>
          </Reveal>
        </section>

        {/* ═══════════════ I — LA NUIT ═══════════════ */}
        <section className="flex min-h-[100svh] items-center px-6">
          <div className="mx-auto w-full max-w-[52rem]">
            <Reveal>
              <p className="rm-kicker">I — La nuit</p>
              <hr className="rm-rule mt-6 max-w-24" />
            </Reveal>

            <Reveal delay={0.15}>
              <h2 className="rm-serif mt-12 text-[clamp(1.9rem,4.2vw,3.1rem)] max-w-[22ch]">
                Personne ne t’a jamais appris à être un lieu.
              </h2>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="rm-prose mt-10 max-w-[54ch] space-y-6">
                <p>
                  On t’a appris à séduire, à tenir, à performer. À réparer ce
                  qui grince. Personne ne t’a dit que l’amour, le vrai, la vie,
                  la vraie, ne se prennent pas : ils se reçoivent. Et que
                  recevoir demande une place vide, une place propre, une place
                  qui ne tremble pas.
                </p>
                <p>
                  Ce que tu attends depuis des années n’est peut-être pas en
                  retard. Il attend peut-être que tu sois un endroit où l’on
                  peut entrer.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════ II — LA BRAISE ═══════════════ */}
        <section className="flex min-h-[100svh] items-center px-6">
          <div className="mx-auto w-full max-w-[52rem]">
            <Reveal>
              <p className="rm-kicker">II — La braise</p>
              <hr className="rm-rule mt-6 max-w-24" />
            </Reveal>

            <Reveal delay={0.15}>
              <h2 className="rm-serif mt-12 text-[clamp(1.9rem,4.2vw,3.1rem)] max-w-[24ch]">
                Rien ne s’est éteint.
                <br />
                <span className="rm-whisper">Tout s’est couvert de cendre.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="rm-prose mt-10 max-w-[54ch] space-y-6">
                <p>
                  Ici, on ne rallume pas un feu : on écarte la cendre. Ce n’est
                  ni doux ni rapide. On regarde ce qu’on évite, on nomme ce
                  qu’on tait, on rend au corps le droit de désirer.
                </p>
                <p>
                  Deux chemins descendent dans la même vallée. Tu ne les prends
                  pas dans le même état, et ils ne te demandent pas la même
                  chose.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════ LES DEUX PORTES ═══════════════ */}
        <section className="flex min-h-[100svh] items-center px-6 py-28">
          <div className="mx-auto w-full max-w-[62rem]">
            <Reveal>
              <p className="rm-kicker text-center">Le seuil</p>
              <h2 className="rm-serif mt-8 text-center text-[clamp(1.7rem,3.6vw,2.6rem)]">
                Deux façons d’entrer.
              </h2>
            </Reveal>

            <div className="mt-16 grid gap-6 md:grid-cols-2 md:gap-8">
              <Reveal delay={0.2}>
                <DoorButton
                  href={ROUTES.solo}
                  numeral="I — Seul·e"
                  label="Entrer seul·e"
                  whisper="Préparer le terrain de l’expérience de ma vie."
                  variant="solo"
                />
              </Reveal>

              <Reveal delay={0.38}>
                <DoorButton
                  href={ROUTES.duo}
                  numeral="II — À deux"
                  label="Entrer à deux"
                  whisper="Se redécouvrir, pour retomber amoureux."
                  variant="duo"
                />
              </Reveal>
            </div>

            <Reveal delay={0.6}>
              <p className="rm-whisper mx-auto mt-14 max-w-[40ch] text-center text-[0.95rem] leading-relaxed">
                À deux, chacun répond seul, sur son propre compte. Rien n’est
                partagé avant que les deux aient fini.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════ III — LA LUMIÈRE ═══════════════ */}
        <section className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
          <Reveal>
            <p className="rm-kicker">III — Ce qui vient</p>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="rm-serif mt-12 max-w-[20ch] text-[clamp(2rem,5vw,3.4rem)]">
              {BRAND.baseline}
            </p>
          </Reveal>

          <Reveal delay={0.45}>
            <hr className="rm-rule mt-16 w-40" />
            <p className="mt-10 text-[0.62rem] uppercase tracking-[0.4em] text-[var(--rm-text-mute)]">
              {BRAND.name}
            </p>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
