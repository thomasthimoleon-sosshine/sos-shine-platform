import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import SecurityProvider from "@/components/SecurityProvider";
import VisitTracker from "@/components/VisitTracker";

const cormorant = localFont({
  variable: "--font-cormorant",
  src: [
    { path: "../public/fonts/cormorant-garamond-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/cormorant-garamond-latin-300-italic.woff2", weight: "300", style: "italic" },
    { path: "../public/fonts/cormorant-garamond-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/cormorant-garamond-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../public/fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "../public/fonts/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/cormorant-garamond-latin-600-italic.woff2", weight: "600", style: "italic" },
  ],
});

const dmSans = localFont({
  variable: "--font-dm-sans",
  src: [
    { path: "../public/fonts/dm-sans-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/dm-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/dm-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : "https://sosshine.com");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "SOS Shine - Plateforme de déconditionnement émotionnel",
  description:
    "Comprenez pourquoi vous répétez les mêmes schémas émotionnels - et sortez-en. 200+ protocoles guidés par Julia Laureau, auteure du Déconditionnement. Test gratuit en 20 questions.",
  keywords: [
    "déconditionnement émotionnel",
    "schémas émotionnels",
    "dépendance affective",
    "rupture",
    "abandon",
    "burn-out",
    "Julia Laureau",
    "signature émotionnelle",
    "protocoles émotionnels",
    "SOS Shine",
  ],
  authors: [{ name: "Julia Laureau" }],
  openGraph: {
    title: "SOS Shine - Comprendre vos schémas. Les transformer.",
    description:
      "200+ protocoles guidés pour décoder vos réactions émotionnelles et reprendre les commandes de votre vie. Pas du bien-être. Du déconditionnement. Par Julia Laureau.",
    url: siteUrl,
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "SOS Shine - Plateforme de déconditionnement émotionnel",
        type: "image/png",
      },
    ],
    type: "website",
    siteName: "SOS Shine",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOS Shine - Déconditionnement émotionnel",
    description:
      "Comprenez pourquoi vous répétez les mêmes schémas. 200+ protocoles par Julia Laureau. Test gratuit.",
    images: ["/api/og"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SOS Shine",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'SOS Shine',
      description: 'Plateforme de déconditionnement émotionnel. 200+ protocoles guidés pour comprendre et transformer vos schémas.',
      inLanguage: 'fr-FR',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/encyclopedie?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'SOS Shine',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/logo-shine.png`,
      },
      description: "Plateforme de déconditionnement émotionnel fondée par Julia Laureau. Décode vos schémas et vous donne les outils pour les transformer.",
      founder: {
        '@type': 'Person',
        name: 'Julia Laureau',
        jobTitle: 'Fondatrice, Auteure du Déconditionnement',
      },
      sameAs: [],
    },
    {
      '@type': 'Product',
      '@id': `${siteUrl}/#product`,
      name: 'SOS Shine',
      description: 'Accès à 200+ protocoles de déconditionnement émotionnel, chats communautaires, lives hebdomadaires avec Julia Laureau.',
      brand: { '@type': 'Brand', name: 'SOS Shine' },
      offers: [
        {
          '@type': 'Offer',
          name: 'Plan Gratuit',
          price: '0',
          priceCurrency: 'EUR',
          description: 'Communauté + Shine Audible',
        },
        {
          '@type': 'Offer',
          name: 'Plan Gratuit',
          price: '0',
          priceCurrency: 'EUR',
          description: 'Encyclopédie complète + chats par challenge',
        },
        {
          '@type': 'Offer',
          name: 'Plan Sérénité',
          price: '29.90', // SOS Shine
          priceCurrency: 'EUR',
          description: 'Tout inclus - Shine TV, Lives, Événements',
        },
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${cormorant.variable} ${dmSans.variable} antialiased grain`}
      >
        <div className="page-loader" aria-hidden="true">
          <img
            src="/images/logo-shine.png"
            alt="SOS Shine"
            className="loader-logo"
          />
        </div>
        <div className="ambient-glow" />
        <SecurityProvider>
          <ThemeProvider>{children}</ThemeProvider>
          <Suspense fallback={null}><VisitTracker /></Suspense>
        </SecurityProvider>
      </body>
    </html>
  );
}
