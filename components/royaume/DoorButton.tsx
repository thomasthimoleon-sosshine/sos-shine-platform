"use client";

import Link from "next/link";

type Props = {
  href: string;
  /** Chiffre rituel affiché en haut de la porte. */
  numeral: string;
  label: string;
  whisper: string;
  variant?: "solo" | "duo";
};

/**
 * Une porte, pas un bouton.
 * Le libellé annonce le geste ; le murmure en dessous annonce l'enjeu.
 */
export default function DoorButton({
  href,
  numeral,
  label,
  whisper,
  variant = "solo",
}: Props) {
  return (
    <Link
      href={href}
      className={`rm-door group ${variant === "duo" ? "rm-door--duo" : ""}`}
    >
      <span className="rm-kicker block">{numeral}</span>

      <span className="rm-serif mt-4 block text-[1.85rem] leading-none text-[var(--rm-text)] sm:text-[2.15rem]">
        {label}
      </span>

      <span className="rm-whisper mt-3 block text-[1.02rem] leading-snug">
        {whisper}
      </span>

      <span className="mt-7 flex items-center gap-3">
        <span className="h-px w-9 bg-[var(--rm-gold-dim)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-16 group-hover:bg-[var(--rm-gold-soft)]" />
        <span className="text-[0.62rem] uppercase tracking-[0.34em] text-[var(--rm-text-mute)] transition-colors duration-700 group-hover:text-[var(--rm-gold-soft)]">
          Entrer
        </span>
      </span>
    </Link>
  );
}
