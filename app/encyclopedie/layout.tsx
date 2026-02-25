import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Encyclopédie des schémas émotionnels — SOS Shine",
  description:
    "Explorez notre encyclopédie complète des schémas émotionnels et expériences de vie : burn-out, abandon, trahison, deuil, anxiété... Protocoles en 3 étapes avec vidéos, soins énergétiques et méditations guidées.",
  keywords:
    "schéma émotionnel, expérience de vie, burn-out, abandon, trahison, deuil, anxiété, dépendance affective, méditation guidée, soin énergétique, coaching émotionnel, SOS Shine",
  openGraph: {
    title: "Encyclopédie des schémas émotionnels — SOS Shine",
    description:
      "Protocoles en 3 étapes pour traverser vos challenges émotionnels. Vidéos, soins énergétiques et méditations guidées.",
    type: "website",
  },
};

export default function EncyclopedieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
