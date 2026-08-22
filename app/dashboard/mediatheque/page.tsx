'use client'

import Link from 'next/link'

// La Médiathèque : un seul endroit qui regroupe tous les contenus à regarder,
// écouter et lire. Chaque carte mène à sa section.
const SECTIONS = [
  {
    href: '/dashboard/shine-tv',
    title: 'Vidéos',
    desc: 'Séances et coachings en vidéo.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/shine-shorts',
    title: 'Shorts',
    desc: 'De courtes vidéos, à regarder en quelques minutes.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/shine-audible',
    title: 'Audios',
    desc: 'Méditations et séances à écouter, les yeux fermés.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/shine-librairie',
    title: 'Lectures',
    desc: 'Des livres et textes à lire à votre rythme.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    href: '/dashboard/blog',
    title: 'Articles',
    desc: 'Des articles pour comprendre et avancer.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    ),
  },
]

export default function MediathequePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Médiathèque
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Tout à regarder, écouter et lire, au même endroit.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex items-start gap-4 p-5 rounded-2xl transition-all hover:-translate-y-0.5"
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border)',
            }}
          >
            <span
              className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl transition-colors"
              style={{ background: 'var(--brand-alpha-medium)', color: 'var(--brand)' }}
            >
              {s.icon}
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>
                {s.title}
              </span>
              <span className="block text-[13px] leading-relaxed mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {s.desc}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
