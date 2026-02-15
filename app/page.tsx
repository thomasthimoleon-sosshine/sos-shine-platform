"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] relative overflow-hidden">

      {/* HEADER */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-6 z-50">
        <div className="text-xl font-light tracking-widest text-[#D4AF37]">
          SOS Shine
        </div>

        <div className="flex gap-4">
          <Link href="/login">
            <button className="px-5 py-2 text-sm border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-300 rounded-full">
              Se connecter
            </button>
          </Link>

          <Link href="/signup">
            <button className="px-5 py-2 text-sm bg-[#D4AF37] text-black hover:opacity-80 transition-all duration-300 rounded-full">
              Rejoindre
            </button>
          </Link>
        </div>
      </header>

      {/* CONTENU CENTRAL */}
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">

        {!showContent && (
          <div className="animate-fade flex flex-col items-center">
            <Image
              src="/logo.png"
              alt="SOS Shine"
              width={260}
              height={260}
              className="animate-pulse-slow"
            />
          </div>
        )}

        {showContent && (
          <div className="max-w-3xl space-y-10 animate-fade-in">

            <h1 className="text-4xl md:text-6xl font-light leading-tight">
              Ce n’est pas une plateforme.
              <br />
              C’est un sanctuaire.
            </h1>

            <p className="text-xl text-[#BDBDBD] leading-relaxed">
              Un espace pour transformer la douleur en lumière.
              <br />
              Pour accueillir. Apaiser. Élever.
            </p>

            <p className="text-lg text-[#D4AF37] uppercase tracking-widest">
              Apaiser · Mouvement · Clarté
            </p>

            <Link href="/signup">
              <button className="mt-8 px-10 py-4 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-500 rounded-full tracking-wide">
                Entrer dans le sanctuaire
              </button>
            </Link>

          </div>
        )}

      </div>
    </main>
  );
}
