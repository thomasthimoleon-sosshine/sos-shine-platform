"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  numeral: string;
  title: string;
  lines: string[];
  cta: string;
  children: React.ReactNode;
};

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Le pacte.
 *
 * On n’entre pas dans un questionnaire : on accepte des conditions.
 * Cet écran ne sert qu’à ralentir — et à dire ce qui sera fait de ce
 * qui va être écrit.
 */
export default function Threshold({
  numeral,
  title,
  lines,
  cta,
  children,
}: Props) {
  const [entered, setEntered] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!entered ? (
        <motion.section
          key="seuil"
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 1, ease: EASE }}
          className="relative z-10 flex min-h-[100svh] items-center px-6"
        >
          <div className="mx-auto w-full max-w-[42rem]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, ease: EASE }}
            >
              <p className="rm-kicker">{numeral}</p>
              <h1 className="rm-serif mt-6 text-[clamp(2rem,5vw,3.2rem)]">
                {title}
              </h1>
              <hr className="rm-rule mt-10 max-w-28" />

              <ul className="mt-10 space-y-5">
                {lines.map((line, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.14, ease: EASE }}
                    className="rm-prose flex gap-4 text-[0.98rem]"
                  >
                    <span className="mt-[0.7em] h-px w-6 shrink-0 bg-[var(--rm-gold-dim)]" />
                    <span>{line}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.button
                type="button"
                onClick={() => setEntered(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 + lines.length * 0.14, ease: EASE }}
                className="group mt-16 flex items-center gap-4 text-[0.66rem] uppercase tracking-[0.36em] text-[var(--rm-gold-dim)] transition-colors duration-700 hover:text-[var(--rm-gold-soft)]"
              >
                {cta}
                <span className="h-px w-10 bg-current transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-20" />
              </motion.button>
            </motion.div>
          </div>
        </motion.section>
      ) : (
        <motion.div
          key="parcours"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: EASE }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
