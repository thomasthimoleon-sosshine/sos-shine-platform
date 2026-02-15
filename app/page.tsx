"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-[#0A0A0A] text-[#F5F5F5] min-h-screen">

      {/* HERO */}
      <section className="px-6 md:px-20 py-32 max-w-6xl mx-auto">
        <div className="max-w-3xl space-y-10">

          <h1 className="text-4xl md:text-6xl font-light leading-tight">
            Vous n’êtes pas seul dans votre éveil.
          </h1>

          <p className="text-xl text-[#BDBDBD] leading-relaxed">
            Quand la conscience s’ouvre, le décalage peut grandir.
            <br /><br />
            SOS Shine est un cercle privé pour ceux qui voient plus clair,
            ressentent plus profondément,
            et refusent d’avancer seuls.
          </p>

          <div className="pt-6 space-y-4">
            <Link href="/signup">
              <button className="px-10 py-4 bg-[#D4AF37] text-black rounded-full hover:opacity-90 transition-all duration-300">
                Rejoindre le cercle
              </button>
            </Link>

            <p className="text-sm text-[#777]">
              7 jours pour ressentir — Puis 29,90€ / mois — Annulation libre
            </p>
          </div>

        </div>
      </section>

      {/* TENSION */}
      <section className="px-6 md:px-20 py-24 border-t border-[#222]">
        <div className="max-w-4xl mx-auto space-y-8">

          <h2 className="text-3xl md:text-4xl font-light">
            Plus vous voyez clair, plus vous vous sentez seul.
          </h2>

          <div className="text-lg text-[#BDBDBD] space-y-4">
            <p>Vous questionnez le monde.</p>
            <p>Vous ressentez vos blessures avec lucidité.</p>
            <p>Vous refusez de faire semblant.</p>
            <p>Mais autour de vous, peu comprennent vraiment ce que vous traversez.</p>
          </div>

        </div>
      </section>

      {/* COMMUNAUTE */}
      <section className="px-6 md:px-20 py-24 border-t border-[#222]">
        <div className="max-w-4xl mx-auto space-y-10">

          <h2 className="text-3xl md:text-4xl font-light text-[#D4AF37]">
            Ici, vous n’avez plus à vous expliquer.
          </h2>

          <div className="grid md:grid-cols-2 gap-10 text-lg text-[#BDBDBD]">

            <div>
              <p className="font-medium text-white mb-2">Espaces par douleur</p>
              <p>Abandon, solitude, deuil, séparation… Des salons dédiés pour échanger en profondeur.</p>
            </div>

            <div>
              <p className="font-medium text-white mb-2">Échanges humains</p>
              <p>Des conversations authentiques avec des personnes qui vivent les mêmes prises de conscience.</p>
            </div>

            <div>
              <p className="font-medium text-white mb-2">Zoom collectifs</p>
              <p>Des rencontres en ligne pour partager, comprendre et avancer ensemble.</p>
            </div>

            <div>
              <p className="font-medium text-white mb-2">Rencontres réelles</p>
              <p>Marches, retraites, événements. L’éveil devient collectif.</p>
            </div>

          </div>

        </div>
      </section>

      {/* TRANSFORMATION */}
      <section className="px-6 md:px-20 py-24 border-t border-[#222]">
        <div className="max-w-3xl mx-auto space-y-10">

          <h2 className="text-3xl md:text-4xl font-light">
            Ce qui change vraiment.
          </h2>

          <p className="text-lg text-[#BDBDBD] leading-relaxed">
            Vous ne vous sentez plus isolé dans votre lucidité.
            <br /><br />
            Vous devenez plus stable.
            <br />
            Plus aligné.
            <br />
            Plus courageux.
            <br /><br />
            Pas parce que tout disparaît.
            Mais parce que vous avancez entouré.
          </p>

        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 md:px-20 py-32 border-t border-[#222]">
        <div className="max-w-3xl mx-auto text-center space-y-10">

          <h2 className="text-3xl md:text-5xl font-light">
            Vous n’êtes pas en avance.
            <br />
            Vous êtes prêt.
          </h2>

          <Link href="/signup">
            <button className="px-12 py-5 bg-[#D4AF37] text-black rounded-full hover:opacity-90 transition-all duration-300 text-lg">
              Entrer dans le cercle
            </button>
          </Link>

          <p className="text-sm text-[#777]">
            7 jours pour ressentir — Puis 29,90€ / mois — Annulation libre
          </p>

          <div>
            <Link href="/login" className="text-sm text-[#777] hover:text-[#D4AF37] transition">
              Déjà membre ? Se connecter
            </Link>
          </div>

        </div>
      </section>

    </main>
  );
}
