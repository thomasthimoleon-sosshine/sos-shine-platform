'use client'

import { useEffect, useRef, useCallback } from 'react'

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (domain: string, options: Record<string, unknown>) => JitsiAPI
  }
}

interface JitsiAPI {
  dispose: () => void
  executeCommand: (command: string, ...args: unknown[]) => void
  addEventListener: (event: string, handler: (...args: unknown[]) => void) => void
}

interface JitsiVideoRoomProps {
  roomName: string
  userName: string
  isModerator?: boolean
  onCallEnd?: () => void
}

const JITSI_DOMAIN = 'meet.jit.si'
const SCRIPT_URL = `https://${JITSI_DOMAIN}/external_api.js`

function loadJitsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) { resolve(); return }
    const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`)
    if (existing) { existing.addEventListener('load', () => resolve()); return }

    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Impossible de charger Jitsi'))
    document.head.appendChild(script)
  })
}

export default function JitsiVideoRoom({ roomName, userName, isModerator = false, onCallEnd }: JitsiVideoRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<JitsiAPI | null>(null)

  const cleanup = useCallback(() => {
    if (apiRef.current) {
      apiRef.current.dispose()
      apiRef.current = null
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function init() {
      await loadJitsiScript()
      if (!mounted || !containerRef.current) return

      // Vider le conteneur au cas où
      containerRef.current.innerHTML = ''

      const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
        roomName,
        parentNode: containerRef.current,
        userInfo: { displayName: userName },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableDeepLinking: true,
          prejoinPageEnabled: false,
          disableInviteFunctions: true,
          enableClosePage: false,
          enableWelcomePage: false,
          disableThirdPartyRequests: true,
          // Modération : lobby seulement si modérateur
          ...(isModerator ? { enableLobbyChat: true } : {}),
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_CHROME_EXTENSION_BANNER: false,
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'desktop', 'chat',
            'raisehand', 'tileview', 'hangup',
            ...(isModerator ? ['mute-everyone', 'security', 'participants-pane'] : []),
          ],
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          HIDE_INVITE_MORE_HEADER: true,
          MOBILE_APP_PROMO: false,
        },
      })

      apiRef.current = api

      api.addEventListener('readyToClose', () => {
        cleanup()
        onCallEnd?.()
      })

      // Activer le lobby si modérateur
      if (isModerator) {
        api.addEventListener('videoConferenceJoined', () => {
          api.executeCommand('toggleLobby', true)
        })
      }
    }

    init()
    return () => { mounted = false; cleanup() }
  }, [roomName, userName, isModerator, onCallEnd, cleanup])

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden" style={{ background: 'var(--dark)' }}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
