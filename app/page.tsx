export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-100 via-white to-amber-50 text-zinc-800">
      
      {/* HEADER */}
      <header className="w-full py-6 px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">SOS Shine</h1>
        <button className="px-6 py-2 rounded-full bg-violet-600 text-white hover:bg-violet-700 transition">
          Se connecter
        </button>
      </header>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20">
        <h2 className="text-4xl md:text-5xl font-bold max-w-3xl leading-tight">
          Un sanctuaire digital pour transformer vos douleurs en lumière.
        </h2>

        <p className="mt-6 max-w-2xl text-lg text-zinc-600">
          SOS Shine est une plateforme immersive dédiée à l’apaisement,
          au mouvement et à la clarté intérieure.
        </p>

        <button className="mt-8 px-8 py-4 rounded-full bg-amber-500 text-white font-semibold hover:bg-amber-600 transition">
          Entrer dans le sanctuaire
        </button>
      </section>

      {/* RAYONS */}
      <section className="grid md:grid-cols-3 gap-8 px-8 pb-20 max-w-6xl mx-auto">
        
        <div className="p-8 rounded-2xl bg-white shadow-md hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-4">Apaiser</h3>
          <p className="text-zinc-600">
            Calmer l’émotion, accueillir la douleur, respirer.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white shadow-md hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-4">Mouvement</h3>
          <p className="text-zinc-600">
            Transformer l’énergie bloquée en action consciente.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white shadow-md hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-4">Clarté</h3>
          <p className="text-zinc-600">
            Comprendre, intégrer et évoluer vers sa lumière.
          </p>
        </div>

      </section>

      {/* FOOTER */}
      <footer className="text-center py-8 text-sm text-zinc-500">
        © {new Date().getFullYear()} SOS Shine — Tous droits réservés
      </footer>

    </main>
  );
}
