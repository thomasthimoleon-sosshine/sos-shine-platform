'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getReleaseDate } from '@/lib/release-schedule'
import { createClient } from '@/lib/supabase/client'
import type { Douleur } from '@/types/database'

/* ─── Catégories & couleurs ─── */
const CATEGORIES: Record<string, string> = {
  "Émotions & Psychologie": "var(--brand)",
  "Relations & Liens": "#C9A96E",
  "Blessures & Traumatismes": "#B8860B",
  "Développement Personnel": "#DAA520",
  "Corps & Somatique": "#CD853F",
  "Spiritualité & Énergie": "#FFD700",
  "Approches & Méthodes": "#F0C040",
  "Identité & Mission": "#E8C870",
  "Vie & Expériences": "var(--brand)",
  "Pratiques & Outils": "#C8A951",
}

type Topic = {
  letter: string
  title: string
  subtitle: string
  cat: string
  original?: boolean
  slug: string
  dbMatch?: Douleur
}

/* ─── Liste complète des sujets (fallback + base) ─── */
const ALL_TOPICS: Omit<Topic, 'dbMatch' | 'slug'>[] = [
  // A
  { letter: "A", title: "Abandon", subtitle: "grandir sans père, sans mère ou sans les deux", cat: "Blessures & Traumatismes", original: true },
  { letter: "A", title: "Abus émotionnels", subtitle: "identifier, comprendre et se reconstruire", cat: "Blessures & Traumatismes" },
  { letter: "A", title: "Abus sexuels", subtitle: "identifier, comprendre et se reconstruire", cat: "Blessures & Traumatismes", original: true },
  { letter: "A", title: "Addiction", subtitle: "alcool, drogues, jeux, écrans, travail, sucre", cat: "Émotions & Psychologie" },
  { letter: "A", title: "Adolescence", subtitle: "traverser cette période et en comprendre les blessures", cat: "Vie & Expériences" },
  { letter: "A", title: "Affirmation de soi", subtitle: "assertivité, s'exprimer sans s'effacer", cat: "Développement Personnel" },
  { letter: "A", title: "Âge & vieillissement", subtitle: "accepter le passage du temps et se réinventer", cat: "Vie & Expériences" },
  { letter: "A", title: "Âme", subtitle: "connexion à l'âme, mission de l'âme", cat: "Spiritualité & Énergie" },
  { letter: "A", title: "Amour conditionnel", subtitle: "l'amour conditionnel vs inconditionnel - comprendre la différence", cat: "Relations & Liens" },
  { letter: "A", title: "Amour de soi", subtitle: "développer l'amour et l'estime de soi", cat: "Développement Personnel", original: true },
  { letter: "A", title: "Ancêtres & mémoires ancestrales", subtitle: "héritage familial, messages des lignées", cat: "Spiritualité & Énergie" },
  { letter: "A", title: "Ancrage (Grounding)", subtitle: "se sentir ancré dans son corps, dans le présent", cat: "Corps & Somatique" },
  { letter: "A", title: "Angoisse existentielle", subtitle: "le vide, la mort, le sens - apprivoiser l'angoisse profonde", cat: "Émotions & Psychologie" },
  { letter: "A", title: "Anxiété", subtitle: "comprendre et apprendre à la gérer", cat: "Émotions & Psychologie", original: true },
  { letter: "A", title: "Archives akashiques", subtitle: "accéder à la mémoire de l'âme", cat: "Spiritualité & Énergie" },
  { letter: "A", title: "Assertivité", subtitle: "s'affirmer sans agresser ni s'effacer", cat: "Développement Personnel" },
  { letter: "A", title: "Astrologie", subtitle: "se connaître via les astres, thème natal et évolution", cat: "Pratiques & Outils" },
  { letter: "A", title: "Attachement", subtitle: "styles d'attachement : sécure, anxieux, évitant, désorganisé", cat: "Relations & Liens" },
  { letter: "A", title: "Attentes", subtitle: "se libérer des attentes des autres et de soi-même", cat: "Développement Personnel" },
  { letter: "A", title: "Aura", subtitle: "comprendre et travailler son champ énergétique", cat: "Spiritualité & Énergie" },
  { letter: "A", title: "Authenticité", subtitle: "vivre en accord avec ce qu'on est vraiment", cat: "Identité & Mission" },
  { letter: "A", title: "Autorité intérieure", subtitle: "faire confiance à sa propre voix intérieure", cat: "Développement Personnel" },
  { letter: "A", title: "Autocompassion", subtitle: "se traiter avec douceur et bienveillance", cat: "Développement Personnel" },
  { letter: "A", title: "Autosabotage", subtitle: "reconnaître et défaire les patterns autodestructeurs", cat: "Émotions & Psychologie" },
  { letter: "A", title: "Ayurveda", subtitle: "savoir ancien : les doshas et l'équilibre naturel", cat: "Approches & Méthodes" },
  // B
  { letter: "B", title: "Blessures de l'âme", subtitle: "les 5 blessures fondamentales selon Lise Bourbeau", cat: "Blessures & Traumatismes" },
  { letter: "B", title: "Blessures relationnelles", subtitle: "les traces que les autres laissent sur notre capacité à aimer", cat: "Blessures & Traumatismes" },
  { letter: "B", title: "Bonheur", subtitle: "construire un bonheur durable, pas dépendant des circonstances", cat: "Développement Personnel" },
  { letter: "B", title: "Breathwork", subtitle: "respiration consciente et holotropique : ce qu'elle libère", cat: "Approches & Méthodes" },
  { letter: "B", title: "Burnout", subtitle: "comprendre, prévenir et traverser l'épuisement total", cat: "Émotions & Psychologie" },
  { letter: "B", title: "But de vie", subtitle: "trouver sa raison d'être profonde", cat: "Identité & Mission" },
  // C
  { letter: "C", title: "Chakras", subtitle: "les 7 centres énergétiques, leurs déséquilibres et leur activation", cat: "Spiritualité & Énergie" },
  { letter: "C", title: "Champ morphogénétique", subtitle: "l'invisible qui relie et structure tous les êtres vivants", cat: "Spiritualité & Énergie" },
  { letter: "C", title: "Codépendance", subtitle: "perdre soi pour sauver l'autre - comprendre et sortir du cycle", cat: "Relations & Liens" },
  { letter: "C", title: "Cohérence cardiaque", subtitle: "réguler le système nerveux par la respiration cardiaque", cat: "Approches & Méthodes" },
  { letter: "C", title: "Colère", subtitle: "libérer la colère et le ressentiment", cat: "Émotions & Psychologie", original: true },
  { letter: "C", title: "Communication non-violente", subtitle: "CNV - s'exprimer sans blesser, écouter sans se perdre", cat: "Relations & Liens" },
  { letter: "C", title: "Comparaison sociale", subtitle: "sortir du piège des comparaisons permanentes", cat: "Émotions & Psychologie" },
  { letter: "C", title: "Conditionnement", subtitle: "identifier et dépasser les conditionnements de l'enfance", cat: "Blessures & Traumatismes", original: true },
  { letter: "C", title: "Confiance en soi", subtitle: "surmonter les peurs et apprendre à oser", cat: "Développement Personnel", original: true },
  { letter: "C", title: "Congruence", subtitle: "alignement intérieur - penser, ressentir, agir en accord", cat: "Identité & Mission" },
  { letter: "C", title: "Conscience", subtitle: "élargir sa conscience de soi et du monde", cat: "Spiritualité & Énergie" },
  { letter: "C", title: "Constellations familiales", subtitle: "méthode Hellinger - révéler les loyautés et dynamiques cachées", cat: "Approches & Méthodes" },
  { letter: "C", title: "Contrôle", subtitle: "besoin de contrôle, hypercontrôle et chemin vers le lâcher-prise", cat: "Émotions & Psychologie" },
  { letter: "C", title: "Corps & esprit", subtitle: "la connexion fondamentale entre le physique et l'émotionnel", cat: "Corps & Somatique" },
  { letter: "C", title: "Couple", subtitle: "dynamiques, besoins, conflits et épanouissement à deux", cat: "Relations & Liens" },
  { letter: "C", title: "Créativité", subtitle: "libérer la créativité bloquée par la peur du jugement", cat: "Développement Personnel" },
  { letter: "C", title: "Cristaux & pierres", subtitle: "propriétés vibratoires des pierres et usage traditionnel", cat: "Approches & Méthodes" },
  { letter: "C", title: "Croyances limitantes", subtitle: "identifier et reprogrammer les croyances qui bloquent", cat: "Émotions & Psychologie" },
  { letter: "C", title: "Culpabilité", subtitle: "comprendre la culpabilité saine et toxique", cat: "Émotions & Psychologie" },
  { letter: "C", title: "Cycles de vie", subtitle: "les grandes transitions qui transforment une vie", cat: "Vie & Expériences" },
  { letter: "C", title: "Cycles lunaires", subtitle: "se synchroniser avec les phases de la lune", cat: "Pratiques & Outils" },
  // D
  { letter: "D", title: "Danse & expression", subtitle: "le corps qui parle quand les mots ne suffisent pas", cat: "Approches & Méthodes" },
  { letter: "D", title: "Décodage biologique", subtitle: "ce que le corps exprime quand les mots manquent", cat: "Corps & Somatique" },
  { letter: "D", title: "Déni", subtitle: "mécanisme de défense - voir ce qu'on refuse de voir", cat: "Émotions & Psychologie" },
  { letter: "D", title: "Dépendance affective", subtitle: "comprendre et s'en libérer", cat: "Relations & Liens", original: true },
  { letter: "D", title: "Dépression", subtitle: "comprendre et surmonter", cat: "Émotions & Psychologie", original: true },
  { letter: "D", title: "Désirs profonds", subtitle: "retrouver et honorer ses vrais désirs", cat: "Identité & Mission" },
  { letter: "D", title: "Deuil", subtitle: "traverser la perte et faire le deuil d'un proche ou d'une situation", cat: "Vie & Expériences", original: true },
  { letter: "D", title: "Deuil périnatal & infertilité", subtitle: "le deuil de l'enfant attendu, perdu ou impossible", cat: "Vie & Expériences" },
  { letter: "D", title: "Dharma", subtitle: "chemin de vie, mission karmique, raison d'incarnation", cat: "Spiritualité & Énergie" },
  { letter: "D", title: "Disqualification de soi", subtitle: "se minimiser, se dénigrer - origines et reconstruction", cat: "Émotions & Psychologie" },
  { letter: "D", title: "Dissociation", subtitle: "se déconnecter de soi comme mécanisme de survie", cat: "Émotions & Psychologie" },
  { letter: "D", title: "Divorce & séparation", subtitle: "traverser, comprendre et se reconstruire", cat: "Vie & Expériences" },
  { letter: "D", title: "Douleur chronique", subtitle: "le lien entre corps, émotions et mémoire physique", cat: "Corps & Somatique" },
  { letter: "D", title: "Drama triangle", subtitle: "triangle de Karpman - victime, sauveur, persécuteur", cat: "Relations & Liens" },
  // E
  { letter: "E", title: "EFT (Tapping)", subtitle: "Emotional Freedom Technique - libérer les émotions par les méridiens", cat: "Approches & Méthodes" },
  { letter: "E", title: "EMDR", subtitle: "l'approche par les mouvements oculaires, et ce qu'elle propose", cat: "Approches & Méthodes" },
  { letter: "E", title: "Ego", subtitle: "comprendre l'ego, le dépasser sans le nier", cat: "Spiritualité & Énergie" },
  { letter: "E", title: "Émotions", subtitle: "intelligence émotionnelle, identifier et traverser ses émotions", cat: "Émotions & Psychologie" },
  { letter: "E", title: "Empathie", subtitle: "développer l'empathie et se protéger de l'empathie toxique", cat: "Relations & Liens" },
  { letter: "E", title: "Empowerment", subtitle: "reprendre son pouvoir personnel", cat: "Développement Personnel" },
  { letter: "E", title: "Énergie vitale", subtitle: "prana, chi, ki - comprendre et nourrir sa force de vie", cat: "Spiritualité & Énergie" },
  { letter: "E", title: "Enfant intérieur", subtitle: "se reconnecter à l'enfant blessé en soi", cat: "Blessures & Traumatismes" },
  { letter: "E", title: "Ennéagramme", subtitle: "les 9 types de personnalité et leurs dynamiques profondes", cat: "Pratiques & Outils" },
  { letter: "E", title: "Épigénétique", subtitle: "comment les traumatismes se transmettent d'une génération à l'autre", cat: "Corps & Somatique" },
  { letter: "E", title: "Équilibre vie professionnelle / personnelle", subtitle: "trouver son propre équilibre durable", cat: "Vie & Expériences" },
  { letter: "E", title: "Estime de soi", subtitle: "construire une estime solide et indépendante du regard des autres", cat: "Développement Personnel" },
  { letter: "E", title: "État de flow", subtitle: "entrer dans la zone - performance, créativité, présence totale", cat: "Développement Personnel" },
  { letter: "E", title: "Éveil spirituel", subtitle: "traverser les étapes d'un éveil - comprendre et intégrer", cat: "Spiritualité & Énergie" },
  // F
  { letter: "F", title: "Famille toxique", subtitle: "dynamiques dysfonctionnelles, bouc émissaire, enfant parentifié", cat: "Relations & Liens" },
  { letter: "F", title: "Fascias & mémoire corporelle", subtitle: "comment le corps stocke les émotions dans les tissus", cat: "Corps & Somatique" },
  { letter: "F", title: "Fatigue émotionnelle", subtitle: "adrénaline chronique, épuisement nerveux et reconstruction", cat: "Émotions & Psychologie" },
  { letter: "F", title: "Féminin sacré", subtitle: "retrouver, honorer et incarner le féminin profond", cat: "Spiritualité & Énergie" },
  { letter: "F", title: "Fidélité à soi-même", subtitle: "ne plus trahir ses propres valeurs pour plaire", cat: "Identité & Mission" },
  { letter: "F", title: "Filiation", subtitle: "le lien aux parents et aux ancêtres - honorer sans porter", cat: "Relations & Liens" },
  { letter: "F", title: "Fleurs de Bach", subtitle: "38 élixirs floraux pour équilibrer les états émotionnels", cat: "Approches & Méthodes" },
  { letter: "F", title: "Frontières & limites", subtitle: "poser des limites saines sans culpabilité", cat: "Développement Personnel" },
  { letter: "F", title: "Frustration", subtitle: "comprendre la frustration comme signal de besoins non comblés", cat: "Émotions & Psychologie" },
  // G
  { letter: "G", title: "Gaslighting", subtitle: "manipulation par la distorsion de la réalité - identifier et sortir", cat: "Relations & Liens" },
  { letter: "G", title: "Générosité excessive", subtitle: "donner sans se vider - trouver l'équilibre du don", cat: "Développement Personnel" },
  { letter: "G", title: "Géobiologie", subtitle: "l'influence de l'espace et des lieux sur l'énergie", cat: "Spiritualité & Énergie" },
  { letter: "G", title: "Gratitude", subtitle: "la pratique de la gratitude comme outil de transformation", cat: "Pratiques & Outils" },
  { letter: "R", title: "Reconstruction", subtitle: "le processus global - étapes, spirales, rechutes", cat: "Développement Personnel" },
  // H
  { letter: "H", title: "Honte", subtitle: "comprendre et libérer la honte toxique", cat: "Émotions & Psychologie" },
  { letter: "H", title: "Human Design", subtitle: "découvrir son type, son autorité et sa stratégie de vie", cat: "Pratiques & Outils" },
  { letter: "H", title: "Hypervigilance", subtitle: "toujours en alerte - reconnaître et déposer la vigilance excessive", cat: "Émotions & Psychologie" },
  { letter: "H", title: "Hypersensibilité", subtitle: "être HSP - force, défis et épanouissement des âmes sensibles", cat: "Identité & Mission" },
  { letter: "H", title: "Hypnose", subtitle: "travail sur l'inconscient par l'hypnose et la transe", cat: "Approches & Méthodes" },
  // I
  { letter: "I", title: "Identité", subtitle: "construire et affirmer une identité solide et authentique", cat: "Identité & Mission" },
  { letter: "I", title: "Identité de genre & sexualité", subtitle: "explorer, comprendre et accepter sa nature profonde", cat: "Identité & Mission" },
  { letter: "I", title: "Illusions", subtitle: "déconstruire les illusions sur l'amour, la vie, et soi-même", cat: "Développement Personnel" },
  { letter: "I", title: "Incarnation", subtitle: "être pleinement dans son corps, présent à sa vie", cat: "Corps & Somatique" },
  { letter: "I", title: "Inconscient", subtitle: "explorer les mécanismes inconscients qui pilotent notre vie", cat: "Émotions & Psychologie" },
  { letter: "I", title: "Injustice", subtitle: "blessure d'injustice - la colère du juste et l'apaisement", cat: "Blessures & Traumatismes" },
  { letter: "I", title: "Intuition", subtitle: "se reconnecter à son intuition", cat: "Développement Personnel", original: true },
  { letter: "I", title: "Isolement social", subtitle: "solitude subie, retrait du monde et reconnexion", cat: "Vie & Expériences" },
  // J
  { letter: "J", title: "Jalousie & envie", subtitle: "comprendre la jalousie comme signal d'un besoin", cat: "Émotions & Psychologie" },
  { letter: "J", title: "Joie profonde", subtitle: "cultiver une joie qui ne dépend pas des conditions extérieures", cat: "Développement Personnel" },
  { letter: "J", title: "Journal intime", subtitle: "l'écriture quotidienne comme pratique de connexion à soi", cat: "Pratiques & Outils" },
  { letter: "J", title: "Jugement & regard des autres", subtitle: "se libérer du regard, de l'opinion, de la peur du rejet", cat: "Émotions & Psychologie" },
  { letter: "J", title: "Jung & l'inconscient collectif", subtitle: "archétypes, ombre, synchronicités - l'héritage jungien", cat: "Pratiques & Outils" },
  // K
  { letter: "K", title: "Karma", subtitle: "lois karmiques, schémas répétitifs entre vies et libération", cat: "Spiritualité & Énergie" },
  { letter: "K", title: "Kundalini", subtitle: "énergie serpentine - éveil, montée et intégration", cat: "Spiritualité & Énergie" },
  // L
  { letter: "L", title: "Lâcher-prise", subtitle: "l'art de libérer ce qu'on ne peut pas contrôler", cat: "Développement Personnel" },
  { letter: "L", title: "Leadership personnel", subtitle: "devenir le leader de sa propre vie", cat: "Identité & Mission" },
  { letter: "L", title: "Liberté intérieure", subtitle: "construire une liberté qui vient de l'intérieur", cat: "Développement Personnel" },
  { letter: "L", title: "Loi de l'attraction", subtitle: "vibration, manifestation et co-création avec l'univers", cat: "Spiritualité & Énergie" },
  { letter: "L", title: "Loyautés invisibles", subtitle: "les loyautés familiales inconscientes qui nous retiennent", cat: "Blessures & Traumatismes" },
  { letter: "L", title: "Lucidité onirique", subtitle: "rêves lucides - explorer et transformer depuis le rêve", cat: "Pratiques & Outils" },
  // M
  { letter: "M", title: "Masculin sacré", subtitle: "retrouver, équilibrer et incarner le masculin profond", cat: "Spiritualité & Énergie" },
  { letter: "M", title: "Maternité & identité maternelle", subtitle: "devenir mère, perdre et retrouver soi dans la maternité", cat: "Vie & Expériences" },
  { letter: "M", title: "Manipulation", subtitle: "reconnaître les patterns manipulatoires et s'en protéger", cat: "Relations & Liens" },
  { letter: "M", title: "Mécanismes de défense", subtitle: "les protections inconscientes du psychisme", cat: "Émotions & Psychologie" },
  { letter: "T", title: "Traditions chinoises (MTC)", subtitle: "méridiens, énergie, organes et émotions", cat: "Approches & Méthodes" },
  { letter: "M", title: "Méditation", subtitle: "pratique, bienfaits, et différentes formes de méditation", cat: "Pratiques & Outils" },
  { letter: "M", title: "Médiumnité & perception extrasensorielle", subtitle: "percevoir au-delà du visible", cat: "Spiritualité & Énergie" },
  { letter: "M", title: "Mémoire cellulaire", subtitle: "les émotions stockées dans les cellules du corps", cat: "Corps & Somatique" },
  { letter: "M", title: "Mémoire traumatique", subtitle: "comment le trauma s'inscrit dans le corps et le cerveau", cat: "Blessures & Traumatismes" },
  { letter: "M", title: "Méridiens énergétiques", subtitle: "les canaux d'énergie du corps et leur influence émotionnelle", cat: "Spiritualité & Énergie" },
  { letter: "M", title: "Mission de vie", subtitle: "trouver sa mission et donner du sens", cat: "Identité & Mission", original: true },
  { letter: "M", title: "Mort & finitude", subtitle: "apprivoiser la mort, réfléchir à la finitude pour mieux vivre", cat: "Vie & Expériences" },
  { letter: "M", title: "Mouvement conscient", subtitle: "se libérer par le mouvement du corps", cat: "Corps & Somatique" },
  // N
  { letter: "N", title: "Narcissisme", subtitle: "le pervers narcissique - reconnaître, quitter et se reconstruire", cat: "Relations & Liens" },
  { letter: "N", title: "Neurosciences émotionnelles", subtitle: "comment le cerveau traite les émotions et construit nos réactions", cat: "Émotions & Psychologie" },
  { letter: "N", title: "Neuroplasticité", subtitle: "la capacité du cerveau à se transformer et se recâbler", cat: "Corps & Somatique" },
  { letter: "N", title: "Numérologie", subtitle: "les vibrations des nombres comme clés de connaissance de soi", cat: "Pratiques & Outils" },
  { letter: "N", title: "Régulation du système nerveux", subtitle: "comprendre le SNA, sortir du mode survie", cat: "Corps & Somatique" },
  // O
  { letter: "O", title: "Ombre (Shadow Work)", subtitle: "explorer et intégrer les parts rejetées de soi - héritage de Jung", cat: "Développement Personnel" },
  { letter: "O", title: "Oracle & Tarot", subtitle: "outils de guidance intuitive et de connaissance de soi", cat: "Pratiques & Outils" },
  { letter: "O", title: "Orgasme & sexualité sacrée", subtitle: "tantra, plaisir conscient, énergie sexuelle comme force créatrice", cat: "Corps & Somatique" },
  // P
  { letter: "P", title: "Paix intérieure", subtitle: "construire une paix qui résiste à la tempête", cat: "Développement Personnel" },
  { letter: "P", title: "Pardon", subtitle: "apprendre à pardonner ou à avancer sans pardon", cat: "Développement Personnel", original: true },
  { letter: "P", title: "Parentalité consciente", subtitle: "élever ses enfants en prenant soin de ses propres blessures", cat: "Relations & Liens" },
  { letter: "P", title: "Passage à l'acte", subtitle: "quitter la pensée pour entrer dans l'action", cat: "Développement Personnel" },
  { letter: "P", title: "Perfectionnisme", subtitle: "comprendre le perfectionnisme et s'en libérer", cat: "Émotions & Psychologie" },
  { letter: "P", title: "Peur", subtitle: "comprendre, traverser et transformer toutes les formes de peur", cat: "Émotions & Psychologie" },
  { letter: "P", title: "PNL (Programmation Neuro-Linguistique)", subtitle: "reprogrammer ses réponses automatiques", cat: "Approches & Méthodes" },
  { letter: "P", title: "Pleine conscience (Mindfulness)", subtitle: "vivre dans l'instant présent", cat: "Pratiques & Outils" },
  { letter: "P", title: "Polarités (Yin / Yang)", subtitle: "équilibrer les forces opposées en soi", cat: "Spiritualité & Énergie" },
  { letter: "P", title: "Procrastination", subtitle: "comprendre ses racines profondes et s'en libérer", cat: "Émotions & Psychologie" },
  { letter: "P", title: "Projection psychologique", subtitle: "reconnaître ce qu'on projette sur les autres", cat: "Émotions & Psychologie" },
  { letter: "P", title: "Protection énergétique", subtitle: "se protéger des énergies extérieures envahissantes", cat: "Spiritualité & Énergie" },
  { letter: "P", title: "Psychogénéalogie", subtitle: "libérer les schémas répétitifs transmis par la famille", cat: "Approches & Méthodes" },
  { letter: "P", title: "Psychosomatique", subtitle: "quand le corps exprime ce que l'âme tait", cat: "Corps & Somatique" },
  { letter: "P", title: "PTSD / C-PTSD", subtitle: "trouble de stress post-traumatique simple et complexe", cat: "Blessures & Traumatismes" },
  // Q
  { letter: "Q", title: "Qi Gong & Tai Chi", subtitle: "énergie et mouvement pour harmoniser corps et esprit", cat: "Pratiques & Outils" },
  // R
  { letter: "R", title: "Résilience", subtitle: "développer une force intérieure durable", cat: "Développement Personnel", original: true },
  { letter: "R", title: "Relation à l'argent", subtitle: "les croyances et blessures autour de l'abondance et de la valeur", cat: "Vie & Expériences" },
  { letter: "R", title: "Relation au corps", subtitle: "réconciliation avec son corps, son image et son espace", cat: "Corps & Somatique" },
  { letter: "R", title: "Relation au temps", subtitle: "rapport au passé, au futur et à l'instant présent", cat: "Vie & Expériences" },
  { letter: "R", title: "Relation au travail", subtitle: "sens, identité professionnelle, épuisement et vocation", cat: "Vie & Expériences" },
  { letter: "R", title: "Relations toxiques", subtitle: "les reconnaître et s'en libérer", cat: "Relations & Liens", original: true },
  { letter: "R", title: "Reiki", subtitle: "transmission d'énergie vitale par les mains", cat: "Approches & Méthodes" },
  { letter: "R", title: "Respiration", subtitle: "techniques de respiration pour réguler, libérer et transformer", cat: "Pratiques & Outils" },
  { letter: "R", title: "Rêves", subtitle: "interpréter les rêves comme messages de l'inconscient", cat: "Spiritualité & Énergie" },
  { letter: "R", title: "Rituels de soin", subtitle: "créer des rituels personnels de reconnexion", cat: "Pratiques & Outils" },
  // S
  { letter: "S", title: "Santé mentale", subtitle: "prendre soin de son équilibre émotionnel", cat: "Émotions & Psychologie", original: true },
  { letter: "S", title: "Schémas répétitifs", subtitle: "comprendre et défaire les patterns qui se rejouent sans cesse", cat: "Émotions & Psychologie" },
  { letter: "S", title: "Sécurité émotionnelle", subtitle: "construire une sécurité intérieure stable", cat: "Développement Personnel" },
  { letter: "S", title: "Self-care", subtitle: "prendre soin de soi sans culpabilité", cat: "Pratiques & Outils" },
  { letter: "S", title: "Sensibilité & hypersensibilité", subtitle: "vivre et s'épanouir en tant que personne très sensible", cat: "Identité & Mission" },
  { letter: "S", title: "Sexualité", subtitle: "libérer, comprendre et honorer sa sexualité", cat: "Corps & Somatique" },
  { letter: "S", title: "Shadow Work", subtitle: "le travail de l'ombre - intégrer ce qu'on rejette en soi", cat: "Développement Personnel" },
  { letter: "S", title: "Solitude", subtitle: "apprivoiser la solitude comme espace de croissance", cat: "Vie & Expériences" },
  { letter: "S", title: "Somatique", subtitle: "travail corporel pour libérer les tensions émotionnelles", cat: "Corps & Somatique" },
  { letter: "S", title: "Son & vibrations", subtitle: "bols tibétains, mantras : ce que le son déplace", cat: "Approches & Méthodes" },
  { letter: "S", title: "Spiritualité", subtitle: "développer une pratique spirituelle et pleine conscience", cat: "Spiritualité & Énergie", original: true },
  { letter: "S", title: "Stress", subtitle: "apprendre à réguler le stress quotidien", cat: "Émotions & Psychologie", original: true },
  { letter: "S", title: "Subconscient", subtitle: "explorer les profondeurs qui pilotent nos choix", cat: "Émotions & Psychologie" },
  { letter: "S", title: "Synchronicités", subtitle: "reconnaître les coïncidences significatives comme guidances", cat: "Spiritualité & Énergie" },
  { letter: "S", title: "Syndromes (enfant parentifié, bouc émissaire…)", subtitle: "les rôles familiaux et leurs effets durables", cat: "Blessures & Traumatismes" },
  // T
  { letter: "T", title: "Tantra", subtitle: "énergie, éveil et sexualité sacrée", cat: "Spiritualité & Énergie" },
  { letter: "T", title: "Trahison", subtitle: "après une trahison - confiance brisée et reconstruction", cat: "Blessures & Traumatismes" },
  { letter: "T", title: "Trans-générationnel", subtitle: "héritage familial, répétitions entre générations et libération", cat: "Blessures & Traumatismes" },
  { letter: "T", title: "Traumatisme", subtitle: "traverser les blessures d'enfance : violence, abus, négligence", cat: "Blessures & Traumatismes", original: true },
  { letter: "T", title: "Triggers émotionnels", subtitle: "identifier ses déclencheurs et reprendre le contrôle", cat: "Émotions & Psychologie" },
  { letter: "T", title: "TRE (Tension Release Exercises)", subtitle: "libérer le stress et le trauma stockés par le tremblement corporel", cat: "Approches & Méthodes" },
  // U
  { letter: "U", title: "Unité & connexion universelle", subtitle: "le sentiment d'appartenir à un tout plus grand", cat: "Spiritualité & Énergie" },
  { letter: "U", title: "Urgence chronique", subtitle: "désactiver le mode survie permanent", cat: "Émotions & Psychologie" },
  // V
  { letter: "V", title: "Valeurs", subtitle: "identifier et vivre en accord avec ses valeurs profondes", cat: "Identité & Mission" },
  { letter: "V", title: "Vide existentiel", subtitle: "le sentiment de vide - comprendre et traverser", cat: "Émotions & Psychologie" },
  { letter: "V", title: "Vie intérieure", subtitle: "développer une vie intérieure riche", cat: "Spiritualité & Énergie" },
  { letter: "V", title: "Violence physique", subtitle: "se libérer des violences physiques subies", cat: "Blessures & Traumatismes", original: true },
  { letter: "V", title: "Violence verbale & psychologique", subtitle: "reconnaître les violences psychologiques et s'en libérer", cat: "Blessures & Traumatismes", original: true },
  { letter: "V", title: "Vibrations & fréquences", subtitle: "la science vibratoire - son, eau, pensées et matière (exp. du riz)", cat: "Spiritualité & Énergie" },
  { letter: "V", title: "Visualisation créatrice", subtitle: "techniques de visualisation pour manifester et se transformer", cat: "Pratiques & Outils" },
  { letter: "V", title: "Vulnérabilité", subtitle: "la force paradoxale de la vulnérabilité - Brené Brown et au-delà", cat: "Développement Personnel" },
  // Y
  { letter: "Y", title: "Yoga", subtitle: "yoga comme outil de transformation et de présence", cat: "Pratiques & Outils" },
  // Z
  { letter: "Z", title: "Zones d'ombre culturelles", subtitle: "les tabous collectifs qui conditionnent en silence", cat: "Vie & Expériences" },
]

