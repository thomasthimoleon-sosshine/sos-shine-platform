import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import SecurityProvider from "@/components/SecurityProvider";

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

export const metadata: Metadata = {
  title: "SOS Shine — Votre communauté bienveillante",
  description:
    "SOS Shine, votre communauté bienveillante. Plateforme premium d'accompagnement pour traverser les épreuves de la vie. Corps, émotion, action.",
  openGraph: {
    title: "SOS Shine — Votre communauté bienveillante",
    description:
      "SOS Shine, votre communauté bienveillante. Plateforme premium d'accompagnement pour traverser les épreuves de la vie.",
    images: [
      {
        url: "/images/og-logo.png",
        width: 1024,
        height: 1024,
        alt: "SOS Shine",
      },
    ],
    type: "website",
    siteName: "SOS Shine",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOS Shine — Votre communauté bienveillante",
    description:
      "SOS Shine, votre communauté bienveillante. Plateforme premium d'accompagnement pour traverser les épreuves de la vie.",
    images: ["/images/og-logo.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SOS Shine",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/api/apple-icon",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
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
        </SecurityProvider>
      </body>
    </html>
  );
}
