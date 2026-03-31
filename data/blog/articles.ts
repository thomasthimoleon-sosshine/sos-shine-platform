export interface BlogArticle {
  slug: string
  title: string
  subtitle: string
  excerpt: string
  metaTitle: string
  metaDescription: string
  author: {
    name: string
    role: string
    avatar?: string
  }
  publishedAt: string
  updatedAt?: string
  readTime: number
  category: string
  tags: string[]
  coverImage?: string
  featured: boolean
  content: string
  contentType?: 'markdown' | 'html'
}

export const BLOG_CATEGORIES = [
  { slug: 'transformation', label: 'Transformation', color: '#D4AF37' },
  { slug: 'emotions', label: 'Intelligence Emotionnelle', color: '#74C0FC' },
  { slug: 'relations', label: 'Relations', color: '#A29BFE' },
  { slug: 'bien-etre', label: 'Bien-etre', color: '#55EFC4' },
  { slug: 'parentalite', label: 'Parentalite', color: '#FDCB6E' },
  { slug: 'developpement', label: 'Developpement Personnel', color: '#FF6B6B' },
] as const

export const blogArticles: BlogArticle[] = []
