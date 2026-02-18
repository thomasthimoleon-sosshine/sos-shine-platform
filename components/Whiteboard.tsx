'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface WhiteboardProps {
  roomId: string
  userId: string
  userName: string
}

interface ExcalidrawElement {
  id: string
  [key: string]: unknown
}

type ExcalidrawImportedModule = {
  Excalidraw: React.ComponentType<{
    initialData?: { elements?: ExcalidrawElement[] }
    onChange?: (elements: readonly ExcalidrawElement[]) => void
    isCollaborating?: boolean
    theme?: 'dark' | 'light'
    UIOptions?: { canvasActions?: { saveAsImage?: boolean; export?: boolean } }
  }>
}

export default function Whiteboard({ roomId, userId }: WhiteboardProps) {
  const [ExcalidrawComp, setExcalidrawComp] = useState<ExcalidrawImportedModule | null>(null)
  const [loadError, setLoadError] = useState(false)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const elementsRef = useRef<ExcalidrawElement[]>([])
  const isRemoteUpdate = useRef(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Charger Excalidraw dynamiquement
  useEffect(() => {
    let mounted = true
    import('@excalidraw/excalidraw')
      .then((mod) => {
        if (mounted) setExcalidrawComp(mod as unknown as ExcalidrawImportedModule)
      })
      .catch(() => {
        if (mounted) setLoadError(true)
      })
    return () => { mounted = false }
  }, [])

  // Canal Supabase Realtime pour synchroniser le whiteboard
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(`whiteboard:${roomId}`, {
      config: { broadcast: { self: false } },
    })

    channel.on('broadcast', { event: 'wb-update' }, ({ payload }) => {
      const { elements, sender } = payload as { elements: ExcalidrawElement[]; sender: string }
      if (sender === userId) return
      isRemoteUpdate.current = true
      elementsRef.current = elements
    })

    channel.subscribe()
    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [roomId, userId])

  // Envoyer les changements aux autres participants (debounced)
  const handleChange = useCallback((elements: readonly ExcalidrawElement[]) => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false
      return
    }

    elementsRef.current = [...elements]

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'wb-update',
        payload: {
          elements: [...elements],
          sender: userId,
        },
      })
    }, 100)
  }, [userId])

  if (loadError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3"
        style={{ background: 'var(--dark-card)' }}>
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}
          style={{ color: 'var(--text-muted)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Tableau blanc non disponible
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Le module Excalidraw n&apos;est pas installé.
        </p>
      </div>
    )
  }

  if (!ExcalidrawComp) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--dark-card)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Chargement du tableau blanc...</p>
        </div>
      </div>
    )
  }

  const { Excalidraw } = ExcalidrawComp

  return (
    <div className="w-full h-full" style={{ background: '#1e1e1e' }}>
      <Excalidraw
        initialData={{ elements: elementsRef.current }}
        onChange={handleChange}
        isCollaborating={true}
        theme="dark"
        UIOptions={{ canvasActions: { saveAsImage: true, export: false } }}
      />
    </div>
  )
}
