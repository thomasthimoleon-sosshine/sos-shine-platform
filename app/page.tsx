"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-[#0A0A0A] text-[#F5F5F5] min-h-screen px-6 md:px-20 py-32">

      <div className="max-w-3xl mx-auto space-y-24">

        {/* INTRO */}
        <section className="space-y-10">
          <p className="text-lg leading-relaxed text-[#BDBDBD]">
            Ce texte n’est pas une publicité.
          </p>

          <h1 className="text-4xl md:text-6xl font-light leading-tight">
            C’est une lettre pour ceux qui tiennent encore debout
            sans savoir pourquoi.
          </h1>

          <p className="text-xl text-[#BDBDBD] leading-relaxed">
            Il y a des matins où le réveil sonne,
            et votre première pensée n’est pas “quelle belle journée”.
            <br /><br />
            C’est un poids.
          </p>
        </section>

        {/* NON */}
        <section className="space-y-10">
          <h2 className="text-5xl md:text-7xl text-[#D4AF37] font-light">
            Non.
          </h2>

          <p className="text-xl leading-relaxed text-[#BDBDBD]">
            Ce n’est pas vrai que vous êtes faible.
            Ce n’est pas vrai que vous êtes cassé.
            Ce n’est pas vrai que vous êtes trop.
          </p>
        </section>

        {/* BESOINS */}
        <section className="space-y-12">
          <h3 className="text-3xl text-[#D4AF37] font-light">
            Vous avez simplement besoin de trois choses :
          </h3>

          <div className="space-y-10 text-lg text-[#BDBDBD] leading-relaxed">
            <p>
              1 — Un geste doux pour votre corps.
            </p>

            <p>
              2 — Un espace sûr pour vos émotions.
            </p>

            <p>
              3 — Un premier pas concret vers demain.
            </p>
          </div>
        </section>

        {/* SANCTUAIRE */}
        <section className="space-y-10">
          <h3 className="text-4xl font-light">
            Ce que vous cherchez n’est pas un programme.
          </h3>

          <p className="text-xl text-[#BDBDBD] leading-relaxed">
            Pas un coach.
            <br />
            Pas une méthode miracle.
          </p>

          <p className="text-3xl text-[#D4AF37] font-light">
            Un sanctuaire.
          </p>
        </section>

        {/* CTA FINAL */}
        <section className="pt-20 border-t border-[#222] space-y-10">
          <p className="text-xl text-[#BDBDBD] leading-relaxed">
            Si ce texte vous a parlé,
            alors vous êtes déjà au bon endroit.
          </p>

          <Link href="/signup">
            <button className="px-10 py-4 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-500 rounded-full tracking-wide">
              Entrer dans le sanctuaire
            </button>
          </Link>

          <div className="pt-6">
            <Link href="/login" className="text-sm text-[#777] hover:text-[#D4AF37] transition">
              Déjà membre ? Se connecter
            </Link>
          </div>
        </section>

      </div>

    </main>
  );
}
