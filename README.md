This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## SOS Meet — landing waitlist (`/sos-meet`)

Landing de validation de concept pour **SOS Meet** (app de rencontres conscientes,
adossée à SOS Shine). Conversion unique : l'inscription à la liste d'attente.

### Fichiers
- `app/sos-meet/` — page, layout (polices Fraunces/Figtree via `next/font`), OG image
- `app/api/sosmeet/waitlist/route.ts` — route serveur (insertion Supabase, anti-spam, rate-limit, honeypot)
- `supabase/schema.sql` — tables `sosmeet_waitlist` + `sosmeet_profiles` (+ RLS)

### Configuration Supabase
1. Exécuter `supabase/schema.sql` dans le SQL editor du projet Supabase.
2. Renseigner `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` (voir `.env.example`).
   La clé service role reste **côté serveur uniquement**.
3. Sans ces variables, la route bascule en **mode simulé** (log console + succès) pour tester l'UI.

### Déploiement Vercel
Rien de spécifique : la page part avec le déploiement de la plateforme.
Définir les variables d'env Supabase dans le projet Vercel.
