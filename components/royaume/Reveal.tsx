"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Props = {
  children: React.ReactNode;
  /** Retard en secondes — sert à faire respirer un bloc, pas à faire joli. */
  delay?: number;
  className?: string;
};

/**
 * Apparition lente, cinématographique. Jamais de rebond, jamais de ressort :
 * les choses arrivent comme une lumière qu'on monte, pas comme un pop-up.
 */
export default function Reveal({ children, delay = 0, className }: Props) {
  const reduced = usePrefersReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 1.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
