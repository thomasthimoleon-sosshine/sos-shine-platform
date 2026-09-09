import Link from 'next/link'
import type { Metadata } from 'next'
import LogoSite from '@/components/LogoSite'

export const metadata: Metadata = {
  title: 'Tes cadeaux, SOS Shine',
  description:
    'Les outils offerts par Julia Laureau pendant la séquence Signature Émotionnelle. Ils sont à toi, sans condition.',
  robots: { index: false, follow: false },
}

type Gift = {
  n: string
  title: string
  line: string
  href: string | null
  meta: string
}

const GIFTS: Gift[] = [
  {
    n: '01',
    title: 'Le Déconditionnement',
    line: "Le socle entier de la méthode. D'où viennent les mécanismes que ton test a révélés, comment ils s'installent entre la conception et l'âge adulte, et pourquoi ils décident encore à ta place.",
    href: '/cadeaux/sos-shine-le-deconditionnement.pdf',
    meta: 'Ebook · 27 pages · PDF',
  },
  {
    n: '02',
    title: 'Cultiver la confiance en soi',
    line: "La confiance n'est pas une qualité qu'on aurait ou pas. C'est une trace, celle de la façon dont on t'a regardée, tenue, reprise ou ignorée. Une trace se travaille autrement qu'avec des affirmations devant un miroir.",
    href: '/cadeaux/sos-shine-cultiver-la-confiance-en-soi.pdf',
    meta: 'Ebook · 21 pages · PDF',
  },
  {
    n: '03',
    title: "Cultiver l'amour propre",
    line: "Retirer les couches ne suffit pas si, en dessous, il n'y a personne pour t'accueillir. L'amour propre, ce n'est pas se trouver géniale : c'est arrêter de te traiter comme la seule personne au monde à qui tu ne dois rien.",
    href: '/cadeaux/sos-shine-cultiver-l-amour-propre.pdf',
    meta: 'Ebook · 21 pages · PDF',
  },
  {
    n: '04',
    title: "La méditation de l'enfant intérieur",
    line: "Ce n'est pas une méditation de relaxation. C'est une rencontre. Tu vas retrouver l'enfant que tu étais quand tout s'est installé, et lui donner ce que personne ne lui a donné à ce moment-là.",
    href: null,
    meta: 'Audio guidé · en préparation',
  },
]

const BONUS: Gift = {
  n: '05',
  title: '5 minutes pour réaligner ta journée',
  line: "Un protocole court, à utiliser dès demain matin en sortant du lit, avant même d'avoir ouvert ton téléphone.",
  href: null,
  meta: 'Protocole offert · en préparation',
}

const IVORY = '#F5F1E8'
const GOLD = '#C9A961'
const BLACK = '#0A0A0A'

function GiftRow({ gift, last }: { gift: Gift; last?: boolean }) {
  const available = gift.href !== null

  const inner = (
    <>
      <span
        aria-hidden="true"
        style={{
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontSize: 'clamp(1.9rem, 6vw, 2.6rem)',
          fontWeight: 300,
          lineHeight: 1,
          color: available ? GOLD : 'rgba(201,169,97,0.35)',
          minWidth: '2.4ch',
          paddingTop: '0.15em',
        }}
      >
        {gift.n}
      </span>

      <span style={{ display: 'block', minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: 'clamp(1.55rem, 5vw, 2.1rem)',
            fontWeight: 300,
            lineHeight: 1.15,
            color: available ? IVORY : 'rgba(245,241,232,0.55)',
            marginBottom: '10px',
          }}
        >
          {gift.title}
        </span>

        <span
          style={{
            display: 'block',
            fontSize: '15px',
            lineHeight: 1.7,
            fontWeight: 300,
            color: 'rgba(245,241,232,0.52)',
            maxWidth: '54ch',
            marginBottom: '16px',
          }}
        >
          {gift.line}
        </span>

        <span
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '18px',
            flexWrap: 'wrap',
            fontSize: '10.5px',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          <span style={{ color: 'rgba(245,241,232,0.34)' }}>{gift.meta}</span>
          {available && (
            <span className="gift-cta" style={{ color: GOLD }}>
              Télécharger
            </span>
          )}
        </span>
      </span>
    </>
  )

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: 'clamp(18px, 5vw, 34px)',
    alignItems: 'flex-start',
    padding: 'clamp(30px, 6vw, 44px) 0',
    borderBottom: last ? 'none' : '1px solid rgba(201,169,97,0.13)',
    textDecoration: 'none',
  }

  if (!available) {
    return <div style={rowStyle}>{inner}</div>
  }

  return (
    <a
      href={gift.href as string}
      className="gift-row"
      download
      style={rowStyle}
    >
      {inner}
    </a>
  )
}

