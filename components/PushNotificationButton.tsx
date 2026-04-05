'use client'

import { useState, useEffect } from 'react'

export default function PushNotificationButton() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported')
      return
    }
    setPermission(Notification.permission)

    // Clear badge when user opens the app
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge?.()
    }

    // Check if already subscribed
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription()
      setSubscribed(!!sub)
    })
  }, [])

  async function handleSubscribe() {
    if (permission === 'unsupported') return
    setLoading(true)

    try {
      // Register service worker
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        console.error('VAPID public key missing')
        setLoading(false)
        return
      }

      // Request permission
      const perm = await Notification.requestPermission()
      setPermission(perm)

      if (perm !== 'granted') {
        setLoading(false)
        return
      }

      // Subscribe to push
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      })

      // Send subscription to server
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      })

      if (res.ok) {
        setSubscribed(true)
      }
    } catch (err) {
      console.error('Push subscription error:', err)
    }
    setLoading(false)
  }

  async function handleUnsubscribe() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setSubscribed(false)
    } catch (err) {
      console.error('Unsubscribe error:', err)
    }
    setLoading(false)
  }

  if (permission === 'unsupported') return null
  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{
        background: 'rgba(255,107,107,0.08)',
        color: 'var(--text-muted)',
        border: '1px solid rgba(255,107,107,0.15)',
      }}>
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.143 17.082a24.248 24.248 0 005.714 0m-7.03-2.036A11.964 11.964 0 0112 12.75c1.424 0 2.79.248 4.057.703M3.262 14.893A12.005 12.005 0 0112 3.75c3.614 0 6.837 1.595 9.035 4.12" />
        </svg>
        Notifications bloquées dans votre navigateur
      </div>
    )
  }

  return (
    <button
      onClick={subscribed ? handleUnsubscribe : handleSubscribe}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
      style={{
        background: subscribed ? 'rgba(85,239,196,0.1)' : 'rgba(116,192,252,0.1)',
        border: subscribed ? '1px solid rgba(85,239,196,0.25)' : '1px solid rgba(116,192,252,0.25)',
        color: subscribed ? '#55EFC4' : '#74C0FC',
      }}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          {subscribed ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" />
          )}
        </svg>
      )}
      {subscribed ? 'Notifications actives' : 'Activer les notifications'}
    </button>
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
