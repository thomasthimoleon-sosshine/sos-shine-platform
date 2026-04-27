'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Floating "I'm in crisis" button visible everywhere in the dashboard.
 * Opens a quick-access modal with the emergency protocol, the Feu de Camp chat,
 * and the audio protocol. Inspired by crisis hotline UX.
 */
export default function CrisisButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-4 left-4 lg:left-[18rem] z-[60] rounded-full shadow-lg flex items-center gap-2 px-4 py-3 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #FF6B6B, #E17055)',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(255,107,107,0.35)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        aria-label="Je suis en crise"
      >
        <span className="text-base">🆘</span>
        <span className="text-xs font-semibold hidden sm:inline">Je suis en crise</span>
      </motion.button>

      {/* Modal overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, var(--surface-card), rgba(255,107,107,0.05))',
                border: '1px solid rgba(255,107,107,0.25)',
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
                aria-label="Fermer"
              >
                ✕
              </button>

              <div className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.25)' }}>
                    <span className="text-2xl">🫂</span>
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Vous n&apos;êtes pas seul(e).
                  </h2>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                    Respirez. Voici trois options pour tenir dans les 10 prochaines minutes.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Option 1: Emergency protocol */}
                  <Link
                    href="/dashboard/encyclopedie"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl p-4 transition-all hover:scale-[1.005]"
                    style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)' }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">🚨</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: '#FF6B6B' }}>Protocole d&apos;urgence</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          Une libération immédiate en 5 minutes. Pas de méditation. Du concret.
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* Option 2: Feu de Camp */}
                  <Link
                    href="/dashboard/chat"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl p-4 transition-all hover:scale-[1.005]"
                    style={{ background: 'rgba(201,169,97,0.06)', border: '1px solid rgba(201,169,97,0.2)' }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">🔥</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: 'var(--brand)' }}>Le Feu de Camp</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          Parlez avec quelqu&apos;un qui comprend, maintenant. 24/7.
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* Option 3: Shine Audible */}
                  <Link
                    href="/dashboard/shine-audible"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl p-4 transition-all hover:scale-[1.005]"
                    style={{ background: 'rgba(116,192,252,0.06)', border: '1px solid rgba(116,192,252,0.2)' }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">🎧</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: '#74C0FC' }}>Audio apaisant</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          Méditation, hypnose, ambiance. Choisissez ce qui vous calme.
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Si vous êtes en danger immédiat, appelez le <strong style={{ color: '#FF6B6B' }}>3114</strong> (numéro national de prévention du suicide, gratuit 24/7).
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
