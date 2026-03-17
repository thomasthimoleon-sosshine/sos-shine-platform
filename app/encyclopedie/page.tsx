'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Douleur } from '@/types/database'

/* ─── Catégories & couleurs ─── */
const CATEGORIES: Record<string, string> = {
  "Émotions & Psychologie": "#D4AF37",
  "Relations & Liens": "#C9A96E",
  "Blessures & Traumatismes": "#B8860B",
  "Développement Personnel": "#DAA520",
  "Corps & Somatique": "#CD853F",
  "Spiritualité & Énergie": "#FFD700",
  "Soins & Thérapies": "#F0C040",
  "Identité & Mission": "#E8C870",
  "Vie & Expériences": "#D4AF37",
  "Pratiques & Outils": "#C8A951",
}

type Topic = {
  letter: string
  title: string
  subtitle: string
  cat: string
  original?: boolean
  slug?: string
}

/* ─── Liste complète des sujets ─── */
const ALL_TOPICS: Topic[] = [
  // A
  { letter: "A", title: "Abandon", subtitle: "grandir sans père, sans mère ou sans les deux", cat: "Blessures & Traumatismes", original: true },
  { letter: "A", title: "Abus émotionnels", subtitle: "identifier, comprendre et guérir", cat: "Blessures & Traumatismes" },
  { letter: "A", title: "Abus sexuels", subtitle: "identifier, comprendre et guérir", cat: "Blessures & Traumatismes", original: true },
  { letter: "A", title: "Addiction", subtitle: "alcool, drogues, jeux, écrans, travail, sucre", cat: "Émotions & Psychologie" },
  { letter: "A", title: "Adolescence", subtitle: "traverser cette période et en comprendre les blessures", cat: "Vie & Expériences" },
  { letter: "A", title: "Affirmation de soi", subtitle: "assertivité, s'exprimer sans s'effacer", cat: "Développement Personnel" },
  { letter: "A", title: "Âge & vieillissement", subtitle: "accepter le passage du temps et se réinventer", cat: "Vie & Expériences" },
  { letter: "A", title: "Âme", subtitle: "connexion à l'âme, mission de l'âme", cat: "Spiritualité & Énergie" },
  { letter: "A", title: "Amour conditionnel", subtitle: "l'amour conditionnel vs inconditionnel — comprendre la différence", cat: "Relations & Liens" },
  { letter: "A", title: "Amour de soi", subtitle: "développer l'amour et l'estime de soi", cat: "Développement Personnel", original: true },
  { letter: "A", title: "Ancêtres & mémoires ancestrales", subtitle: "héritage familial, messages des lignées", cat: "Spiritualité & Énergie" },
  { letter: "A", title: "Ancrage (Grounding)", subtitle: "se sentir ancré dans son corps, dans le présent", cat: "Corps & Somatique" },
  { letter: "A", title: "Angoisse existentielle", subtitle: "le vide, la mort, le sens — apprivoiser l'angoisse profonde", cat: "Émotions & Psychologie" },
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
  { letter: "A", title: "Ayurveda", subtitle: "médecine ancienne, connaissance des doshas, équilibre naturel", cat: "Soins & Thérapies" },
  // B
  { letter: "B", title: "Blessures de l'âme", subtitle: "les 5 blessures fondamentales selon Lise Bourbeau", cat: "Blessures & Traumatismes" },
  { letter: "B", title: "Blessures relationnelles", subtitle: "les traces que les autres laissent sur notre capacité à aimer", cat: "Blessures & Traumatismes" },
  { letter: "B", title: "Bonheur", subtitle: "construire un bonheur durable, pas dépendant des circonstances", cat: "Développement Personnel" },
  { letter: "B", title: "Breathwork", subtitle: "respiration consciente et holotropique comme outil de guérison", cat: "Soins & Thérapies" },
  { letter: "B", title: "Burnout", subtitle: "comprendre, prévenir et traverser l'épuisement total", cat: "Émotions & Psychologie" },
  { letter: "B", title: "But de vie", subtitle: "trouver sa raison d'être profonde", cat: "Identité & Mission" },
  // C
  { letter: "C", title: "Chakras", subtitle: "les 7 centres énergétiques, leurs déséquilibres et leur activation", cat: "Spiritualité & Énergie" },
  { letter: "C", title: "Champ morphogénétique", subtitle: "l'invisible qui relie et structure tous les êtres vivants", cat: "Spiritualité & Énergie" },
  { letter: "C", title: "Codépendance", subtitle: "perdre soi pour sauver l'autre — comprendre et sortir du cycle", cat: "Relations & Liens" },
  { letter: "C", title: "Cohérence cardiaque", subtitle: "réguler le système nerveux par la respiration cardiaque", cat: "Soins & Thérapies" },
  { letter: "C", title: "Colère", subtitle: "libérer la colère et le ressentiment", cat: "Émotions & Psychologie", original: true },
  { letter: "C", title: "Communication non-violente", subtitle: "CNV — s'exprimer sans blesser, écouter sans se perdre", cat: "Relations & Liens" },
  { letter: "C", title: "Comparaison sociale", subtitle: "sortir du piège des comparaisons permanentes", cat: "Émotions & Psychologie" },
  { letter: "C", title: "Conditionnement", subtitle: "identifier et dépasser les conditionnements de l'enfance", cat: "Blessures & Traumatismes", original: true },
  { letter: "C", title: "Confiance en soi", subtitle: "surmonter les peurs et apprendre à oser", cat: "Développement Personnel", original: true },
  { letter: "C", title: "Congruence", subtitle: "alignement intérieur — penser, ressentir, agir en accord", cat: "Identité & Mission" },
  { letter: "C", title: "Conscience", subtitle: "élargir sa conscience de soi et du monde", cat: "Spiritualité & Énergie" },
  { letter: "C", title: "Constellations familiales", subtitle: "méthode Hellinger — révéler les loyautés et dynamiques cachées", cat: "Soins & Thérapies" },
  { letter: "C", title: "Contrôle", subtitle: "besoin de contrôle, hypercontrôle et chemin vers le lâcher-prise", cat: "Émotions & Psychologie" },
  { letter: "C", title: "Corps & esprit", subtitle: "la connexion fondamentale entre le physique et l'émotionnel", cat: "Corps & Somatique" },
  { letter: "C", title: "Couple", subtitle: "dynamiques, besoins, conflits et épanouissement à deux", cat: "Relations & Liens" },
  { letter: "C", title: "Créativité", subtitle: "libérer la créativité bloquée par la peur du jugement", cat: "Développement Personnel" },
  { letter: "C", title: "Cristaux & lithothérapie", subtitle: "propriétés vibratoires des pierres et usage thérapeutique", cat: "Soins & Thérapies" },
  { letter: "C", title: "Croyances limitantes", subtitle: "identifier et reprogrammer les croyances qui bloquent", cat: "Émotions & Psychologie" },
  { letter: "C", title: "Culpabilité", subtitle: "comprendre la culpabilité saine et toxique", cat: "Émotions & Psychologie" },
  { letter: "C", title: "Cycles de vie", subtitle: "les grandes transitions qui transforment une vie", cat: "Vie & Expériences" },
  { letter: "C", title: "Cycles lunaires", subtitle: "se synchroniser avec les phases de la lune", cat: "Pratiques & Outils" },
  // D
  { letter: "D", title: "Danse-thérapie", subtitle: "le mouvement du corps comme langage de guérison", cat: "Soins & Thérapies" },
  { letter: "D", title: "Décodage biologique", subtitle: "comprendre le message des maladies et symptômes", cat: "Corps & Somatique" },
  { letter: "D", title: "Déni", subtitle: "mécanisme de défense — voir ce qu'on refuse de voir", cat: "Émotions & Psychologie" },
  { letter: "D", title: "Dépendance affective", subtitle: "comprendre et s'en libérer", cat: "Relations & Liens", original: true },
  { letter: "D", title: "Dépression", subtitle: "comprendre et surmonter", cat: "Émotions & Psychologie", original: true },
  { letter: "D", title: "Désirs profonds", subtitle: "retrouver et honorer ses vrais désirs", cat: "Identité & Mission" },
  { letter: "D", title: "Deuil", subtitle: "traverser la perte et faire le deuil d'un proche ou d'une situation", cat: "Vie & Expériences", original: true },
  { letter: "D", title: "Deuil périnatal & infertilité", subtitle: "le deuil de l'enfant attendu, perdu ou impossible", cat: "Vie & Expériences" },
  { letter: "D", title: "Dharma", subtitle: "chemin de vie, mission karmique, raison d'incarnation", cat: "Spiritualité & Énergie" },
  { letter: "D", title: "Disqualification de soi", subtitle: "se minimiser, se dénigrer — origines et guérison", cat: "Émotions & Psychologie" },
  { letter: "D", title: "Dissociation", subtitle: "se déconnecter de soi comme mécanisme de survie", cat: "Émotions & Psychologie" },
  { letter: "D", title: "Divorce & séparation", subtitle: "traverser, comprendre et se reconstruire", cat: "Vie & Expériences" },
  { letter: "D", title: "Douleur chronique", subtitle: "le lien entre corps, émotions et mémoire physique", cat: "Corps & Somatique" },
  { letter: "D", title: "Drama triangle", subtitle: "triangle de Karpman — victime, sauveur, persécuteur", cat: "Relations & Liens" },
  // E
  { letter: "E", title: "EFT (Tapping)", subtitle: "Emotional Freedom Technique — libérer les émotions par les méridiens", cat: "Soins & Thérapies" },
  { letter: "E", title: "EMDR", subtitle: "thérapie par les mouvements oculaires pour traiter les traumatismes", cat: "Soins & Thérapies" },
  { letter: "E", title: "Ego", subtitle: "comprendre l'ego, le dépasser sans le nier", cat: "Spiritualité & Énergie" },
  { letter: "E", title: "Émotions", subtitle: "intelligence émotionnelle, identifier et traverser ses émotions", cat: "Émotions & Psychologie" },
  { letter: "E", title: "Empathie", subtitle: "développer l'empathie et se protéger de l'empathie toxique", cat: "Relations & Liens" },
  { letter: "E", title: "Empowerment", subtitle: "reprendre son pouvoir personnel", cat: "Développement Personnel" },
  { letter: "E", title: "Énergie vitale", subtitle: "prana, chi, ki — comprendre et nourrir sa force de vie", cat: "Spiritualité & Énergie" },
  { letter: "E", title: "Enfant intérieur", subtitle: "se reconnecter et guérir l'enfant blessé en soi", cat: "Blessures & Traumatismes" },
  { letter: "E", title: "Ennéagramme", subtitle: "les 9 types de personnalité et leurs dynamiques profondes", cat: "Pratiques & Outils" },
  { letter: "E", title: "Épigénétique", subtitle: "comment les traumatismes se transmettent d'une génération à l'autre", cat: "Corps & Somatique" },
  { letter: "E", title: "Équilibre vie professionnelle / personnelle", subtitle: "trouver son propre équilibre durable", cat: "Vie & Expériences" },
  { letter: "E", title: "Estime de soi", subtitle: "construire une estime solide et indépendante du regard des autres", cat: "Développement Personnel" },
  { letter: "E", title: "État de flow", subtitle: "entrer dans la zone — performance, créativité, présence totale", cat: "Développement Personnel" },
  { letter: "E", title: "Éveil spirituel", subtitle: "traverser les étapes d'un éveil — comprendre et intégrer", cat: "Spiritualité & Énergie" },
  // F
  { letter: "F", title: "Famille toxique", subtitle: "dynamiques dysfonctionnelles, bouc émissaire, enfant parentifié", cat: "Relations & Liens" },
  { letter: "F", title: "Fascias & mémoire corporelle", subtitle: "comment le corps stocke les émotions dans les tissus", cat: "Corps & Somatique" },
  { letter: "F", title: "Fatigue émotionnelle", subtitle: "adrénaline chronique, épuisement nerveux et reconstruction", cat: "Émotions & Psychologie" },
  { letter: "F", title: "Féminin sacré", subtitle: "retrouver, honorer et incarner le féminin profond", cat: "Spiritualité & Énergie" },
  { letter: "F", title: "Fidélité à soi-même", subtitle: "ne plus trahir ses propres valeurs pour plaire", cat: "Identité & Mission" },
  { letter: "F", title: "Filiation", subtitle: "le lien aux parents et aux ancêtres — honorer sans porter", cat: "Relations & Liens" },
  { letter: "F", title: "Fleurs de Bach", subtitle: "38 élixirs floraux pour équilibrer les états émotionnels", cat: "Soins & Thérapies" },
  { letter: "F", title: "Frontières & limites", subtitle: "poser des limites saines sans culpabilité", cat: "Développement Personnel" },
  { letter: "F", title: "Frustration", subtitle: "comprendre la frustration comme signal de besoins non comblés", cat: "Émotions & Psychologie" },
  // G
  { letter: "G", title: "Gaslighting", subtitle: "manipulation par la distorsion de la réalité — identifier et sortir", cat: "Relations & Liens" },
  { letter: "G", title: "Générosité excessive", subtitle: "donner sans se vider — trouver l'équilibre du don", cat: "Développement Personnel" },
  { letter: "G", title: "Géobiologie", subtitle: "l'influence de l'espace et des lieux sur l'énergie", cat: "Spiritualité & Énergie" },
  { letter: "G", title: "Gratitude", subtitle: "la pratique de la gratitude comme outil de transformation", cat: "Pratiques & Outils" },
  { letter: "G", title: "Guérison", subtitle: "le processus global de guérison — étapes, spirales, rechutes", cat: "Développement Personnel" },
  // H
  { letter: "H", title: "Honte", subtitle: "comprendre et libérer la honte toxique", cat: "Émotions & Psychologie" },
  { letter: "H", title: "Human Design", subtitle: "découvrir son type, son autorité et sa stratégie de vie", cat: "Pratiques & Outils" },
  { letter: "H", title: "Hypervigilance", subtitle: "toujours en alerte — reconnaître et déposer la vigilance excessive", cat: "Émotions & Psychologie" },
  { letter: "H", title: "Hypersensibilité", subtitle: "être HSP — force, défis et épanouissement des âmes sensibles", cat: "Identité & Mission" },
  { letter: "H", title: "Hypnose thérapeutique", subtitle: "travail sur l'inconscient par l'hypnose et la transe", cat: "Soins & Thérapies" },
  // I
  { letter: "I", title: "Identité", subtitle: "construire et affirmer une identité solide et authentique", cat: "Identité & Mission" },
  { letter: "I", title: "Identité de genre & sexualité", subtitle: "explorer, comprendre et accepter sa nature profonde", cat: "Identité & Mission" },
  { letter: "I", title: "Illusions", subtitle: "déconstruire les illusions sur l'amour, la vie, et soi-même", cat: "Développement Personnel" },
  { letter: "I", title: "Incarnation", subtitle: "être pleinement dans son corps, présent à sa vie", cat: "Corps & Somatique" },
  { letter: "I", title: "Inconscient", subtitle: "explorer les mécanismes inconscients qui pilotent notre vie", cat: "Émotions & Psychologie" },
  { letter: "I", title: "Injustice", subtitle: "blessure d'injustice — la colère du juste et la guérison", cat: "Blessures & Traumatismes" },
  { letter: "I", title: "Intuition", subtitle: "se reconnecter à son intuition", cat: "Développement Personnel", original: true },
  { letter: "I", title: "Isolement social", subtitle: "solitude subie, retrait du monde et reconnexion", cat: "Vie & Expériences" },
  // J
  { letter: "J", title: "Jalousie & envie", subtitle: "comprendre la jalousie comme signal d'un besoin", cat: "Émotions & Psychologie" },
  { letter: "J", title: "Joie profonde", subtitle: "cultiver une joie qui ne dépend pas des conditions extérieures", cat: "Développement Personnel" },
  { letter: "J", title: "Journal thérapeutique", subtitle: "journaling comme pratique de connexion à soi", cat: "Pratiques & Outils" },
  { letter: "J", title: "Jugement & regard des autres", subtitle: "se libérer du regard, de l'opinion, de la peur du rejet", cat: "Émotions & Psychologie" },
  { letter: "J", title: "Jung & l'inconscient collectif", subtitle: "archétypes, ombre, synchronicités — l'héritage jungien", cat: "Pratiques & Outils" },
  // K
  { letter: "K", title: "Karma", subtitle: "lois karmiques, schémas répétitifs entre vies et libération", cat: "Spiritualité & Énergie" },
  { letter: "K", title: "Kundalini", subtitle: "énergie serpentine — éveil, montée et intégration", cat: "Spiritualité & Énergie" },
  // L
  { letter: "L", title: "Lâcher-prise", subtitle: "l'art de libérer ce qu'on ne peut pas contrôler", cat: "Développement Personnel" },
  { letter: "L", title: "Leadership personnel", subtitle: "devenir le leader de sa propre vie", cat: "Identité & Mission" },
  { letter: "L", title: "Liberté intérieure", subtitle: "construire une liberté qui vient de l'intérieur", cat: "Développement Personnel" },
  { letter: "L", title: "Loi de l'attraction", subtitle: "vibration, manifestation et co-création avec l'univers", cat: "Spiritualité & Énergie" },
  { letter: "L", title: "Loyautés invisibles", subtitle: "les loyautés familiales inconscientes qui nous retiennent", cat: "Blessures & Traumatismes" },
  { letter: "L", title: "Lucidité onirique", subtitle: "rêves lucides — explorer et transformer depuis le rêve", cat: "Pratiques & Outils" },
  // M
  { letter: "M", title: "Masculin sacré", subtitle: "retrouver, équilibrer et incarner le masculin profond", cat: "Spiritualité & Énergie" },
  { letter: "M", title: "Maternité & identité maternelle", subtitle: "devenir mère, perdre et retrouver soi dans la maternité", cat: "Vie & Expériences" },
  { letter: "M", title: "Manipulation", subtitle: "reconnaître les patterns manipulatoires et s'en protéger", cat: "Relations & Liens" },
  { letter: "M", title: "Mécanismes de défense", subtitle: "les protections inconscientes du psychisme", cat: "Émotions & Psychologie" },
  { letter: "M", title: "Médecine ayurvédique", subtitle: "connaissance de soi par les doshas et l'harmonie naturelle", cat: "Soins & Thérapies" },
  { letter: "M", title: "Médecine traditionnelle chinoise", subtitle: "MTC — méridiens, énergie, organes et émotions", cat: "Soins & Thérapies" },
  { letter: "M", title: "Méditation", subtitle: "pratique, bienfaits, et différentes formes de méditation", cat: "Pratiques & Outils" },
  { letter: "M", title: "Médiumnité & perception extrasensorielle", subtitle: "percevoir au-delà du visible", cat: "Spiritualité & Énergie" },
  { letter: "M", title: "Mémoire cellulaire", subtitle: "les émotions stockées dans les cellules du corps", cat: "Corps & Somatique" },
  { letter: "M", title: "Mémoire traumatique", subtitle: "comment le trauma s'inscrit dans le corps et le cerveau", cat: "Blessures & Traumatismes" },
  { letter: "M", title: "Méridiens énergétiques", subtitle: "les canaux d'énergie du corps et leur influence émotionnelle", cat: "Spiritualité & Énergie" },
  { letter: "M", title: "Mission de vie", subtitle: "trouver sa mission et donner du sens", cat: "Identité & Mission", original: true },
  { letter: "M", title: "Mort & finitude", subtitle: "apprivoiser la mort, réfléchir à la finitude pour mieux vivre", cat: "Vie & Expériences" },
  { letter: "M", title: "Mouvement thérapeutique", subtitle: "se guérir et se libérer par le mouvement du corps", cat: "Corps & Somatique" },
  // N
  { letter: "N", title: "Narcissisme", subtitle: "le pervers narcissique — reconnaître, quitter et se reconstruire", cat: "Relations & Liens" },
  { letter: "N", title: "Neurosciences émotionnelles", subtitle: "comment le cerveau traite les émotions et construit nos réactions", cat: "Émotions & Psychologie" },
  { letter: "N", title: "Neuroplasticité", subtitle: "la capacité du cerveau à se transformer et se recâbler", cat: "Corps & Somatique" },
  { letter: "N", title: "Numérologie", subtitle: "les vibrations des nombres comme clés de connaissance de soi", cat: "Pratiques & Outils" },
  { letter: "N", title: "Régulation du système nerveux", subtitle: "comprendre le SNA, sortir du mode survie", cat: "Corps & Somatique" },
  // O
  { letter: "O", title: "Ombre (Shadow Work)", subtitle: "explorer et intégrer les parts rejetées de soi — héritage de Jung", cat: "Développement Personnel" },
  { letter: "O", title: "Oracle & Tarot", subtitle: "outils de guidance intuitive et de connaissance de soi", cat: "Pratiques & Outils" },
  { letter: "O", title: "Orgasme & sexualité sacrée", subtitle: "tantra, plaisir conscient, énergie sexuelle comme force créatrice", cat: "Corps & Somatique" },
  // P
  { letter: "P", title: "Paix intérieure", subtitle: "construire une paix qui résiste à la tempête", cat: "Développement Personnel" },
  { letter: "P", title: "Pardon", subtitle: "apprendre à pardonner ou à avancer sans pardon", cat: "Développement Personnel", original: true },
  { letter: "P", title: "Parentalité consciente", subtitle: "élever ses enfants en prenant soin de ses propres blessures", cat: "Relations & Liens" },
  { letter: "P", title: "Passage à l'acte", subtitle: "quitter la pensée pour entrer dans l'action", cat: "Développement Personnel" },
  { letter: "P", title: "Perfectionnisme", subtitle: "comprendre le perfectionnisme et s'en libérer", cat: "Émotions & Psychologie" },
  { letter: "P", title: "Peur", subtitle: "comprendre, traverser et transformer toutes les formes de peur", cat: "Émotions & Psychologie" },
  { letter: "P", title: "PNL (Programmation Neuro-Linguistique)", subtitle: "reprogrammer ses réponses automatiques", cat: "Soins & Thérapies" },
  { letter: "P", title: "Pleine conscience (Mindfulness)", subtitle: "vivre dans l'instant présent", cat: "Pratiques & Outils" },
  { letter: "P", title: "Polarités (Yin / Yang)", subtitle: "équilibrer les forces opposées en soi", cat: "Spiritualité & Énergie" },
  { letter: "P", title: "Procrastination", subtitle: "comprendre ses racines profondes et s'en libérer", cat: "Émotions & Psychologie" },
  { letter: "P", title: "Projection psychologique", subtitle: "reconnaître ce qu'on projette sur les autres", cat: "Émotions & Psychologie" },
  { letter: "P", title: "Protection énergétique", subtitle: "se protéger des énergies extérieures envahissantes", cat: "Spiritualité & Énergie" },
  { letter: "P", title: "Psychogénéalogie", subtitle: "libérer les schémas répétitifs transmis par la famille", cat: "Soins & Thérapies" },
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
  { letter: "R", title: "Reiki", subtitle: "transmission d'énergie vitale par les mains", cat: "Soins & Thérapies" },
  { letter: "R", title: "Respiration", subtitle: "techniques de respiration pour réguler, libérer et transformer", cat: "Pratiques & Outils" },
  { letter: "R", title: "Rêves", subtitle: "interpréter les rêves comme messages de l'inconscient", cat: "Spiritualité & Énergie" },
  { letter: "R", title: "Rituels de soin", subtitle: "créer des rituels personnels de reconnexion et de guérison", cat: "Pratiques & Outils" },
  // S
  { letter: "S", title: "Santé mentale", subtitle: "prendre soin de son équilibre émotionnel", cat: "Émotions & Psychologie", original: true },
  { letter: "S", title: "Schémas répétitifs", subtitle: "comprendre et défaire les patterns qui se rejouent sans cesse", cat: "Émotions & Psychologie" },
  { letter: "S", title: "Sécurité émotionnelle", subtitle: "construire une sécurité intérieure stable", cat: "Développement Personnel" },
  { letter: "S", title: "Self-care", subtitle: "prendre soin de soi sans culpabilité", cat: "Pratiques & Outils" },
  { letter: "S", title: "Sensibilité & hypersensibilité", subtitle: "vivre et s'épanouir en tant que personne très sensible", cat: "Identité & Mission" },
  { letter: "S", title: "Sexualité", subtitle: "libérer, comprendre et honorer sa sexualité", cat: "Corps & Somatique" },
  { letter: "S", title: "Shadow Work", subtitle: "le travail de l'ombre — intégrer ce qu'on rejette en soi", cat: "Développement Personnel" },
  { letter: "S", title: "Solitude", subtitle: "apprivoiser la solitude comme espace de croissance", cat: "Vie & Expériences" },
  { letter: "S", title: "Somatique", subtitle: "travail corporel pour libérer les tensions émotionnelles", cat: "Corps & Somatique" },
  { letter: "S", title: "Son & vibrations", subtitle: "sound healing, bols tibétains, mantras, guérison par le son", cat: "Soins & Thérapies" },
  { letter: "S", title: "Spiritualité", subtitle: "développer une pratique spirituelle et pleine conscience", cat: "Spiritualité & Énergie", original: true },
  { letter: "S", title: "Stress", subtitle: "apprendre à réguler le stress quotidien", cat: "Émotions & Psychologie", original: true },
  { letter: "S", title: "Subconscient", subtitle: "explorer les profondeurs qui pilotent nos choix", cat: "Émotions & Psychologie" },
  { letter: "S", title: "Synchronicités", subtitle: "reconnaître les coïncidences significatives comme guidances", cat: "Spiritualité & Énergie" },
  { letter: "S", title: "Syndromes (enfant parentifié, bouc émissaire…)", subtitle: "les rôles familiaux et leurs effets durables", cat: "Blessures & Traumatismes" },
  // T
  { letter: "T", title: "Tantra", subtitle: "énergie, éveil et sexualité sacrée", cat: "Spiritualité & Énergie" },
  { letter: "T", title: "Trahison", subtitle: "guérir d'une trahison — confiance brisée et reconstruction", cat: "Blessures & Traumatismes" },
  { letter: "T", title: "Trans-générationnel", subtitle: "héritage familial, répétitions entre générations et libération", cat: "Blessures & Traumatismes" },
  { letter: "T", title: "Traumatisme", subtitle: "guérir les blessures d'enfance : violence, abus, négligence", cat: "Blessures & Traumatismes", original: true },
  { letter: "T", title: "Triggers émotionnels", subtitle: "identifier ses déclencheurs et reprendre le contrôle", cat: "Émotions & Psychologie" },
  { letter: "T", title: "TRE (Tension Release Exercises)", subtitle: "libérer le stress et le trauma stockés par le tremblement corporel", cat: "Soins & Thérapies" },
  // U
  { letter: "U", title: "Unité & connexion universelle", subtitle: "le sentiment d'appartenir à un tout plus grand", cat: "Spiritualité & Énergie" },
  { letter: "U", title: "Urgence chronique", subtitle: "désactiver le mode survie permanent", cat: "Émotions & Psychologie" },
  // V
  { letter: "V", title: "Valeurs", subtitle: "identifier et vivre en accord avec ses valeurs profondes", cat: "Identité & Mission" },
  { letter: "V", title: "Vide existentiel", subtitle: "le sentiment de vide — comprendre et traverser", cat: "Émotions & Psychologie" },
  { letter: "V", title: "Vie intérieure", subtitle: "développer une vie intérieure riche", cat: "Spiritualité & Énergie" },
  { letter: "V", title: "Violence physique", subtitle: "se libérer des violences physiques subies", cat: "Blessures & Traumatismes", original: true },
  { letter: "V", title: "Violence verbale & psychologique", subtitle: "reconnaître et guérir des violences psychologiques", cat: "Blessures & Traumatismes", original: true },
  { letter: "V", title: "Vibrations & fréquences", subtitle: "la science vibratoire — son, eau, pensées et matière (exp. du riz)", cat: "Spiritualité & Énergie" },
  { letter: "V", title: "Visualisation créatrice", subtitle: "techniques de visualisation pour manifester et guérir", cat: "Pratiques & Outils" },
  { letter: "V", title: "Vulnérabilité", subtitle: "la force paradoxale de la vulnérabilité — Brené Brown et au-delà", cat: "Développement Personnel" },
  // Y
  { letter: "Y", title: "Yoga", subtitle: "yoga comme outil de transformation, de présence et de guérison", cat: "Pratiques & Outils" },
  // Z
  { letter: "Z", title: "Zones d'ombre culturelles", subtitle: "les tabous collectifs qui conditionnent en silence", cat: "Vie & Expériences" },
]

