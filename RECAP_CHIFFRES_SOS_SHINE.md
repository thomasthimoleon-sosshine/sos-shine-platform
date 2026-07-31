# SOS Shine — Récap complet des chiffres réels
*Données extraites de la base de production (Supabase) et des analytics quiz. Au 31 juillet 2026.*
*Document d'analyse pour l'équipe.*

---

## ⚠️ Avertissement de lecture
Une **campagne de pub payante** a envoyé du trafic directement sur `/ceremonie`. Ces visites **ne sont pas de l'organique** et gonflent artificiellement le trafic total. Là où c'est concerné, c'est signalé. Le "vrai" organique est donc **inférieur** aux chiffres bruts.

---

## 1. TRAFIC DU SITE (table `site_visits`)

| Mesure | Valeur | Ce que ça veut dire |
|---|---|---|
| Visites totales | **3 949** | Nombre total de pages vues (toutes visites cumulées) |
| Visiteurs uniques (depuis le début) | **1 618** | Nombre de personnes différentes venues au moins une fois |
| Visiteurs uniques (30 derniers jours) | **307** | ≈ **10 personnes/jour** en ce moment → trafic très faible |

➡️ **Conclusion : le trafic est faible et récent est en baisse.** ~10 visiteurs/jour alors qu'on poste quotidiennement sur 4 plateformes = le contenu ne se transforme pas en clics vers le site. (Et une partie de ces 1 618 vient de la pub cérémonie → l'organique réel est encore plus bas.)

---

## 2. RÉTENTION DU TRAFIC (combien reviennent)

| Nombre de visites | Nb de personnes | % |
|---|---|---|
| 1 seule fois | **1 139** | **70 %** |
| 2 à 5 fois | 307 | 19 % |
| 6 à 19 fois | ~150 | 9 % |
| 20+ fois (équipe/ultra-fans) | ~22 | 1 % |
| **Total** | **1 618** | 100 % |

➡️ **Conclusion : 70 % des gens voient une seule page et repartent (rebond sec).** La première impression (page d'accueil) ne les accroche pas. 30 % reviennent = il y a un vrai intérêt chez une minorité.

---

## 3. D'OÙ VIENT LE TRAFIC (UTM source)

| Source | Uniques | Ce que ça veut dire |
|---|---|---|
| **(direct) = non taggé** | **1 409 (87 %)** | Liens sans UTM → origine inconnue (+ la pub cérémonie) |
| Instagram | 148 | Seule plateforme qui fait un peu cliquer |
| Facebook | 66 | Marginal |
| **TikTok** | **0** | N'amène aucun visiteur mesurable |
| **YouTube** | **0** | N'amène aucun visiteur mesurable |

➡️ **Conclusion :** (1) On est **aveugle à 87 %** faute de liens taggés. (2) **TikTok et YouTube n'envoient personne sur le site** alors qu'on y poste tous les jours → à traiter comme canaux de notoriété, pas d'acquisition directe. Instagram est le seul canal qui fait cliquer (et encore, faiblement).

---

## 4. PAGES LES PLUS VUES

| Page | Uniques | Remarque |
|---|---|---|
| / (accueil) | 760 | Point d'entrée principal |
| /ceremonie | 383 | ⚠️ **Gonflé par la pub — à ignorer** |
| /login | 250 | Membres qui se reconnectent |
| /signature-emotionnelle (quiz) | 199 | Le quiz |
| /event | 56 | |
| /signup (inscription) | 33 | **Très peu de gens y arrivent** |
| /rejoindre (tarifs) | 23 | **Quasi personne ne voit l'offre** |
| Encyclopédie : abus-sexuels | 41 | Sujet le plus consulté |
| Encyclopédie : amour-propre | 27 | Sujet porteur |
| Encyclopédie : confiance-en-soi | 18 | Sujet porteur |

➡️ **Conclusion :** Le chemin vers l'offre est un goulot d'étranglement : **seulement 23 personnes ont vu la page tarifs, 33 la page d'inscription.** Le problème n'est pas qu'ils refusent de payer — c'est qu'ils n'arrivent jamais jusqu'à l'offre. Sujets aimants pour le contenu : **abus, amour-propre, confiance en soi.**

---

## 5. LE FUNNEL DU QUIZ (analytics quiz)

| Étape | Nombre | Passage |
|---|---|---|
| Démarrent le quiz | **167** | — |
| Finissent le quiz | **63** | 38 % (−62 % abandonnent en route) |
| Donnent leur email | **61** | 97 % ✅ |
| **Deviennent abonnés** | **1** | **1,6 %** 🔴 |

➡️ **Conclusion :** Deux fuites. (1) 62 % abandonnent le quiz avant la fin. (2) **98,4 % des inscrits ne paient jamais** — LA fuite critique.

---

## 6. LE FUNNEL COMPLET (bout en bout)

| Étape | Nombre | % des visiteurs |
|---|---|---|
| Visiteurs uniques | 1 618 | 100 % |
| Démarrent le quiz | 167 | 10 % |
| Donnent leur email | 61 | 3,8 % |
| **Abonnés** | 1 | **0,06 %** |

➡️ **Conclusion :** À 0,06 % de conversion visiteur→abonné, atteindre 500 abonnés demanderait 833 000 visiteurs. **Il faut à la fois plus de trafic ET une bien meilleure conversion à chaque étape.**

---

## 7. LES EMAILS (table `crm_campaign_events`)

- La séquence de 16 emails du quiz (signés Julia) **part correctement, tous les jours.**
- **~33 personnes sur 34 lisent jusqu'au 16e email** sans se désinscrire → **rétention email exceptionnelle.**
- Les anciennes séquences (nurturing abonnés, conversion inscrits) ont été **mises en pause le 25 avril 2026** (migration `pause_old_sequences`) au profit de la séquence quiz V2.
- Le **tracking d'ouverture** vient d'être ajouté (données à venir dans quelques jours).

➡️ **Conclusion majeure :** Les gens **lisent tout** pendant 15 jours mais ne paient pas. Ce n'est **pas** un problème d'intérêt ni d'attention → c'est un problème **d'offre et de passage à l'acte** (saut de prix brutal, pas d'urgence, chemin de paiement mal balisé).

---

## 8. SYNTHÈSE — LES 4 FUITES, DANS L'ORDRE

1. **Trafic quasi nul** (~10 visiteurs/jour) : le contenu social ne se transforme pas en clics. TikTok/YouTube ≈ 0. Liens non taggés à 87 %.
2. **Rebond de 70 %** : la page d'accueil ne capte pas ; seuls 10 % démarrent le quiz.
3. **Funnel vers l'offre désert** : 23 personnes seulement voient les tarifs.
4. **Conversion payant catastrophique** (1,6 % / 0,06 %) alors que l'engagement email est excellent → problème d'offre, pas d'intérêt.

## 9. LES 4 LEVIERS PRIORITAIRES

1. **Tagger tous les liens** (UTM par plateforme) + **envoyer direct au quiz** → arrêter de piloter à l'aveugle.
2. **Réduire le rebond de la home** (promesse claire en 3 s, CTA quiz immédiat) → tripler les leads à trafic constant.
3. **Ouvrir le chemin vers l'offre** : proposer le **33€ (1 protocole)** dès le résultat du quiz, ajouter une **offre datée** dans la séquence email, brancher le paiement dans l'onboarding.
4. **Contenu social sur les sujets aimants** (abus, amour-propre, confiance) renvoyant au quiz taggé.

---
*Chiffres au 31/07/2026. Le tracking d'ouverture des emails et l'attribution UTM (une fois les liens taggés) affineront ce tableau dans les 2 prochaines semaines.*
