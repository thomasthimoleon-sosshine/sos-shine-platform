'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ_DATA: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['prix', 'tarif', 'coût', 'combien', 'abonnement', 'payer', 'gratuit', 'cher'],
    answer: "Nous proposons deux formules : l'Essentielle à 9,90€/mois avec l'encyclopédie et le chat communauté, et la Sérénité à 49,90€/mois avec en plus la librairie, Shine TV, Shorts, Audible, le soin collectif mensuel, les lives hebdomadaires et les événements physiques (7 jours d'essai gratuit). 💎",
  },
  {
    keywords: ['essai', 'tester', 'essayer', 'période'],
    answer: "Vous pouvez découvrir la plateforme et son contenu avant de vous engager. N'hésitez pas à nous contacter pour en savoir plus sur les modalités ! ✨",
  },
  {
    keywords: ['encyclopédie', 'encyclopedie', 'contenu', 'article', 'sujet'],
    answer: "Notre encyclopédie couvre de nombreuses expériences de vie : gestion du stress, confiance en soi, relations, deuil, reconstruction personnelle, et bien plus encore. Chaque sujet est traité avec bienveillance et expertise. 📖",
  },
  {
    keywords: ['conférence', 'conference', 'live', 'direct', 'visio'],
    answer: "Les conférences en direct sont réservées aux membres Premium. Ce sont des sessions interactives animées par des professionnels où vous pouvez poser vos questions en temps réel. 🎙️",
  },
  {
    keywords: ['confidentiel', 'privé', 'anonyme', 'sécurité', 'données', 'securite', 'donnees'],
    answer: "Votre confidentialité est notre priorité absolue. Toutes les données sont chiffrées, et vous pouvez participer de manière anonyme si vous le souhaitez. Votre espace est 100% sécurisé. 🔒",
  },
  {
    keywords: ['inscription', 'inscrire', 'rejoindre', 'commencer', 'démarrer', 'demarrer', 'comment'],
    answer: "C'est très simple ! Cliquez sur \"Rejoindre la communauté\" sur la page d'accueil, choisissez votre formule, et vous aurez accès immédiatement à votre espace personnel. Bienvenue ! 🌟",
  },
  {
    keywords: ['julia', 'fondatrice', 'fondateur', 'créateur', 'qui'],
    answer: "SOS Shine a été fondé par Julia Laureau, auteure du livre \"SOS Shine - Briller Comme un Diamant\" et spécialiste du déconditionnement émotionnel. Elle est accompagnée de Wiliam et Thomas, co-fondateurs passionnés. 💫",
  },
  {
    keywords: ['livre', 'bouquin', 'ouvrage', 'amazon'],
    answer: "Le livre \"SOS Shine - Briller Comme un Diamant\" de Julia Laureau est disponible sur Amazon. C'est un programme interactif de déconditionnement émotionnel avec vidéos explicatives et exercices pratiques. C'est de là que tout est parti ! 📚",
  },
  {
    keywords: ['groupe', 'parole', 'communauté', 'communaute', 'forum', 'échanger', 'echanger'],
    answer: "Notre communauté est un espace bienveillant où chacun peut s'exprimer librement. Les espaces d'échange sont organisés par thème pour garantir un cadre sûr et respectueux. 🤝",
  },
  {
    keywords: ['annuler', 'résilier', 'resilier', 'arrêter', 'arreter', 'désabonner', 'desabonner'],
    answer: "Vous pouvez annuler votre abonnement à tout moment depuis votre espace personnel, sans engagement. Nous espérons que vous resterez avec nous, mais c'est vous qui décidez ! 💛",
  },
  {
    keywords: ['aide', 'urgence', 'crise', 'danger', 'suicide'],
    answer: "Si vous êtes en situation d'urgence, appelez le 3114 (numéro national de prévention du suicide) ou le 15 (SAMU). SOS Shine est un espace d'accompagnement, mais en cas de crise, les professionnels de santé sont là pour vous. ❤️",
  },
  {
    keywords: ['bonjour', 'salut', 'hello', 'coucou', 'hey', 'hi'],
    answer: "Bonjour ! Je suis Shine, votre petit compagnon sur cette plateforme. Comment puis-je vous aider aujourd'hui ? N'hésitez pas à me poser vos questions ! ✨",
  },
  {
    keywords: ['merci', 'super', 'génial', 'genial', 'top', 'parfait'],
    answer: "Avec plaisir ! Je suis là pour ça. Si vous avez d'autres questions, n'hésitez pas, je ne mords pas ! 😄💎",
  },
];