const CATS = Object.keys(CATEGORIES)

function getFirstLetter(title: string): string {
  const normalized = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return normalized.charAt(0).toUpperCase()
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Page récapitulative avant paiement
const STRIPE_URL = '/signup'

type ShineAvailability = {
  hasTV: boolean
  hasAudible: boolean
  hasShort: boolean
  hasLibrary: boolean
}

export type ShineMap = Record<string, ShineAvailability>

interface EncyclopedieClientProps {
  initialDouleurs?: Douleur[]
  initialShineMap?: ShineMap
}

export default function EncyclopedieClient({ initialDouleurs, initialShineMap }: EncyclopedieClientProps) {
  const [allDouleurs, setAllDouleurs] = useState<Douleur[]>(initialDouleurs ?? [])
  const [search, setSearch] = useState('')
  const [activeLetter, setActiveLetter] = useState('ALL')
  const [activeCat, setActiveCat] = useState('ALL')
  const [loading, setLoading] = useState(!initialDouleurs || initialDouleurs.length === 0)
  const [shineMap, setShineMap] = useState<ShineMap>(initialShineMap ?? {})

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      // Load ALL douleurs from DB (managed via BackOffice)
      const { data } = await supabase
        .from('douleurs')
        .select('*')
        .eq('is_active', true)
        .order('title', { ascending: true })

      if (data && data.length > 0) {
        setAllDouleurs(data as Douleur[])
      }

      // Load shine content links for badges
      const [tvRes, audibleRes, shortsRes, libraryRes] = await Promise.all([
        supabase.from('shine_tv_videos').select('douleur_id').eq('is_published', true).not('douleur_id', 'is', null),
        supabase.from('shine_audible_tracks').select('douleur_id').eq('is_published', true).not('douleur_id', 'is', null),
        supabase.from('shine_shorts').select('douleur_id').eq('is_published', true).not('douleur_id', 'is', null),
        supabase.from('shine_library_books').select('douleur_id').eq('is_published', true).not('douleur_id', 'is', null),
      ])

      const map: Record<string, ShineAvailability> = {}
      const ensure = (id: string) => {
        if (!map[id]) map[id] = { hasTV: false, hasAudible: false, hasShort: false, hasLibrary: false }
      }
      tvRes.data?.forEach((r) => { if (r.douleur_id) { ensure(r.douleur_id); map[r.douleur_id].hasTV = true } })
      audibleRes.data?.forEach((r) => { if (r.douleur_id) { ensure(r.douleur_id); map[r.douleur_id].hasAudible = true } })
      shortsRes.data?.forEach((r) => { if (r.douleur_id) { ensure(r.douleur_id); map[r.douleur_id].hasShort = true } })
      libraryRes.data?.forEach((r) => { if (r.douleur_id) { ensure(r.douleur_id); map[r.douleur_id].hasLibrary = true } })
      setShineMap(map)

      setLoading(false)
    }
    load()
  }, [])

  // Build topics: start from static list, enrich with DB data
  const topics = useMemo(() => {
    // Index DB douleurs by slug for fast lookup
    const dbBySlug: Record<string, Douleur> = {}
    for (const d of allDouleurs) {
      dbBySlug[d.slug] = d
    }

    // Build from static list, enriched with DB data
    const fromStatic = ALL_TOPICS.map((t): Topic => {
      const slug = slugify(t.title)
      const db = dbBySlug[slug]
      return {
        letter: t.letter,
        title: db?.title || t.title,
        subtitle: db?.subtitle || db?.description || t.subtitle,
        cat: db?.category || t.cat,
        original: db?.is_original ?? t.original,
        slug: db?.slug || slug,
        dbMatch: db?.is_published ? db : undefined,
      }
    })

    // Add any DB entries not in the static list
    const staticSlugs = new Set(fromStatic.map(t => t.slug))
    const extraFromDb = allDouleurs
      .filter(d => !staticSlugs.has(d.slug))
      .map((d): Topic => ({
        letter: getFirstLetter(d.title),
        title: d.title,
        subtitle: d.subtitle || d.description || '',
        cat: d.category || '',
        original: d.is_original,
        slug: d.slug,
        dbMatch: d.is_published ? d : undefined,
      }))

    return [...fromStatic, ...extraFromDb].sort((a, b) => a.title.localeCompare(b.title, 'fr'))
  }, [allDouleurs])

  const LETTERS = useMemo(() => [...new Set(topics.map(t => t.letter))].sort(), [topics])

  const filtered = useMemo(() => {
    return topics.filter((t) => {
      const matchSearch = search === '' ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.subtitle.toLowerCase().includes(search.toLowerCase())
      const matchLetter = activeLetter === 'ALL' || t.letter === activeLetter
      const matchCat = activeCat === 'ALL' || t.cat === activeCat
      return matchSearch && matchLetter && matchCat
    })
  }, [topics, search, activeLetter, activeCat])

  const grouped = useMemo(() => {
    const g: Record<string, typeof filtered> = {}
    const sorted = [...filtered].sort((a, b) => {
      const aPublished = !!a.dbMatch
      const bPublished = !!b.dbMatch
      if (aPublished && !bPublished) return -1
      if (!aPublished && bPublished) return 1
      return a.title.localeCompare(b.title)
    })
    sorted.forEach((t) => {
      if (!g[t.letter]) g[t.letter] = []
      g[t.letter].push(t)
    })
    return g
  }, [filtered])

  // Protocoles déjà disponibles (contenu publié) — mis en avant en tête de liste
  const availableTopics = useMemo(
    () => filtered.filter(t => !!t.dbMatch).sort((a, b) => a.title.localeCompare(b.title)),
    [filtered]
  )
  // On n'affiche la section "Disponibles" qu'en vue par défaut (sans recherche ni filtre)
  const isDefaultView = search === '' && activeLetter === 'ALL' && activeCat === 'ALL'

  return (
    <main className="min-h-screen watermark-container bg-[var(--surface)]">
      <div className="watermark" />

      {/* Header bar */}
      <header
        className="px-6 md:px-12 lg:px-20 py-5 flex items-center justify-between border-b border-[var(--border)]"
      >
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/images/logo-shine-transparent.png"
            alt="SOS Shine"
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
            priority
          />
          <span className="font-display text-base font-semibold tracking-tight text-[var(--text-primary)]">
            SOS Shine
          </span>
        </Link>
        <Link
          href={STRIPE_URL}
          className="px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:opacity-90"
          style={{ background: 'var(--brand)', color: 'var(--dark)' }}
        >
          Rejoindre
        </Link>
      </header>

      {/* Hero header */}
      <div
        className="px-6 md:px-12 lg:px-20 pt-10 pb-8"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(180deg, rgba(201,169,97,0.03) 0%, transparent 100%)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <p
            className="text-[11px] tracking-[0.3em] uppercase mb-3 text-[var(--brand)]"
          >
            SOS Shine - Encyclopédie Émotionnelle
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light mb-2" style={{ color: 'var(--text-primary)', lineHeight: 1.1 }}>
            Cartographie Universelle
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {topics.length} sujets &middot; {Object.keys(CATEGORIES).length} catégories
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-8 py-8 space-y-6">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un sujet..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCat('ALL')}
            className="px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
            style={{
              background: activeCat === 'ALL' ? 'rgba(201,169,97,0.12)' : 'transparent',
              border: `1px solid ${activeCat === 'ALL' ? 'var(--brand)' : 'var(--border)'}`,
              color: activeCat === 'ALL' ? 'var(--brand)' : 'var(--text-muted)',
            }}
          >
            Toutes
          </button>
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCat(activeCat === c ? 'ALL' : c)}
              className="px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
              style={{
                background: activeCat === c ? 'rgba(201,169,97,0.12)' : 'transparent',
                border: `1px solid ${activeCat === c ? 'var(--brand)' : 'var(--border)'}`,
                color: activeCat === c ? 'var(--brand)' : 'var(--text-muted)',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Letter filters */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveLetter('ALL')}
            className="w-10 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer"
            style={{
              background: activeLetter === 'ALL' ? 'var(--brand)' : 'transparent',
              border: `1px solid ${activeLetter === 'ALL' ? 'var(--brand)' : 'var(--border)'}`,
              color: activeLetter === 'ALL' ? 'var(--dark)' : 'var(--text-muted)',
            }}
          >
            Tout
          </button>
          {LETTERS.map((l) => (
            <button
              key={l}
              onClick={() => setActiveLetter(activeLetter === l ? 'ALL' : l)}
              className="w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer"
              style={{
                background: activeLetter === l ? 'var(--brand)' : 'transparent',
                border: `1px solid ${activeLetter === l ? 'var(--brand)' : 'var(--border)'}`,
                color: activeLetter === l ? 'var(--dark)' : 'var(--text-muted)',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-[13px] text-[var(--text-muted)]">
            {filtered.length} sujet{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Topics list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl mb-2 text-[var(--text-secondary)]">
              Aucun résultat
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              Modifie ta recherche ou réinitialise les filtres
            </p>
          </div>
        ) : (
          <>
          {/* ─── Disponibles maintenant (en tête, avant le déroulé alphabétique) ─── */}
          {isDefaultView && availableTopics.length > 0 && (
            <section className="mb-12">
              <div className="flex items-baseline gap-4 mb-4">
                <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--success)' }}>
                  Disponibles maintenant
                </h2>
                <div className="flex-1 h-px" style={{ background: 'rgba(85,239,196,0.25)' }} />
                <span className="text-xs text-[var(--text-muted)]">{availableTopics.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableTopics.map((topic, i) => (
                  <Link key={`avail-${i}`} href={`/encyclopedie/${topic.slug}`} className="block">
                    <div
                      className="group rounded-lg p-4 transition-all duration-200 hover:-translate-y-0.5"
                      style={{ background: 'rgba(85,239,196,0.05)', border: '1.5px solid rgba(85,239,196,0.25)', borderLeft: '2px solid rgba(85,239,196,0.5)', cursor: 'pointer' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="font-display text-base font-medium transition-colors group-hover:text-[var(--brand)]" style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>
                            {topic.title}
                          </span>
                          <p className="text-[12px] leading-relaxed mt-1 mb-2 italic text-[var(--text-secondary)]">{topic.subtitle}</p>
                          <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--brand)', opacity: 0.6 }}>{topic.cat}</span>
                        </div>
                        <svg className="w-4 h-4 flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
          <div className="space-y-10">
            {Object.keys(grouped).sort().map((letter) => (
              <div key={letter} id={`letter-${letter}`}>
                {/* Letter header */}
                <div className="flex items-baseline gap-4 mb-4">
                  <h2 className="font-display text-5xl font-light" style={{ color: 'var(--brand)', opacity: 0.8, lineHeight: 1 }}>
                    {letter}
                  </h2>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="text-xs text-[var(--text-muted)]">
                    {grouped[letter].length}
                  </span>
                </div>

                {/* Topic cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {grouped[letter].map((topic, i) => {
                    const hasDbEntry = !!topic.dbMatch

                    const card = (
                      <div
                        className="group rounded-lg p-4 transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          background: hasDbEntry ? 'rgba(85,239,196,0.03)' : 'var(--surface-card)',
                          border: hasDbEntry
                            ? '1.5px solid rgba(85,239,196,0.2)'
                            : '1px solid var(--border)',
                          borderLeft: hasDbEntry ? '2px solid rgba(85,239,196,0.3)' : '2px solid transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="font-display text-base font-medium transition-colors group-hover:text-[var(--brand)]"
                                style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}
                              >
                                {topic.title}
                              </span>
                            </div>
                            <p
                              className="text-[12px] leading-relaxed mb-2 italic text-[var(--text-secondary)]"
                            >
                              {topic.subtitle}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="text-[10px] uppercase tracking-wider"
                                style={{ color: 'var(--brand)', opacity: 0.6 }}
                              >
                                {topic.cat}
                              </span>
                              {/* Shine section badges */}
                              {hasDbEntry && (() => {
                                const avail = shineMap[topic.dbMatch!.id]
                                return (
                                  <div className="flex items-center gap-1.5 ml-auto">
                                    {/* Shine TV */}
                                    <span title="Shine TV" className="inline-flex items-center justify-center w-5 h-5 rounded" style={{ background: avail?.hasTV ? 'rgba(85,239,196,0.15)' : 'rgba(255,255,255,0.03)' }}>
                                      <svg className="w-3 h-3" fill={avail?.hasTV ? '#55EFC4' : 'rgba(255,255,255,0.15)'} viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </span>
                                    {/* Shine Audible */}
                                    <span title="Shine Audible" className="inline-flex items-center justify-center w-5 h-5 rounded" style={{ background: avail?.hasAudible ? 'rgba(116,192,252,0.15)' : 'rgba(255,255,255,0.03)' }}>
                                      <svg className="w-3 h-3" fill={avail?.hasAudible ? '#74C0FC' : 'rgba(255,255,255,0.15)'} viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                                    </span>
                                    {/* Shine Short */}
                                    <span title="Shine Short" className="inline-flex items-center justify-center w-5 h-5 rounded" style={{ background: avail?.hasShort ? 'rgba(201,169,97,0.15)' : 'rgba(255,255,255,0.03)' }}>
                                      <svg className="w-3 h-3" fill={avail?.hasShort ? '#C9A961' : 'rgba(255,255,255,0.15)'} viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" /></svg>
                                    </span>
                                    {/* Shine Librairie */}
                                    <span title="Shine Librairie" className="inline-flex items-center justify-center w-5 h-5 rounded" style={{ background: avail?.hasLibrary ? 'rgba(201,169,97,0.15)' : 'rgba(255,255,255,0.03)' }}>
                                      <svg className="w-3 h-3" fill={avail?.hasLibrary ? 'var(--brand)' : 'rgba(255,255,255,0.15)'} viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" /></svg>
                                    </span>
                                  </div>
                                )
                              })()}
                            </div>
                          </div>
                          {hasDbEntry ? (
 <svg className="w-4 h-4 flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-lg flex-shrink-0" style={{ background: 'rgba(201,169,97,0.08)', color: 'var(--brand)' }}>
                              {getReleaseDate(topic.slug)}
                            </span>
                          )}
                        </div>
                      </div>
                    )

                    return (
                      <Link key={i} href={`/encyclopedie/${topic.slug}`} className="block">
                        {card}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          </>
        )}

        {/* CTA Banner */}
        <div className="rounded-2xl p-8 text-center mt-12" style={{ background: 'rgba(201,169,97,0.06)', border: '1px solid rgba(201,169,97,0.15)' }}>
          <h3 className="font-display text-xl font-semibold mb-2">
            Accédez à tous les protocoles
          </h3>
          <p className="text-sm mb-5 text-[var(--text-secondary)]">
            Vidéos de coaching, soins énergétiques, méditations guidées et exercices pratiques pour chaque challenge émotionnel.
          </p>
          <Link
            href={STRIPE_URL}
            className="inline-block px-8 py-3 rounded-full text-sm font-medium transition-all hover:opacity-90"
            style={{ background: 'var(--brand)', color: 'var(--dark)' }}
          >
            Découvrir les offres
          </Link>
          <p className="text-xs mt-3 text-[var(--text-muted)]">
            Accès illimité à toute l&apos;encyclopédie et la communauté
          </p>
        </div>

        {/* Legend */}
        <div
          className="rounded-xl p-5 flex flex-wrap gap-x-6 gap-y-3 items-center"
          style={{
            background: 'rgba(201,169,97,0.03)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-3 h-3" fill="#55EFC4" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            <span className="text-xs text-[var(--text-secondary)]">Shine TV</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-3 h-3" fill="#74C0FC" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
            <span className="text-xs text-[var(--text-secondary)]">Shine Audible</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-3 h-3" fill="#C9A961" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" /></svg>
            <span className="text-xs text-[var(--text-secondary)]">Shine Short</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-3 h-3" fill="var(--brand)" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" /></svg>
            <span className="text-xs text-[var(--text-secondary)]">Shine Librairie</span>
          </div>
          <span className="text-xs ml-auto text-[var(--text-muted)]">
            {topics.length} sujets au total
          </span>
        </div>

        {/* Contact info */}
        <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(201,169,97,0.04)', border: '1px solid rgba(201,169,97,0.1)' }}>
          <p className="text-sm text-[var(--text-secondary)]">
            Vous ne trouvez pas votre challenge émotionnel ? Nous ajoutons régulièrement de nouvelles pages.
          </p>
          <p className="text-xs mt-1 text-[var(--text-muted)]">
            Contactez-nous à <span className="text-[var(--brand)]">julialaureau@sosshine.com</span>
          </p>
        </div>
      </div>
    </main>
  )
}
