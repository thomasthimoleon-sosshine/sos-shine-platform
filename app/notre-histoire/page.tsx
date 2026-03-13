'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NotreHistoirePage() {
  const [logoUrl, setLogoUrl] = useState('')
  const [gold, setGold] = useState('#D4AF37')
  const [loading, setLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [hist, setHist] = useState<Record<string, any>>({})

  const load = useCallback(async () => {
    try {
      const supabase = createClient()

      // Load histoire section
      const { data: section } = await supabase
        .from('landing_sections')
        .select('content')
        .eq('section_key', 'histoire')
        .maybeSingle()

      if (section?.content) {
        setHist(section.content)
      }

      // Get global config (logo, colors)
      const { data: globalSection } = await supabase
        .from('landing_sections')
        .select('content, styles')
        .eq('section_key', '_global')
        .maybeSingle()

      if (globalSection?.content?.logo_url) {
        setLogoUrl(globalSection.content.logo_url)
      }
      if (globalSection?.styles?.color_primary) {
        setGold(globalSection.styles.color_primary)
      }
    } catch { /* defaults */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <main className="min-h-screen" style={{ background: 'var(--dark)' }}>

      {/* ── Header / Navigation ── */}
      <div className="px-6 pt-10 pb-4 max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          Retour à l&apos;accueil
        </Link>
        {logoUrl && (
          <Link href="/"><img src={logoUrl} alt="SOS Shine" className="h-10 mt-4 rounded-lg object-cover" /></Link>
        )}
      </div>

      {/* ── L'Histoire / Le Livre ── */}
      <section className="px-6 md:px-20 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] uppercase mb-3 md:mb-4" style={{ color: 'var(--text-muted)' }}>
            {hist.label || "L'Histoire"}
          </p>
          <h1 className="font-display font-light text-center text-2xl sm:text-3xl md:text-5xl mb-6 md:mb-8" style={{ color: gold }}>
            {hist.title || "Né d'un livre, devenu une communauté"}
          </h1>

          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 mt-8 md:mt-12">
            {/* Book cover */}
            <div className="flex-shrink-0 group">
              <a href={hist.book_url || '#'} target="_blank" rel="noopener noreferrer" className="block relative">
                <div className="w-44 sm:w-56 md:w-64 rounded-lg overflow-hidden border transition-all duration-500 shadow-lg" style={{ borderColor: `${gold}33` }}>
                  <img
                    src={hist.book_image || '/images/book-cover.jpeg'}
                    alt="SOS Shine — Briller Comme un Diamant"
                    className="w-full aspect-[3/4] object-cover"
                  />
                </div>
              </a>
            </div>

            {/* Text content */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-base md:text-xl leading-relaxed mb-4 md:mb-6" style={{ color: 'var(--text-secondary)' }}>
                {hist.paragraph1 || "Tout a commencé avec un livre. Julia Laureau, thérapeute holistique, a créé \"SOS Shine — Briller Comme un Diamant\" — bien plus qu'un ouvrage de développement personnel, une véritable bible de transformation qui combine coaching vidéo, méditations guidées et séances énergétiques."}
              </p>
              <p className="text-base md:text-xl leading-relaxed mb-4 md:mb-6" style={{ color: 'var(--text-secondary)' }}>
                {hist.paragraph2 || "Ce programme interactif a déjà aidé des dizaines de personnes à se libérer de leurs blocages et à accéder à leur véritable potentiel. Face à cet élan, la plateforme SOS Shine est née — la continuité naturelle du livre, transformée en une communauté vivante d'accompagnement et de reconstruction."}
              </p>
              {(hist.quote) && (
                <p className="text-sm md:text-base leading-relaxed mb-6 md:mb-8 italic" style={{ color: 'var(--text-muted)' }}>
                  &ldquo;{hist.quote}&rdquo;
                </p>
              )}
              <a
                href={hist.book_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 border rounded-full text-xs sm:text-sm tracking-[0.15em] uppercase transition-all duration-300"
                style={{ borderColor: `${gold}66`, color: gold }}
              >
                {hist.button_label || 'Découvrir le livre'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Séparation ── */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-[1px]" style={{ background: 'var(--dark-border)' }} />
      </div>

      {/* ── Les Fondateurs / Trinité ── */}
      <section className="px-6 md:px-20 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-[10px] sm:text-xs tracking-[0.4em] sm:tracking-[0.5em] uppercase mb-3 md:mb-4" style={{ color: 'var(--text-muted)' }}>
            Notre Histoire
          </p>
          <h2 className="font-display font-light text-center text-2xl sm:text-3xl md:text-5xl mb-6 md:mb-8" style={{ color: gold }}>
            {hist.trinite_title || 'Trois forces. Une seule mission.'}
          </h2>
          <p className="text-center max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed font-light mb-12 md:mb-20" style={{ color: 'var(--text-secondary)' }}>
            {hist.trinite_intro || "Tout a commencé par un livre. Julia, portée par une conviction profonde, a écrit pour libérer ceux qui se sentaient prisonniers d\u2019eux-mêmes. Puis William et Thomas l\u2019ont rejointe. Trois visions. Trois piliers. Une trinité indissociable pour déconditionner l\u2019être humain dans sa totalité."}
          </p>

          {/* Trinity */}
          <div className="relative">
            {/* Triangle SVG décoratif */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
              <svg viewBox="0 0 400 350" className="w-[280px] h-[245px] md:w-[400px] md:h-[350px]" fill="none" stroke={gold} strokeWidth="0.5">
                <polygon points="200,20 380,330 20,330" />
                <polygon points="200,60 350,310 50,310" />
                <polygon points="200,100 320,290 80,290" />
              </svg>
            </div>

            {/* Les trois fondateurs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative z-10">

              {/* Julia — Énergie */}
              <div className="group relative">
                <div className="rounded-2xl border p-6 sm:p-8 md:p-10 text-center h-full flex flex-col items-center" style={{ borderColor: 'var(--dark-border)', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mb-5 md:mb-6 relative flex items-center justify-center">
                    <svg viewBox="0 0 60 55" className="w-full h-full" fill="none" stroke={gold} strokeWidth="1.5">
                      <polygon points="30,5 55,50 5,50" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg md:text-xl mt-1" style={{ color: gold }}>&#9829;</span>
                  </div>
                  <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-2 opacity-70" style={{ color: gold }}>Fondatrice</p>
                  <h3 className="font-display text-xl sm:text-2xl md:text-3xl mb-2" style={{ color: gold }}>Julia</h3>
                  <p className="text-[10px] sm:text-xs tracking-[0.25em] uppercase mb-4 md:mb-5" style={{ color: 'var(--text-muted)' }}>{hist.julia_pilier || 'Le Pilier Énergétique'}</p>
                  <div className="w-8 h-[1px] mx-auto mb-4 md:mb-5" style={{ background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }} />
                  <p className="text-xs sm:text-sm leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
                    {hist.julia_desc || "Auteure du livre fondateur de SOS Shine, Julia canalise l\u2019énergie invisible qui nous traverse. Sa vision : reconnecter chaque individu à sa vibration authentique, celle qu\u2019il a oubliée sous des couches de conditionnements."}
                  </p>
                </div>
              </div>

              {/* William — Corps */}
              <div className="group relative">
                <div className="rounded-2xl border p-6 sm:p-8 md:p-10 text-center h-full flex flex-col items-center" style={{ borderColor: 'var(--dark-border)', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mb-5 md:mb-6 relative flex items-center justify-center">
                    <svg viewBox="0 0 60 55" className="w-full h-full" fill="none" stroke={gold} strokeWidth="1.5">
                      <polygon points="30,5 55,50 5,50" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg md:text-xl mt-1" style={{ color: gold }}>&#9878;</span>
                  </div>
                  <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-2 opacity-70" style={{ color: gold }}>Cofondateur</p>
                  <h3 className="font-display text-xl sm:text-2xl md:text-3xl mb-2" style={{ color: gold }}>William</h3>
                  <p className="text-[10px] sm:text-xs tracking-[0.25em] uppercase mb-4 md:mb-5" style={{ color: 'var(--text-muted)' }}>{hist.william_pilier || 'Le Pilier Corporel'}</p>
                  <div className="w-8 h-[1px] mx-auto mb-4 md:mb-5" style={{ background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }} />
                  <p className="text-xs sm:text-sm leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
                    {hist.william_desc || "Spécialiste en hypnose et diplômé en médecine chinoise internationale, William apporte les solutions physiques concrètes pour déconstruire les croyances et les blocages ancrés dans le corps. Sa maîtrise du lien corps-esprit permet de libérer ce que les mots seuls ne peuvent atteindre."}
                  </p>
                </div>
              </div>

              {/* Thomas — Mental */}
              <div className="group relative">
                <div className="rounded-2xl border p-6 sm:p-8 md:p-10 text-center h-full flex flex-col items-center" style={{ borderColor: 'var(--dark-border)', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mb-5 md:mb-6 relative flex items-center justify-center">
                    <svg viewBox="0 0 60 55" className="w-full h-full" fill="none" stroke={gold} strokeWidth="1.5">
                      <polygon points="30,5 55,50 5,50" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg md:text-xl mt-1" style={{ color: gold }}>&#10023;</span>
                  </div>
                  <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-2 opacity-70" style={{ color: gold }}>Cofondateur</p>
                  <h3 className="font-display text-xl sm:text-2xl md:text-3xl mb-2" style={{ color: gold }}>Thomas</h3>
                  <p className="text-[10px] sm:text-xs tracking-[0.25em] uppercase mb-4 md:mb-5" style={{ color: 'var(--text-muted)' }}>{hist.thomas_pilier || 'Le Pilier Pratique'}</p>
                  <div className="w-8 h-[1px] mx-auto mb-4 md:mb-5" style={{ background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }} />
                  <p className="text-xs sm:text-sm leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
                    {hist.thomas_desc || "Thomas intervient sur le côté pratique et concret du déconditionnement. À travers des cahiers d\u2019exercices et des protocoles d\u2019action, il transforme la prise de conscience en résultats tangibles. Son approche : vous donner les outils pour devenir l\u2019architecte de votre propre transformation."}
                  </p>
                </div>
              </div>

            </div>

            {/* Trinity tagline */}
            <div className="mt-10 md:mt-16 text-center">
              <div className="inline-flex items-center gap-3 sm:gap-4 md:gap-6">
                <div className="w-8 sm:w-12 md:w-16 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${gold})` }} />
                <p className="text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] uppercase" style={{ color: 'var(--text-muted)' }}>
                  {hist.trinite_tagline || 'Énergie \u00b7 Corps \u00b7 Pratique'}
                </p>
                <div className="w-8 sm:w-12 md:w-16 h-[1px]" style={{ background: `linear-gradient(90deg, ${gold}, transparent)` }} />
              </div>
              <p className="max-w-2xl mx-auto mt-4 md:mt-6 text-xs sm:text-sm md:text-base leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
                {hist.trinite_conclusion || "Trois triangles à côtés égaux. Trois dimensions de l\u2019être. Un seul objectif : vous aider à devenir la personne que vous auriez toujours dû être. Le déconditionnement total commence ici."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Séparation ── */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-[1px]" style={{ background: 'var(--dark-border)' }} />
      </div>

      {/* ── Manifeste ── */}
      <section className="px-6 md:px-20 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          <blockquote className="text-center">
            <p className="font-display font-light text-lg sm:text-xl md:text-2xl lg:text-3xl italic leading-relaxed" style={{ color: gold }}>
              &ldquo;{hist.manifeste || "Nous ne guérissons pas. Nous révélons. Ce que vous cherchez est déjà en vous — enfoui sous des années de conditionnements. Notre mission est de vous aider à le retrouver."}&rdquo;
            </p>
            <footer className="mt-6 md:mt-8">
              <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--text-muted)' }}>— Julia, William & Thomas</p>
            </footer>
          </blockquote>
        </div>
      </section>

    </main>
  )
}
