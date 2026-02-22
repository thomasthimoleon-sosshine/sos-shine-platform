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
  title: "SOS Shine — Votre sanctuaire",
  description:
    "Plateforme communautaire premium pour traverser les épreuves de la vie. Accompagnement corps, émotion, action.",
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
          <svg className="spinning-diamond" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="diamond-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFBE6" />
                <stop offset="25%" stopColor="#D4AF37" />
                <stop offset="50%" stopColor="#F5E6A3" />
                <stop offset="75%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#B8960F" />
              </linearGradient>
              <linearGradient id="diamond-highlight" x1="30%" y1="0%" x2="70%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="0.5" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points="24,2 30,16 46,16 34,26 38,44 24,34 10,44 14,26 2,16 18,16" fill="url(#diamond-grad)" />
            <polygon points="24,6 28,16 38,16 30,22 33,34 24,28 15,34 18,22 10,16 20,16" fill="url(#diamond-highlight)" />
            <line x1="24" y1="2" x2="24" y2="34" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />
            <line x1="2" y1="16" x2="46" y2="16" stroke="white" strokeOpacity="0.08" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="ambient-glow" />
        <SecurityProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SecurityProvider>
      </body>
    </html>
  );
}
