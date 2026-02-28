'use client'

import { useEffect, useState } from 'react'

export default function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [isFounder, setIsFounder] = useState(false)

  useEffect(() => {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return
      import('@/lib/supabase/client').then(({ createClient }) => {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data }) => {
          if (data.user) {
            supabase
              .from('profiles')
              .select('role')
              .eq('id', data.user.id)
              .single()
              .then(({ data: profile }) => {
                if (profile?.role === 'founder') {
                  setIsFounder(true)
                  document.documentElement.classList.add('founder-mode')
                }
              })
          }
        }).catch(() => {})
      }).catch(() => {})
    } catch {}
  }, [])

  useEffect(() => {
    if (isFounder) return

    const handleContextMenu = (e: MouseEvent) => e.preventDefault()

    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [isFounder])

  return <>{children}</>
}
