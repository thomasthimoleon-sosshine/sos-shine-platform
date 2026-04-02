import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import SecurityProvider from "@/components/SecurityProvider";
import ShineChatbot from "@/components/ShineChatbot";
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
  title: "SOS Shine — Votre communauté bienveillante",
  description:
    "SOS Shine, votre communauté bienveillante. Plateforme premium d'accompagnement pour traverser les épreuves de la vie. Corps, émotion, action.",
  openGraph: {
    title: "SOS Shine — Briller Comme un Diamant",
    description:
      "Rejoignez la première communauté bienveillante dédiée à votre transformation. Corps, émotion, action — accompagnement premium pour traverser les épreuves de la vie.",
    url: siteUrl,
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "SOS Shine — Briller Comme un Diamant",
        type: "image/png",
      },
    ],
    type: "website",
    siteName: "SOS Shine",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOS Shine — Briller Comme un Diamant",
    description:
      "Rejoignez la première communauté bienveillante dédiée à votre transformation. Corps, émotion, action.",
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
      description: 'Plateforme premium d\'accompagnement pour traverser les épreuves de la vie. Corps, émotion, action.',
      inLanguage: 'fr-FR',
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
      description: 'Communauté bienveillante dédiée à la transformation personnelle à travers le Corps, l\'Émotion et l\'Action.',
      sameAs: [],
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
          <ShineChatbot />
          <VisitTracker />
        </SecurityProvider>
      </body>
    </html>
  );
}
