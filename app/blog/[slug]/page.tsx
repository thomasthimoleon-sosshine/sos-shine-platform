import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { blogArticles } from '@/data/blog/articles'
import type { BlogArticle } from '@/data/blog/articles'
import { createClient } from '@/lib/supabase/server'
import BlogArticleContent from './BlogArticleContent'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return blogArticles.map((article) => ({ slug: article.slug }))
}

async function findArticle(slug: string): Promise<BlogArticle | undefined> {
  // First check static articles
  const staticArticle = blogArticles.find((a) => a.slug === slug)
  if (staticArticle) return staticArticle

  // Then check Supabase
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('blog_articles')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    if (data) {
      return {
        slug: data.slug,
        title: data.title,
        subtitle: data.subtitle || '',
        excerpt: data.excerpt || '',
        metaTitle: data.meta_title || data.title,
        metaDescription: data.meta_description || data.excerpt,
        author: { name: data.author_name || 'SOS Shine', role: data.author_role || '' },
        publishedAt: data.published_at || '',
        readTime: data.read_time || 5,
        category: data.category || 'transformation',
        tags: data.tags || [],
        coverImage: data.cover_image,
        featured: data.featured || false,
        content: data.content || '',
        contentType: data.content_type || 'markdown',
      }
    }
  } catch {
    // DB not available, only static
  }
  return undefined
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await findArticle(slug)
  if (!article) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sosshine.com'

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    keywords: article.tags.join(', '),
    authors: [{ name: article.author.name }],
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      authors: [article.author.name],
      tags: article.tags,
      siteName: 'SOS Shine',
      locale: 'fr_FR',
      url: `${siteUrl}/blog/${article.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle,
      description: article.metaDescription,
    },
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
  }
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await findArticle(slug)

  if (!article) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sosshine.com'

  // JSON-LD Structured Data for SEO and AI citations
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    author: {
      '@type': 'Person',
      name: article.author.name,
      jobTitle: article.author.role,
      worksFor: {
        '@type': 'Organization',
        name: 'SOS Shine',
        url: siteUrl,
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'SOS Shine',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/logo-shine.png`,
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${article.slug}`,
    },
    keywords: article.tags.join(', '),
    wordCount: article.content.split(/\s+/).length,
    articleSection: article.category,
    inLanguage: 'fr',
    isAccessibleForFree: true,
    about: [
      { '@type': 'Thing', name: 'Intelligence emotionnelle' },
      { '@type': 'Thing', name: 'Neurosciences' },
      { '@type': 'Thing', name: 'Transformation personnelle' },
    ],
  }

  // BreadcrumbList for SEO
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${siteUrl}/blog/${article.slug}` },
    ],
  }

  // FAQ Schema from article content (extract FAQ-like sections)
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Pourquoi les emotions ne sont-elles pas le probleme ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Les neurosciences demontrent que les emotions sont essentielles a la prise de decision et au bien-etre. Le Dr Antonio Damasio a prouve que sans cerveau emotionnel fonctionnel, meme les decisions simples deviennent impossibles. Les emotions sont le carburant de la raison, pas son ennemi.',
        },
      },
      {
        '@type': 'Question',
        name: 'Comment transformer sa relation aux emotions ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'La methode SOS Shine suit 4 phases : Accueillir (etre present sans juger), Decoder (comprendre le message de l\'emotion), Liberer (laisser circuler via meditations et soins), et Transformer (creer de nouvelles habitudes). Cette approche corps-emotion-action est basee sur les dernières decouvertes en neurosciences.',
        },
      },
      {
        '@type': 'Question',
        name: 'Combien de temps dure une emotion ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Selon la neuroscientifique Jill Bolte Taylor, une emotion dure environ 90 secondes du declenchement chimique a la dissolution complete. Si elle persiste au-dela, c\'est que le mental la relance en boucle par la rumination.',
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <BlogArticleContent article={article} />
    </>
  )
}
