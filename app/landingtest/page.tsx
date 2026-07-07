'use client'

/**
 * /landingtest — Refonte premium de la landing (accès ADMIN uniquement).
 * Garde de rôle côté client : founder / admin_content / admin_support.
 * Les visiteurs non-admin sont redirigés. Page standalone, sans chrome admin.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LandingTestExperience from './LandingTestExperience'

export default function LandingTestPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'ok'>('checking')

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const role = (data as { role?: string } | null)?.role
      if (role === 'founder' || role === 'admin_content' || role === 'admin_support') {
        setStatus('ok')
      } else {
        router.replace('/dashboard')
      }
    }
    check()
  }, [router])

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF8F3' }}>
        <div className="w-7 h-7 rounded-full animate-spin"
          style={{ border: '2px solid #C9A961', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return <LandingTestExperience />
}
