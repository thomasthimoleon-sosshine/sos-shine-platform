import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

async function getCallerProfile(): Promise<{ role: string } | null> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    return profile as { role: string } | null
  } catch {
    return null
  }
}

function isAdmin(role: string): boolean {
  return role === 'founder' || role === 'admin_content' || role === 'admin_support'
}

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function blogTable(supabase: any) {
  return supabase.from('blog_articles')
}

// GET - list all blog articles
export async function GET() {
  const profile = await getCallerProfile()
  if (!profile || !isAdmin(profile.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await getSupabase()
  const { data, error } = await blogTable(supabase)
    .select('*')
    .order('published_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST - create a new blog article
export async function POST(req: NextRequest) {
  const profile = await getCallerProfile()
  if (!profile || !isAdmin(profile.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const supabase = await getSupabase()

  const { data, error } = await blogTable(supabase)
    .insert({
      slug: body.slug,
      title: body.title,
      subtitle: body.subtitle || '',
      excerpt: body.excerpt || '',
      meta_title: body.meta_title || body.title,
      meta_description: body.meta_description || body.excerpt,
      author_name: body.author_name || 'SOS Shine',
      author_role: body.author_role || '',
      published_at: body.published_at || new Date().toISOString().split('T')[0],
      read_time: body.read_time || 5,
      category: body.category || 'transformation',
      tags: body.tags || [],
      cover_image: body.cover_image || null,
      featured: body.featured || false,
      content: body.content || '',
      is_published: body.is_published ?? true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PUT - update a blog article
export async function PUT(req: NextRequest) {
  const profile = await getCallerProfile()
  if (!profile || !isAdmin(profile.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = await getSupabase()
  const { id, ...updates } = body

  const { data, error } = await blogTable(supabase)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE - delete a blog article
export async function DELETE(req: NextRequest) {
  const profile = await getCallerProfile()
  if (!profile || !isAdmin(profile.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = await getSupabase()
  const { error } = await blogTable(supabase).delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
