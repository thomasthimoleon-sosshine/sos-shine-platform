import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { aujourdhui } from '@/lib/blog-parution'

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : 'https://sosshine.com')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/rejoindre`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/encyclopedie`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/notre-histoire`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/signature-emotionnelle`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/livre-sos-shine`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/livre-supers-pouvoirs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/parents-enfants`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/mentions-legales`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/cgv`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/confidentialite`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Dynamic blog articles
  let blogPages: MetadataRoute.Sitemap = []
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: articles } = await (supabase as any)
      .from('blog_articles')
      .select('slug, updated_at')
      .eq('is_published', true)
      .lte('published_at', aujourdhui())
      .order('updated_at', { ascending: false })

    if (articles) {
      blogPages = articles.map((article: { slug: string; updated_at: string }) => ({
        url: `${siteUrl}/blog/${article.slug}`,
        lastModified: new Date(article.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    }
  } catch {
    // Blog table may not exist yet
  }

  // Dynamic encyclopedia entries
  let encyclopediaPages: MetadataRoute.Sitemap = []
  try {
    const { data: entries } = await supabase
      .from('douleurs')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })

    if (entries) {
      encyclopediaPages = entries.map((entry) => ({
        url: `${siteUrl}/encyclopedie/${entry.slug}`,
        lastModified: new Date(entry.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    }
  } catch {
    // Douleurs table may not exist yet
  }

  return [...staticPages, ...blogPages, ...encyclopediaPages]
}
