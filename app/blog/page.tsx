import { createClient } from '@/lib/supabase/server'
import { blogArticles as staticArticles } from '@/data/blog/articles'
import type { BlogArticle } from '@/data/blog/articles'
import BlogListClient from './BlogListClient'

export default async function BlogPage() {
  let articles: BlogArticle[] = staticArticles

  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('blog_articles')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (data && data.length > 0) {
      const dbArticles: BlogArticle[] = data.map((a: Record<string, unknown>) => ({
        slug: a.slug as string,
        title: a.title as string,
        subtitle: (a.subtitle as string) || '',
        excerpt: (a.excerpt as string) || '',
        metaTitle: (a.meta_title as string) || (a.title as string),
        metaDescription: (a.meta_description as string) || (a.excerpt as string),
        author: { name: (a.author_name as string) || 'SOS Shine', role: (a.author_role as string) || '' },
        publishedAt: (a.published_at as string) || '',
        readTime: (a.read_time as number) || 5,
        category: (a.category as string) || 'transformation',
        tags: (a.tags as string[]) || [],
        coverImage: a.cover_image as string | undefined,
        featured: (a.featured as boolean) || false,
        content: (a.content as string) || '',
        contentType: (a.content_type as 'markdown' | 'html') || 'markdown',
      }))
      const dbSlugs = new Set(dbArticles.map(a => a.slug))
      articles = [...dbArticles, ...staticArticles.filter(a => !dbSlugs.has(a.slug))]
    }
  } catch {
    // Fallback to static articles
  }

  return <BlogListClient initialArticles={articles} />
}
