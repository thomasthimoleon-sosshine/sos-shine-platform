'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { Notification } from '@/types/database'

const READ_STORAGE_KEY = 'sos-shine-read-notifications'

function getLocalReadIds(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_STORAGE_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

function saveLocalReadIds(ids: Set<string>) {
  // Keep only last 200 IDs to avoid localStorage bloat
  const arr = [...ids].slice(-200)
  localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(arr))
}

export default function NotificationBell() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const localReadIdsRef = useRef<Set<string>>(new Set())

  const loadNotifications = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    // Load locally read IDs
    localReadIdsRef.current = getLocalReadIds()

    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        // Merge DB read state with local read state
        const merged = (data as Notification[]).map(n => ({
          ...n,
          is_read: n.is_read || localReadIdsRef.current.has(n.id),
        }))
        setNotifications(merged)
        setUnreadCount(merged.filter(n => !n.is_read).length)
      }
    } catch {
      // Table might not exist yet - silently handle
    }
  }, [])

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [loadNotifications])

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      }, (payload) => {
        const notif = payload.new as Notification
        if (notif.user_id === userId || notif.user_id === null) {
          // Check if already locally read
          const isLocallyRead = localReadIdsRef.current.has(notif.id)
          const merged = { ...notif, is_read: notif.is_read || isLocallyRead }
          setNotifications(prev => [merged, ...prev].slice(0, 20))
          if (!merged.is_read) setUnreadCount(prev => prev + 1)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function markAsRead(id: string) {
    // Save to localStorage for persistence
    localReadIdsRef.current.add(id)
    saveLocalReadIds(localReadIdsRef.current)

    // Also try to update in DB (may fail for global notifications due to RLS)
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)

    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  async function markAllRead() {
    if (!userId) return
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length === 0) return

    // Save all to localStorage
    unreadIds.forEach(id => localReadIdsRef.current.add(id))
    saveLocalReadIds(localReadIdsRef.current)

    // Also try to update in DB
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return t('notifications.just_now')
    if (diffMin < 60) return t('notifications.minutes_ago', { n: diffMin })
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return t('notifications.hours_ago', { n: diffH })
    const diffD = Math.floor(diffH / 24)
    if (diffD < 7) return t('notifications.days_ago', { n: diffD })
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const typeIcons: Record<string, string> = {
    new_douleur: '📖',
    new_event: '📅',
    new_post: '📝',
    new_soin: '✨',
    warning: '⚠️',
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer relative"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        aria-label={t('notifications.title')}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-secondary)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: '#EF4444', color: '#fff' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-80 sm:w-96 max-h-[70vh] rounded-2xl overflow-hidden z-50"
            style={{
              background: 'rgba(15, 15, 18, 0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid var(--dark-border)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--dark-border)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('notifications.title')}</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-medium cursor-pointer transition-colors"
                  style={{ color: 'var(--gold)' }}
                >
                  {t('notifications.mark_all')}
                </button>
              )}
            </div>

            <div className="overflow-y-auto max-h-[calc(70vh-48px)]">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('notifications.empty')}</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="px-4 py-3 transition-colors cursor-pointer"
                    style={{
                      background: notif.is_read ? 'transparent' : 'rgba(212, 175, 55, 0.04)',
                      borderBottom: '1px solid var(--dark-border)',
                    }}
                    onClick={() => {
                      if (!notif.is_read) markAsRead(notif.id)
                      if (notif.link) window.location.href = notif.link
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">{typeIcons[notif.notification_type] || '🔔'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {notif.title}
                          </p>
                          {!notif.is_read && (
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--gold)' }} />
                          )}
                        </div>
                        <p className="text-[12px] mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                          {notif.body}
                        </p>
                        <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                          {formatTime(notif.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
