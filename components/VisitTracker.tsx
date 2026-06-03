'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = sessionStorage.getItem('shine_session_id')
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    sessionStorage.setItem('shine_session_id', sid)
  }
  return sid
}

function sendDuration(sessionId: string, pagePath: string, startTime: number) {
  const duration = Math.round((Date.now() - startTime) / 1000)
  if (duration < 2) return
  const payload = JSON.stringify({ session_id: sessionId, page_path: pagePath, duration_seconds: duration })
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/track/duration', new Blob([payload], { type: 'application/json' }))
  } else {
    fetch('/api/track/duration', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {})
  }
}

export default function VisitTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTracked = useRef<string>('')
  const pageStartTime = useRef<number>(Date.now())
  const currentPage = useRef<string>('')

  useEffect(() => {
    if (pathname === lastTracked.current) return
    lastTracked.current = pathname
    if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) return

    // Send duration for previous page before tracking new one
    if (currentPage.current && currentPage.current !== pathname) {
      sendDuration(getSessionId(), currentPage.current, pageStartTime.current)
    }
    currentPage.current = pathname
    pageStartTime.current = Date.now()

    const sessionId = getSessionId()
    const utm = {
      utm_source: searchParams.get('utm_source'),
      utm_medium: searchParams.get('utm_medium'),
      utm_campaign: searchParams.get('utm_campaign'),
      utm_content: searchParams.get('utm_content'),
    }

    const timer = setTimeout(() => {
      fetch('/api/track/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_path: pathname, referrer: document.referrer || null, session_id: sessionId, timestamp: new Date().toISOString(), ...utm }),
      }).catch(() => {})
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  // Send duration on tab close / background
  useEffect(() => {
    const sessionId = getSessionId()

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden' && currentPage.current) {
        sendDuration(sessionId, currentPage.current, pageStartTime.current)
        pageStartTime.current = Date.now() // reset so return visit doesn't double-count
      }
    }
    function handleBeforeUnload() {
      if (currentPage.current) sendDuration(sessionId, currentPage.current, pageStartTime.current)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return null
}
