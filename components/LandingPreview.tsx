'use client'

import { useState, useRef, useEffect } from 'react'

const DEVICES = [
  { key: 'mobile', label: 'Mobile', width: 375, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg> },
  { key: 'tablet', label: 'Tablette', width: 768, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25V4.5a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z" /></svg> },
  { key: 'desktop', label: 'Ordinateur', width: 1280, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" /></svg> },
]

export default function LandingPreview() {
  const [device, setDevice] = useState('desktop')
  const [open, setOpen] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = DEVICES.find(d => d.key === device) || DEVICES[2]
  const previewUrl = '/'

  // Refresh iframe
  function refresh() {
    setIframeKey(k => k + 1)
  }

  // Calculate scale to fit iframe in container
  const [scale, setScale] = useState(1)
  useEffect(() => {
    if (!open || !containerRef.current) return
    const containerWidth = containerRef.current.clientWidth - 32 // padding
    if (selected.width > containerWidth) {
      setScale(containerWidth / selected.width)
    } else {
      setScale(1)
    }
  }, [open, device, selected.width])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl p-4 text-sm font-medium cursor-pointer flex items-center justify-center gap-3 transition-colors"
        style={{ background: 'rgba(167,139,250,0.04)', border: '1px dashed rgba(167,139,250,0.3)', color: '#A78BFA' }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Ouvrir la previsualisation responsive (Mobile / Tablette / Ordinateur)
      </button>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1">
          {DEVICES.map(d => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDevice(d.key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              style={{
                background: device === d.key ? 'rgba(167,139,250,0.15)' : 'transparent',
                color: device === d.key ? '#A78BFA' : 'var(--text-muted)',
              }}
            >
              {d.icon}
              <span className="hidden sm:inline">{d.label}</span>
              <span className="text-[10px] opacity-60">{d.width}px</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={refresh} className="p-2 rounded-lg cursor-pointer" style={{ color: 'var(--text-muted)' }} title="Rafraichir">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          </button>
          <button type="button"
            onClick={() => window.open(previewUrl, '_blank')}
            className="p-2 rounded-lg cursor-pointer" style={{ color: 'var(--text-muted)' }} title="Ouvrir dans un nouvel onglet">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </button>
          <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-lg cursor-pointer" style={{ color: '#FF6B6B' }} title="Fermer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview container */}
      <div ref={containerRef} className="p-4 flex justify-center" style={{ background: 'rgba(0,0,0,0.3)', minHeight: '500px' }}>
        <div
          style={{
            width: selected.width,
            height: '70vh',
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'top center',
          }}
        >
          <div className="rounded-xl overflow-hidden shadow-2xl h-full" style={{ border: '2px solid var(--border)' }}>
            {/* Device frame header */}
            <div className="flex items-center gap-1.5 px-3 py-2" style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border)' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
              <span className="flex-1 text-center text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                {selected.label} — {selected.width}px
              </span>
            </div>
            <iframe
              key={iframeKey}
              src={previewUrl}
              className="w-full bg-black"
              style={{ height: 'calc(100% - 32px)', border: 'none' }}
              title={`Preview ${selected.label}`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
