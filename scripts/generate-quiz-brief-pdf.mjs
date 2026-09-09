#!/usr/bin/env node
/**
 * Génère un PDF professionnel du brief Quiz Signature Émotionnelle
 * Usage: node scripts/generate-quiz-brief-pdf.mjs
 * Output: docs/QUIZ_SIGNATURE_EMOTIONNELLE_PROJET.pdf
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

// ─── Design tokens SOS Shine ────────────────────────────────────────────────
const COLORS = {
  dark: rgb(0.07, 0.07, 0.11),
  darkSoft: rgb(0.11, 0.11, 0.15),
  gold: rgb(0.82, 0.68, 0.42),
  goldLight: rgb(0.91, 0.82, 0.63),
  goldDark: rgb(0.55, 0.43, 0.18),
  white: rgb(1, 1, 1),
  black: rgb(0, 0, 0),
  gray: rgb(0.45, 0.45, 0.5),
  grayLight: rgb(0.75, 0.75, 0.8),
  grayBg: rgb(0.97, 0.97, 0.98),
  greenSoft: rgb(0.9, 0.97, 0.92),
  greenDark: rgb(0.0, 0.55, 0.35),
}

const PAGE = {
  width: 595.28,
  height: 841.89,
  marginLeft: 60,
  marginRight: 60,
  marginTop: 60,
  marginBottom: 60,
}
const CONTENT_WIDTH = PAGE.width - PAGE.marginLeft - PAGE.marginRight

// ─── Helpers de texte ───────────────────────────────────────────────────────
function sanitize(text) {
  // WinAnsi only — remove emoji and special chars that pdf-lib can't handle
  return text
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/\u2192/g, '->')
    .replace(/\u2190/g, '<-')
    .replace(/\u2713/g, 'v')
    .replace(/\u2022/g, '-')
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/\u00ab|\u00bb/g, '"')
    .replace(/\u00a0/g, ' ')
    .replace(/[^\x00-\xFF]/g, '')
}

function wrapText(text, font, size, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let current = ''
  for (const word of words) {
    const test = current ? current + ' ' + word : word
    const width = font.widthOfTextAtSize(test, size)
    if (width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

// ─── PDF Builder ────────────────────────────────────────────────────────────
class PDFBuilder {
  constructor(doc, fontRegular, fontBold, fontItalic) {
    this.doc = doc
    this.fontRegular = fontRegular
    this.fontBold = fontBold
    this.fontItalic = fontItalic
    this.page = null
    this.y = 0
    this.addPage()
  }

  addPage() {
    this.page = this.doc.addPage([PAGE.width, PAGE.height])
    this.y = PAGE.height - PAGE.marginTop
    // Side accent bar
    this.page.drawRectangle({
      x: 0,
      y: 0,
      width: 6,
      height: PAGE.height,
      color: COLORS.gold,
    })
  }

  ensureSpace(needed) {
    if (this.y - needed < PAGE.marginBottom) {
      this.addPage()
    }
  }

  space(amount) {
    this.y -= amount
    if (this.y < PAGE.marginBottom) this.addPage()
  }

  drawText(text, opts = {}) {
    const {
      font = this.fontRegular,
      size = 11,
      color = COLORS.dark,
      x = PAGE.marginLeft,
      maxWidth = CONTENT_WIDTH,
      lineHeight = 1.55,
    } = opts
    const clean = sanitize(text)
    const lines = wrapText(clean, font, size, maxWidth)
    const lineGap = size * lineHeight
    for (const line of lines) {
      this.ensureSpace(lineGap)
      this.page.drawText(line, { x, y: this.y, size, font, color })
      this.y -= lineGap
    }
  }

  title(text, size = 26) {
    this.ensureSpace(size * 2)
    this.space(6)
    const clean = sanitize(text)
    this.page.drawText(clean, {
      x: PAGE.marginLeft,
      y: this.y - size,
      size,
      font: this.fontBold,
      color: COLORS.gold,
    })
    this.y -= size * 1.2
  }

  heading(text, size = 16) {
    this.ensureSpace(size * 3)
    this.space(18)
    // Small gold mark
    this.page.drawRectangle({
      x: PAGE.marginLeft,
      y: this.y - 2,
      width: 20,
      height: 2,
      color: COLORS.gold,
    })
    this.y -= 12
    this.drawText(text, { font: this.fontBold, size, color: COLORS.dark })
    this.space(6)
  }

  subheading(text, size = 12) {
    this.space(8)
    this.drawText(text, { font: this.fontBold, size, color: COLORS.goldDark })
    this.space(4)
  }

  paragraph(text, opts = {}) {
    this.drawText(text, { size: 11, color: COLORS.dark, ...opts })
    this.space(6)
  }

  bullet(text) {
    this.ensureSpace(16)
    const clean = sanitize(text)
    const lines = wrapText(clean, this.fontRegular, 11, CONTENT_WIDTH - 18)
    // Gold dot
    this.page.drawCircle({
      x: PAGE.marginLeft + 4,
      y: this.y - 4,
      size: 2,
      color: COLORS.gold,
    })
    for (let i = 0; i < lines.length; i++) {
      this.ensureSpace(16)
      this.page.drawText(lines[i], {
        x: PAGE.marginLeft + 14,
        y: this.y,
        size: 11,
        font: this.fontRegular,
        color: COLORS.dark,
      })
      this.y -= 16
    }
    this.space(2)
  }

  quote(text) {
    this.space(6)
    this.ensureSpace(60)
    const clean = sanitize(text)
    const lines = wrapText(clean, this.fontItalic, 11, CONTENT_WIDTH - 30)
    const startY = this.y
    // Left gold bar
    this.page.drawRectangle({
      x: PAGE.marginLeft,
      y: this.y - lines.length * 16 - 6,
      width: 3,
      height: lines.length * 16 + 10,
      color: COLORS.gold,
    })
    for (const line of lines) {
      this.ensureSpace(16)
      this.page.drawText(line, {
        x: PAGE.marginLeft + 14,
        y: this.y,
        size: 11,
        font: this.fontItalic,
        color: COLORS.gray,
      })
      this.y -= 16
    }
    this.space(6)
  }

  box(lines, color = COLORS.grayBg) {
    this.space(4)
    const padding = 14
    const lineHeight = 16
    const totalHeight = lines.length * lineHeight + padding * 2
    this.ensureSpace(totalHeight + 10)
    const boxTop = this.y
    const boxBottom = this.y - totalHeight
    this.page.drawRectangle({
      x: PAGE.marginLeft,
      y: boxBottom,
      width: CONTENT_WIDTH,
      height: totalHeight,
      color,
      borderColor: COLORS.gold,
      borderWidth: 0.5,
    })
    this.y -= padding
    for (const line of lines) {
      this.ensureSpace(lineHeight)
      const clean = sanitize(line)
      this.page.drawText(clean, {
        x: PAGE.marginLeft + 14,
        y: this.y - 10,
        size: 11,
        font: this.fontRegular,
        color: COLORS.dark,
      })
      this.y -= lineHeight
    }
    this.y -= padding
    this.space(8)
  }

  table(rows, headerHeight = 22, rowHeight = 22) {
    this.space(4)
    this.ensureSpace((rows.length + 1) * rowHeight + 10)
    const cols = rows[0].length
    const colWidth = CONTENT_WIDTH / cols

    // Header
    this.page.drawRectangle({
      x: PAGE.marginLeft,
      y: this.y - headerHeight,
      width: CONTENT_WIDTH,
      height: headerHeight,
      color: COLORS.gold,
    })
    for (let c = 0; c < cols; c++) {
      this.page.drawText(sanitize(rows[0][c]), {
        x: PAGE.marginLeft + c * colWidth + 8,
        y: this.y - headerHeight + 7,
        size: 10,
        font: this.fontBold,
        color: COLORS.white,
      })
    }
    this.y -= headerHeight

    // Body
    for (let r = 1; r < rows.length; r++) {
      this.ensureSpace(rowHeight)
      if (r % 2 === 0) {
        this.page.drawRectangle({
          x: PAGE.marginLeft,
          y: this.y - rowHeight,
          width: CONTENT_WIDTH,
          height: rowHeight,
          color: COLORS.grayBg,
        })
      }
      for (let c = 0; c < cols; c++) {
        this.page.drawText(sanitize(rows[r][c]), {
          x: PAGE.marginLeft + c * colWidth + 8,
          y: this.y - rowHeight + 7,
          size: 10,
          font: this.fontRegular,
          color: COLORS.dark,
        })
      }
      this.y -= rowHeight
    }
    this.space(8)
  }

  divider() {
    this.space(10)
    this.ensureSpace(10)
    this.page.drawLine({
      start: { x: PAGE.marginLeft, y: this.y },
      end: { x: PAGE.width - PAGE.marginRight, y: this.y },
      thickness: 0.5,
      color: COLORS.grayLight,
    })
    this.space(10)
  }

  footer(pageNum, totalPages) {
    this.page.drawText(sanitize(`SOS Shine - Quiz Signature Emotionnelle - ${pageNum}/${totalPages}`), {
      x: PAGE.marginLeft,
      y: 30,
      size: 8,
      font: this.fontItalic,
      color: COLORS.grayLight,
    })
  }
}

// ─── Contenu du document ────────────────────────────────────────────────────
async function generatePDF() {
  const doc = await PDFDocument.create()
  doc.setTitle('Quiz Signature Emotionnelle - Projet SOS Shine')
  doc.setAuthor('SOS Shine')
  doc.setSubject('Brief projet pour validation Julia')
  doc.setCreator('SOS Shine Platform')

  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique)

  const pdf = new PDFBuilder(doc, fontRegular, fontBold, fontItalic)

  // ─── COUVERTURE ──────────────────────────────────────────────────────────
  pdf.page.drawRectangle({
    x: 0,
    y: PAGE.height - 260,
    width: PAGE.width,
    height: 260,
    color: COLORS.dark,
  })
  pdf.page.drawRectangle({
    x: 0,
    y: PAGE.height - 260,
    width: 6,
    height: 260,
    color: COLORS.gold,
  })
  pdf.page.drawText('SOS SHINE', {
    x: PAGE.marginLeft,
    y: PAGE.height - 110,
    size: 14,
    font: fontBold,
    color: COLORS.gold,
  })
  pdf.page.drawText('PROJET STRATEGIQUE', {
    x: PAGE.marginLeft,
    y: PAGE.height - 130,
    size: 9,
    font: fontRegular,
    color: COLORS.goldLight,
  })
  pdf.page.drawText('Quiz Signature', {
    x: PAGE.marginLeft,
    y: PAGE.height - 180,
    size: 32,
    font: fontBold,
    color: COLORS.white,
  })
  pdf.page.drawText('Emotionnelle', {
    x: PAGE.marginLeft,
    y: PAGE.height - 215,
    size: 32,
    font: fontBold,
    color: COLORS.white,
  })
  pdf.page.drawText('A valider par Julia Laureau', {
    x: PAGE.marginLeft,
    y: PAGE.height - 245,
    size: 11,
    font: fontItalic,
    color: COLORS.goldLight,
  })

  pdf.y = PAGE.height - 310

  // ─── IDÉE EN UNE PHRASE ──────────────────────────────────────────────────
  pdf.heading("L'idee en une phrase", 18)
  pdf.paragraph(
    "Transformer le quiz gratuit actuel en un vrai diagnostic emotionnel de niveau pro, base sur les meilleures techniques mondiales, qui fait dire a la personne \"putain, ils m'ont lu.e\" - et qui sert de porte d'entree vers nos 201 protocoles."
  )

  // ─── POURQUOI ON LE REFAIT ───────────────────────────────────────────────
  pdf.heading('Pourquoi on le refait')
  pdf.paragraph(
    "Le quiz actuel enferme la personne dans un profil basique type \"tu es comme ci / comme ca\" - le style Buzzfeed."
  )
  pdf.subheading('Le probleme')
  pdf.bullet("Ca ne cree pas le declic emotionnel qui pousse a s'inscrire")
  pdf.bullet('Ca ne pointe pas vers des sujets precis de la plateforme')
  pdf.bullet("Ca ne reflete pas la vraie richesse de l'encyclopedie (201 sujets)")

  pdf.subheading("Ce qu'on veut a la place")
  pdf.bullet('Un diagnostic qui touche au coeur')
  pdf.bullet("Qui fait comprendre a la personne pourquoi elle fonctionne comme ca")
  pdf.bullet('Qui lui propose 3 protocoles SOS Shine precis pour commencer')
  pdf.bullet('Qui donne envie de partager le resultat - viralite naturelle')

  // ─── 4 FRAMEWORKS ────────────────────────────────────────────────────────
  pdf.heading('Les 4 frameworks mondiaux utilises')
  pdf.paragraph(
    "Un mix des meilleures techniques reconnues par les meilleurs therapeutes du monde :"
  )

  pdf.subheading('1. Les 5 blessures de l\'ame')
  pdf.paragraph(
    "Lise Bourbeau, best-seller mondial, plus de 4 millions d'exemplaires vendus."
  )
  pdf.bullet('Rejet - Abandon - Humiliation - Trahison - Injustice')

  pdf.subheading('2. Les schemas precoces inadaptes')
  pdf.paragraph(
    "Jeffrey Young, fondateur de la Schema Therapy. Les patterns construits dans l'enfance qui pilotent nos reactions d'adulte."
  )

  pdf.subheading("3. Les styles d'attachement")
  pdf.paragraph(
    'John Bowlby, base de toute la psychologie moderne.'
  )
  pdf.bullet('Secure - Anxieux - Evitant - Desorganise')

  pdf.subheading('4. Les mecanismes de defense')
  pdf.paragraph(
    "Etude Harvard de George Vaillant sur 75 ans."
  )
  pdf.bullet('Fuite - Controle - Somatisation - Agression - Gel')

  pdf.space(6)
  pdf.box([
    'Ces 4 frameworks sont universels.',
    'Ils fonctionnent pour les hommes, les femmes, les ados,',
    "les parents, les enfants accompagnes. Pas de public enferme.",
  ])

  // ─── 7 AXES ──────────────────────────────────────────────────────────────
  pdf.heading('Les 7 axes que le quiz mesure')
  pdf.paragraph(
    "Chaque question mesure en realite plusieurs dimensions en meme temps. C'est ce qui fait la difference avec un quiz amateur."
  )

  const axes = [
    ['#', 'Axe', 'Ce qu\'on mesure'],
    ['1', 'Emotion dominante', "L'emotion qui pilote sa vie au quotidien"],
    ['2', 'Blessure d\'origine', "La racine posee dans l'enfance"],
    ['3', 'Schema relationnel', 'Comment elle interagit avec les autres'],
    ['4', 'Rapport a soi', "La petite voix interieure (estime, amour propre)"],
    ['5', 'Mode de survie', 'Ce qu\'elle fait quand ca va mal'],
    ['6', 'Zone de vie bloquee', "L'aire de vie qui coince"],
    ['7', 'Besoin profond', 'Ce qui manque vraiment au fond'],
  ]
  pdf.table(axes)
  pdf.paragraph(
    'Ces 7 axes couvrent 95% des douleurs humaines, peu importe l\'age ou le genre.'
  )

  // ─── STRUCTURE ──────────────────────────────────────────────────────────
  pdf.heading('Structure du quiz')
  pdf.bullet('22 questions (ni trop court pour etre serieux, ni trop long)')
  pdf.bullet('Environ 5 minutes a faire')
  pdf.bullet('Chaque question mesure discretement 1 a 3 axes en meme temps')
  pdf.bullet('Barre de progression pour encourager a finir')
  pdf.bullet('Capture email avant le resultat (lead CRM)')

  // ─── LE RÉSULTAT ─────────────────────────────────────────────────────────
  pdf.heading('Le resultat final que recoit la personne')
  pdf.paragraph(
    "Pas une etiquette. Une signature unique composee de ses 4 axes dominants, avec un nom evocateur et neutre qui parle aux hommes comme aux femmes."
  )

  pdf.subheading("Exemples d'archetypes universels")
  pdf.bullet('Le Gardien Epuise - porte tout pour les autres, colere rentree, blessure d\'injustice')
  pdf.bullet("L'Hyper-vigilant - peur de perdre, anxieux, blessure d'abandon")
  pdf.bullet("L'Invisible Lumineux - s'efface, honte, blessure de rejet")
  pdf.bullet('Le Volcan Contenu - explose ou somatise, blessure d\'humiliation')
  pdf.bullet("L'Explorateur Perdu - cherche son sens, blessure de trahison")
  pdf.paragraph(
    'Pas de "La Femme Brisee" ou "Le Male Alpha". Ce sont des archetypes humains, qui parlent a tout le monde.'
  )

  pdf.subheading('Exemple de texte de resultat')
  pdf.box(
    [
      'Votre signature emotionnelle : LE GARDIEN EPUISE',
      '',
      "Vous portez une blessure d'injustice profonde.",
      'Votre emotion dominante est la colere rentree.',
      "Sous stress, vous activez un mode de controle.",
      'Votre zone de vie bloquee : la famille.',
      '',
      'CE QUE CA PRODUIT DANS VOTRE VIE',
      '- Vous portez beaucoup pour les autres',
      "- Vous avez du mal a demander de l'aide",
      '- Vous ressentez une tension chronique sans savoir pourquoi',
      "- Vous avez l'impression de ne jamais en faire assez",
      '',
      'CE QUI SE PASSE VRAIMENT',
      'Votre cerveau a appris tres tot que la seule maniere',
      "d'etre en securite etait de tout gerer. La colere que",
      "vous ressentez aujourd'hui n'est pas un defaut - c'est",
      'le signal que vous portez ce qui ne vous appartient plus.',
      '',
      'VOS 3 PREMIERS PROTOCOLES SOS SHINE',
      '1. Injustice (Blessures & Traumatismes)',
      '2. Colere rentree (Emotions & Psychologie)',
      '3. Parentification (Relations & Liens)',
    ],
    COLORS.grayBg
  )

  // ─── LE PONT ─────────────────────────────────────────────────────────────
  pdf.heading('Ce qui est magique : le pont vers la plateforme')
  pdf.paragraph(
    "Chaque resultat renvoie vers 3 sujets reels de l'encyclopedie (parmi les 201 disponibles), choisis automatiquement en fonction de la signature de la personne."
  )
  pdf.paragraph('Le quiz devient une porte d\'entree personnalisee :')
  pdf.bullet('La personne fait le test - recoit son resultat - voit ses 3 protocoles')
  pdf.bullet("Elle clique sur le premier - arrive sur la plateforme - s'inscrit")
  pdf.bullet('Elle recoit les emails J1, J3, J7, J14 qui la convertissent en abonnee')
  pdf.paragraph(
    "C'est notre machine d'acquisition la plus puissante, 100% gratuite, et virale."
  )

  // ─── CHIFFRES ────────────────────────────────────────────────────────────
  pdf.heading('Les chiffres attendus')

  const stats = [
    ['Indicateur', 'Avant', 'Apres'],
    ['Taux de completion', '~30%', '~70%'],
    ['Capture email', '~15%', '~45%'],
    ['Partage du resultat', '0%', '15-25%'],
    ['Inscription apres quiz', '~3%', '~15%'],
  ]
  pdf.table(stats)
  pdf.paragraph(
    "Ces chiffres sont bases sur les benchmarks des meilleurs quiz du monde (16Personalities, Tony Robbins DISC, Bucket.io)."
  )

  // ─── VALIDATIONS ─────────────────────────────────────────────────────────
  pdf.heading('Ce que Julia doit valider')
  pdf.space(4)
  pdf.subheading('1. Les 4 frameworks choisis')
  pdf.paragraph(
    'Blessures + schemas + attachement + defenses - sont-ils en accord avec ton approche du deconditionnement ?'
  )
  pdf.subheading('2. Les 7 axes mesures')
  pdf.paragraph(
    'Couvrent-ils bien la vision SOS Shine, ou tu veux en ajouter ou en enlever ?'
  )
  pdf.subheading('3. Les noms d\'archetypes neutres')
  pdf.paragraph(
    'Le Gardien, L\'Hyper-vigilant, etc. te conviennent, ou tu preferes une autre direction ?'
  )
  pdf.subheading('4. La relecture des 25 archetypes')
  pdf.paragraph(
    "Veux-tu relire et reecrire les textes avec ta plume une fois qu'ils sont prets ? Je les ecris en respectant ton positionnement \"deconditionnement, pas bien-etre\", mais tu restes l'autorite finale sur le ton."
  )
  pdf.subheading('5. Le principe du pont')
  pdf.paragraph(
    "Valides-tu le fait de renvoyer vers 3 protocoles reels de l'encyclopedie a la fin de chaque diagnostic ?"
  )

  // ─── TEMPS DE RÉALISATION ────────────────────────────────────────────────
  pdf.heading('Temps de realisation')
  pdf.paragraph('Une fois valide, le quiz est livre en environ 4 heures de travail :')
  pdf.bullet('1 heure - Mecanique du quiz (questions, scoring, algorithme)')
  pdf.bullet('2 heures - Redaction des 25 archetypes avec leurs textes complets')
  pdf.bullet('1 heure - Nouvelle interface premium + email automatique avec le resultat')

  // ─── RÉSUMÉ FINAL ────────────────────────────────────────────────────────
  pdf.divider()
  pdf.heading('Resume ultra-court')
  pdf.box(
    [
      'On refait le quiz actuel en un diagnostic emotionnel pro,',
      "base sur 4 frameworks mondiaux reconnus, qui mesure",
      '7 dimensions universelles, donne une signature unique',
      'avec un nom evocateur, et pointe vers 3 protocoles reels',
      'de SOS Shine.',
      '',
      "Objectif : une machine d'acquisition virale, gratuite,",
      "qui convertit 5 fois mieux que l'actuel.",
      '',
      'Tu valides ? On y va.',
    ],
    COLORS.grayBg
  )

  // ─── Footer pagination ──────────────────────────────────────────────────
  const pages = doc.getPages()
  pages.forEach((p, i) => {
    p.drawText(sanitize(`SOS Shine - Quiz Signature Emotionnelle - ${i + 1}/${pages.length}`), {
      x: PAGE.marginLeft,
      y: 30,
      size: 8,
      font: fontItalic,
      color: COLORS.grayLight,
    })
  })

  // ─── Write output ────────────────────────────────────────────────────────
  const bytes = await doc.save()
  const outputDir = path.join(process.cwd(), 'docs')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
  const outputPath = path.join(outputDir, 'QUIZ_SIGNATURE_EMOTIONNELLE_PROJET.pdf')
  fs.writeFileSync(outputPath, bytes)

  console.log(`PDF generated: ${outputPath}`)
  console.log(`Size: ${(bytes.length / 1024).toFixed(1)} KB`)
  console.log(`Pages: ${pages.length}`)
}

generatePDF().catch((err) => {
  console.error('PDF generation failed:', err)
  process.exit(1)
})
