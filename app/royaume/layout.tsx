import type { Metadata } from "next";
import "./royaume.css";
import { BRAND } from "@/lib/royaume/brand";

export const metadata: Metadata = {
  title: `${BRAND.fullName} — ${BRAND.baseline}`,
  description:
    "Un travail intérieur, lent et brut, pour devenir capable d'habiter l'expérience de sa vie. Seul·e, ou à deux.",
  openGraph: {
    title: `${BRAND.fullName} — ${BRAND.baseline}`,
    description:
      "Un travail intérieur, lent et brut, pour devenir capable d'habiter l'expérience de sa vie.",
    type: "website",
    siteName: BRAND.fullName,
  },
};

export default function RoyaumeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="royaume royaume-body">{children}</div>;
}
