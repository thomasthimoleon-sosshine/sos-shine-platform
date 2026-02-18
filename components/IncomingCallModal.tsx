'use client'

import type { IncomingCall } from '@/hooks/useCallNotification'

interface IncomingCallModalProps {
  call: IncomingCall
  onAccept: () => void
  onReject: () => void
}

export default function IncomingCallModal({ call, onAccept, onReject }: IncomingCallModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="rounded-3xl p-8 max-w-sm w-full mx-4 text-center animate-fade-in"
        style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>

        {/* Avatar animé */}
        <div className="relative mx-auto mb-6 w-24 h-24">
          <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: 'var(--gold)' }} />
          <div className="absolute inset-0 rounded-full animate-pulse-slow opacity-30" style={{ background: 'var(--gold)' }} />
          {call.callerAvatar ? (
            <img src={call.callerAvatar} alt={call.callerName}
              className="relative w-24 h-24 rounded-full object-cover" style={{ border: '3px solid var(--gold)' }} />
          ) : (
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)', border: '3px solid var(--gold)' }}>
              {call.callerName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <h2 className="font-display text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          {call.call_type === 'video' ? 'Appel vidéo entrant' : 'Appel audio entrant'}
        </h2>
        <p className="text-base mb-2" style={{ color: 'var(--gold)' }}>
          {call.callerName}
        </p>
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {call.call_type === 'video' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          )}
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {call.call_type === 'video' ? 'Vidéo' : 'Audio'}
          </span>
        </div>

        {/* Boutons */}
        <div className="flex items-center justify-center gap-6">
          {/* Rejeter */}
          <button onClick={onReject}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
            style={{ background: 'rgba(239,68,68,0.9)' }}>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Accepter */}
          <button onClick={onAccept}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
            style={{ background: 'rgba(34,197,94,0.9)' }}>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
