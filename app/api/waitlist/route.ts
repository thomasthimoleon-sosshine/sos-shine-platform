import { NextResponse } from 'next/server'
import pg from 'pg'

let pool: pg.Pool | null = null

function getPool() {
  if (pool) return pool
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) return null
  pool = new pg.Pool({ connectionString, max: 5, idleTimeoutMillis: 30000 })
  return pool
}

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const pool = getPool()
    if (!pool) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
    }

    try {
      await pool.query(
        'INSERT INTO waitlist (email, name) VALUES ($1, $2)',
        [email.toLowerCase().trim(), name?.trim() || null]
      )

      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
          || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null)
          || ''
        if (siteUrl) {
          await fetch(`${siteUrl}/api/crm/sequences/enroll`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              trigger_type: 'waitlist',
              email: email.toLowerCase().trim(),
              first_name: name?.trim() || null,
            }),
          })
        }
      } catch {}

      return NextResponse.json({ message: 'success' }, { status: 201 })
    } catch (err: unknown) {
      const pgErr = err as { code?: string }
      if (pgErr.code === '23505') {
        return NextResponse.json({ message: 'already_registered' }, { status: 200 })
      }
      console.error('Waitlist insert error:', err)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const pool = getPool()
    if (!pool) {
      return NextResponse.json({ count: 0 })
    }

    const result = await pool.query('SELECT COUNT(*) as count FROM waitlist')
    return NextResponse.json({ count: parseInt(result.rows[0].count) || 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