const LETTERS = [...new Set(ALL_TOPICS.map(t => t.letter))].sort()
const CATS = Object.keys(CATEGORIES)

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Page récapitulative avant paiement
const STRIPE_URL = '/rejoindre'

export default function PublicEncyclopediePage() {
  const [douleurs, setDouleurs] = useState<Douleur[]>([])
  const [search, setSearch] = useState('')
  const [activeLetter, setActiveLetter] = useState('ALL')
  const [activeCat, setActiveCat] = useState('ALL')
  const [onlyOriginal, setOnlyOriginal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('douleurs')
        .select('*')
        .eq('is_published', true)
        .order('title', { ascending: true })

      if (data && data.length > 0) {
        setDouleurs(data as Douleur[])
      }
      setLoading(false)
    }
    load()
  }, [])

  // Build a map of slug -> Douleur for linking
  const douleurMap = useMemo(() => {
    const map: Record<string, Douleur> = {}
    douleurs.forEach((d) => {
      map[d.slug] = d
      // Also map by normalized title for fuzzy matching
      map[toSlug(d.title)] = d
    })
    return map
  }, [douleurs])

  // Enrich topics with slug and DB match info
  const enrichedTopics = useMemo(() => {
    return ALL_TOPICS.map((t) => {
      const slug = toSlug(t.title)
      const dbMatch = douleurMap[slug]
      return { ...t, slug, dbMatch }
    })
  }, [douleurMap])

  const filtered = useMemo(() => {
    return enrichedTopics.filter((t) => {
      const matchSearch = search === '' ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.subtitle.toLowerCase().includes(search.toLowerCase())
      const matchLetter = activeLetter === 'ALL' || t.letter === activeLetter
      const matchCat = activeCat === 'ALL' || t.cat === activeCat
      const matchOriginal = !onlyOriginal || t.original
      return matchSearch && matchLetter && matchCat && matchOriginal
    })
  }, [enrichedTopics, search, activeLetter, activeCat, onlyOriginal])

  const grouped = useMemo(() => {
    const g: Record<string, typeof filtered> = {}
    filtered.forEach((t) => {
      if (!g[t.letter]) g[t.letter] = []
      g[t.letter].push(t)
    })
    return g
  }, [filtered])

  const originalCount = ALL_TOPICS.filter(t => t.original).length

  return (
    <main className="min-h-screen watermark-container" style={{ background: 'var(--dark)' }}>
      <div className="watermark" />

      {/* Header bar */}
      <header
        className="px-6 md:px-12 lg:px-20 py-5 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--dark-border)' }}
      >
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/images/logo-shine-transparent.png"
            alt="SOS Shine"
            width={140}
            height={45}
            className="object-contain"
            priority
          />
        </Link>
        <Link
          href={STRIPE_URL}
          className="px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:opacity-90"
          style={{ background: 'var(--gold)', color: 'var(--dark)' }}
        >
          Rejoindre
        </Link>
      </header>

      {/* Hero header */}
      <div
        className="px-6 md:px-12 lg:px-20 pt-10 pb-8"
        style={{
          borderBottom: '1px solid var(--dark-border)',
          background: 'linear-gradient(180deg, rgba(212,175,55,0.03) 0%, transparent 100%)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <p
            className="text-[11px] tracking-[0.3em] uppercase mb-3"
            style={{ color: 'var(--gold)' }}
          >
            SOS Shine — Encyclopédie Émotionnelle
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light mb-2" style={{ color: 'var(--text-primary)', lineHeight: 1.1 }}>
            Cartographie Universelle
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {ALL_TOPICS.length} sujets &middot; {originalCount} originaux &diams; &middot; {Object.keys(CATEGORIES).length} catégories
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-8 py-8 space-y-6">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            style={{ color: 'var(--text-muted)' }}
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
              background: 'var(--dark-card)',
              border: '1px solid var(--dark-border)',
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
              background: activeCat === 'ALL' ? 'rgba(212,175,55,0.12)' : 'transparent',
              border: `1px solid ${activeCat === 'ALL' ? 'var(--gold)' : 'var(--dark-border)'}`,
              color: activeCat === 'ALL' ? 'var(--gold)' : 'var(--text-muted)',
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
                background: activeCat === c ? 'rgba(212,175,55,0.12)' : 'transparent',
                border: `1px solid ${activeCat === c ? 'var(--gold)' : 'var(--dark-border)'}`,
                color: activeCat === c ? 'var(--gold)' : 'var(--text-muted)',
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
              background: activeLetter === 'ALL' ? 'var(--gold)' : 'transparent',
              border: `1px solid ${activeLetter === 'ALL' ? 'var(--gold)' : 'var(--dark-border)'}`,
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
                background: activeLetter === l ? 'var(--gold)' : 'transparent',
                border: `1px solid ${activeLetter === l ? 'var(--gold)' : 'var(--dark-border)'}`,
                color: activeLetter === l ? 'var(--dark)' : 'var(--text-muted)',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Count & original toggle */}
        <div className="flex justify-between items-center">
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} sujet{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
          </p>
          <label className="flex items-center gap-2 cursor-pointer text-[12px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            <input
              type="checkbox"
              checked={onlyOriginal}
              onChange={(e) => setOnlyOriginal(e.target.checked)}
              className="accent-[#D4AF37]"
            />
            <span>&diams; Liste originale uniquement</span>
          </label>
        </div>

        {/* Topics list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl mb-2" style={{ color: 'var(--text-secondary)' }}>
              Aucun résultat
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Modifie ta recherche ou réinitialise les filtres
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.keys(grouped).sort().map((letter) => (
              <div key={letter} id={`letter-${letter}`}>
                {/* Letter header */}
                <div className="flex items-baseline gap-4 mb-4">
                  <h2 className="font-display text-5xl font-light" style={{ color: 'var(--gold)', opacity: 0.8, lineHeight: 1 }}>
                    {letter}
                  </h2>
                  <div className="flex-1 h-px" style={{ background: 'var(--dark-border)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {grouped[letter].length}
                  </span>
                </div>

                {/* Topic cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {grouped[letter].map((topic, i) => {
                    const hasDbEntry = !!topic.dbMatch
                    const hasContent = hasDbEntry && (
                      topic.dbMatch!.video_url ||
                      topic.dbMatch!.audio_energy_url ||
                      topic.dbMatch!.audio_meditation_url
                    )

                    const card = (
                      <div
                        className={`group rounded-lg p-4 transition-all duration-200 ${hasDbEntry ? 'hover:-translate-y-0.5' : ''}`}
                        style={{
                          background: 'var(--dark-card)',
                          border: '1px solid var(--dark-border)',
                          borderLeft: topic.original ? '2px solid var(--gold)' : '2px solid transparent',
                          cursor: hasDbEntry ? 'pointer' : 'default',
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="font-display text-base font-medium transition-colors group-hover:text-[var(--gold)]"
                                style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}
                              >
                                {topic.title}
                              </span>
                              {topic.original && (
                                <span className="text-[11px]" style={{ color: 'var(--gold)' }}>&diams;</span>
                              )}
                            </div>
                            <p
                              className="text-[12px] leading-relaxed mb-2 italic"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {topic.subtitle}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="text-[10px] uppercase tracking-wider"
                                style={{ color: 'var(--gold)', opacity: 0.6 }}
                              >
                                {topic.cat}
                              </span>
                              {/* Content indicators */}
                              {hasContent && (
                                <>
                                  {topic.dbMatch!.video_url && (
                                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(85,239,196,0.1)', color: '#55EFC4' }}>
                                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                      Vidéo
                                    </span>
                                  )}
                                  {topic.dbMatch!.audio_energy_url && (
                                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(116,192,252,0.1)', color: '#74C0FC' }}>
                                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                                      Audio
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          {hasDbEntry ? (
                            <svg className="w-4 h-4 flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-lg flex-shrink-0" style={{ background: 'rgba(212,175,55,0.08)', color: 'var(--gold)' }}>
                              Bientôt
                            </span>
                          )}
                        </div>
                      </div>
                    )

                    if (hasDbEntry) {
                      return (
                        <Link key={i} href={`/encyclopedie/${topic.dbMatch!.slug}`} className="block">
                          {card}
                        </Link>
                      )
                    }

                    return <div key={i}>{card}</div>
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Banner */}
        <div className="rounded-2xl p-8 text-center mt-12" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
          <h3 className="font-display text-xl font-semibold mb-2">
            Accédez à tous les protocoles
          </h3>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
            Vidéos de coaching, soins énergétiques, méditations guidées et exercices pratiques pour chaque challenge émotionnel.
          </p>
          <Link
            href={STRIPE_URL}
            className="inline-block px-8 py-3 rounded-full text-sm font-medium transition-all hover:opacity-90"
            style={{ background: 'var(--gold)', color: 'var(--dark)' }}
          >
            Découvrir les offres
          </Link>
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Accès illimité à toute l&apos;encyclopédie et la communauté
          </p>
        </div>

        {/* Legend */}
        <div
          className="rounded-xl p-5 flex flex-wrap gap-6 items-center"
          style={{
            background: 'rgba(212,175,55,0.03)',
            border: '1px solid var(--dark-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ background: 'var(--gold)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>&diams; Sujet de la liste originale</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ background: 'var(--dark-border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Sujet ajouté</span>
          </div>
          <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
            {ALL_TOPICS.length} sujets au total
          </span>
        </div>

        {/* Contact info */}
        <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Vous ne trouvez pas votre challenge émotionnel ? Nous ajoutons régulièrement de nouvelles pages.
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Contactez-nous à <span style={{ color: 'var(--gold)' }}>julialaureau@sosshine.com</span>
          </p>
        </div>
      </div>
    </main>
  )
}