const DEFAULT_ANSWER = "Je ne suis pas sûr de bien comprendre votre question, mais je fais de mon mieux ! Vous pouvez me demander des infos sur nos tarifs, l'inscription, l'encyclopédie, les conférences, la confidentialité, ou notre communauté. Sinon, notre équipe sera ravie de vous aider via la page Contact ! 💎";

function findAnswer(input: string): string {
  const lower = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let bestMatch = { score: 0, answer: DEFAULT_ANSWER };
  for (const faq of FAQ_DATA) {
    const score = faq.keywords.filter((k) => {
      const kNorm = k.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return lower.includes(kNorm);
    }).length;
    if (score > bestMatch.score) {
      bestMatch = { score, answer: faq.answer };
    }
  }
  return bestMatch.answer;
}

// Set to true when Claude API backend is connected
const CHATBOT_ENABLED = false

type Message = { from: 'user' | 'bot'; text: string };

export default function ShineChatbot() {
  if (!CHATBOT_ENABLED) return null
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: "Bonjour ! Je suis Shine, votre petit guide. Posez-moi vos questions sur la plateforme, je suis là pour vous aider ! ✨" },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [miniPlayerActive, setMiniPlayerActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      setHidden((e as CustomEvent).detail);
      if ((e as CustomEvent).detail) setOpen(false);
    };
    window.addEventListener('fullscreen-player-toggle', handler);
    return () => window.removeEventListener('fullscreen-player-toggle', handler);
  }, []);

  // Watch for mini-player presence via data attribute
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setMiniPlayerActive(document.documentElement.hasAttribute('data-mini-player'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mini-player'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: 'user', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'bot', text: findAnswer(text) }]);
      setTyping(false);
    }, 800 + Math.random() * 600);
  };

  if (hidden) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`fixed right-4 z-[9998] w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden transition-all duration-300 ${miniPlayerActive ? 'bottom-[5.5rem]' : 'bottom-14'}`}
            style={{
              background: 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(201,169,97,0.1)',
            }}
          >
            <div className="px-4 py-3 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, rgba(201,169,97,0.15) 0%, rgba(201,169,97,0.05) 100%)', borderBottom: '1px solid rgba(201,169,97,0.2)' }}>
              <img src="/images/shine-avatar.jpeg" alt="Shine" className="w-8 h-8 rounded-full object-cover" style={{ border: '2px solid var(--brand)', boxShadow: '0 0 12px rgba(201,169,97,0.4)' }} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--brand)]">Shine</p>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Votre assistant</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white/80 transition-colors p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div ref={scrollRef} className="px-3 py-3 space-y-3 overflow-y-auto" style={{ height: '300px' }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.from === 'bot' && (
                    <img src="/images/shine-avatar.jpeg" alt="Shine" className="w-6 h-6 rounded-full object-cover mr-2 mt-1 flex-shrink-0" style={{ border: '1.5px solid var(--brand)' }} />
                  )}
                  <div
                    className="max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                    style={
                      msg.from === 'user'
                        ? { background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#0a0a0a', borderBottomRightRadius: '4px' }
                        : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.85)', borderBottomLeftRadius: '4px' }
                    }
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <img src="/images/shine-avatar.jpeg" alt="Shine" className="w-6 h-6 rounded-full object-cover mr-2 mt-1 flex-shrink-0" style={{ border: '1.5px solid var(--brand)' }} />
                  <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--brand)', animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--brand)', animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--brand)', animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="px-3 pb-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <form
                onSubmit={(e) => { e.preventDefault(); send(); }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Posez votre question..."
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(201,169,97,0.15)',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(201,169,97,0.5)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(201,169,97,0.15)'; }}
                />
                <button
                  type="submit"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Petit onglet discret au lieu du gros bouton rond */}
      <motion.button
        onClick={() => setOpen(!open)}
        className={`fixed right-4 z-[9998] cursor-pointer rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 ${miniPlayerActive ? 'bottom-[5rem]' : 'bottom-4'}`}
        style={{
          border: '1.5px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4), 0 0 8px rgba(201,169,97,0.1)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {open ? (
          <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: 'rgba(212, 175, 55, 0.15)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
        ) : (
          <img src="/images/shine-avatar.jpeg" alt="Shine" className="w-full h-full rounded-full object-cover" />
        )}
      </motion.button>
    </>
  );
}