export default function MesCadeauxPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: BLACK,
        color: IVORY,
        padding: 'clamp(48px, 9vw, 92px) 24px clamp(64px, 12vw, 120px)',
      }}
    >
      <style>{`
        .gift-row .gift-cta { position: relative; }
        .gift-row .gift-cta::after {
          content: ''; position: absolute; left: 0; right: 0; bottom: -4px;
          height: 1px; background: ${GOLD}; opacity: .45;
          transform-origin: left; transform: scaleX(1);
          transition: transform .45s cubic-bezier(.22,.61,.36,1), opacity .45s ease;
        }
        .gift-row:hover .gift-cta::after,
        .gift-row:focus-visible .gift-cta::after { opacity: 1; transform: scaleX(1.08); }
        .gift-row:focus-visible { outline: 1px solid ${GOLD}; outline-offset: 10px; }
        @media (prefers-reduced-motion: reduce) {
          .gift-row .gift-cta::after { transition: none; }
        }
      `}</style>

      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <Link
          href="/"
          style={{ display: 'inline-block', marginBottom: 'clamp(48px, 9vw, 78px)' }}
        >
          <LogoSite style={{ height: '46px', width: 'auto' }} />
        </Link>

        <div
          aria-hidden="true"
          style={{ width: '28px', height: '1px', background: GOLD, marginBottom: '26px' }}
        />

        <p
          style={{
            fontSize: '10.5px',
            letterSpacing: '0.36em',
            textTransform: 'uppercase',
            color: GOLD,
            marginBottom: '18px',
            fontWeight: 500,
          }}
        >
          Sans condition
        </p>

        <h1
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: 'clamp(2.7rem, 10vw, 4.4rem)',
            fontWeight: 300,
            lineHeight: 1.02,
            letterSpacing: '-0.01em',
            margin: '0 0 26px',
          }}
        >
          Tout ce qui
          <br />
          est à toi
        </h1>

        <p
          style={{
            fontSize: '16px',
            lineHeight: 1.75,
            fontWeight: 300,
            color: 'rgba(245,241,232,0.58)',
            maxWidth: '52ch',
            margin: '0 0 clamp(20px, 5vw, 34px)',
          }}
        >
          Tout est réuni ici. Ces outils t&apos;appartiennent, même si tu ne mets jamais un euro
          dans SOS Shine, même si tu te désabonnes ce soir. Télécharge-les et garde-les sur ton
          téléphone, le jour où ça ira moins bien, tu seras contente de les avoir sous la main.
        </p>

        <section style={{ marginTop: 'clamp(24px, 6vw, 40px)' }}>
          <div
            aria-hidden="true"
            style={{ height: '1px', background: 'rgba(201,169,97,0.13)' }}
          />
          {GIFTS.map((gift) => (
            <GiftRow key={gift.n} gift={gift} />
          ))}
          <GiftRow gift={BONUS} last />
        </section>

        <div
          aria-hidden="true"
          style={{
            height: '1px',
            background: 'rgba(201,169,97,0.13)',
            margin: 'clamp(34px, 7vw, 52px) 0 clamp(26px, 5vw, 36px)',
          }}
        />

        <p
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: 'clamp(1.15rem, 3.6vw, 1.45rem)',
            fontWeight: 300,
            lineHeight: 1.55,
            color: 'rgba(245,241,232,0.72)',
            maxWidth: '46ch',
            margin: '0 0 10px',
          }}
        >
          Lis-les avec ta Signature Émotionnelle à côté. Les deux se répondent.
        </p>

        <p
          style={{
            fontSize: '13px',
            letterSpacing: '0.04em',
            color: 'rgba(245,241,232,0.38)',
            fontWeight: 300,
            margin: '0 0 clamp(34px, 7vw, 48px)',
          }}
        >
          Julia · Fondatrice de SOS Shine
        </p>

        <Link
          href="/signature-emotionnelle"
          style={{
            fontSize: '10.5px',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'rgba(245,241,232,0.42)',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(201,169,97,0.28)',
            paddingBottom: '5px',
            fontWeight: 500,
          }}
        >
          Revoir ma Signature Émotionnelle
        </Link>
      </div>
    </main>
  )
}
