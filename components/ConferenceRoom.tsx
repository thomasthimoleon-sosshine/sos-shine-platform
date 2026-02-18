'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useWebRTCGroup, type UseWebRTCGroupOptions, type PeerState } from '@/hooks/useWebRTCGroup'
import dynamic from 'next/dynamic'

const Whiteboard = dynamic(() => import('@/components/Whiteboard'), { ssr: false })

// ── Props ──

interface ConferenceRoomProps {
  roomId: string
  userId: string
  userName: string
  userRole: string
  callType?: 'audio' | 'video'
  onLeave: () => void
}

// ── Composant vidéo individuel (évite les re-renders inutiles) ──

function VideoTile({
  stream,
  name,
  role,
  muted,
  isLocal,
  audioEnabled,
  videoEnabled,
}: {
  stream: MediaStream | null
  name: string
  role: string
  muted: boolean
  isLocal: boolean
  audioEnabled: boolean
  videoEnabled: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el || !stream) return
    if (el.srcObject !== stream) {
      el.srcObject = stream
    }
  }, [stream])

  const initials = name.charAt(0).toUpperCase()
  const isFounder = role === 'founder'

  return (
    <div className="relative rounded-2xl overflow-hidden aspect-video"
      style={{ background: '#0a0a0a', border: '1px solid var(--dark-border)' }}>
      {stream && videoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
          style={{ transform: isLocal ? 'scaleX(-1)' : undefined }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display font-semibold"
            style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)' }}>
            {initials}
          </div>
        </div>
      )}

      {/* Overlay info */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center gap-2"
        style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
        <span className="text-xs font-medium text-white truncate">
          {isLocal ? 'Vous' : name}
        </span>
        {isFounder && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(212,175,55,0.3)', color: 'var(--gold)' }}>
            Fondateur
          </span>
        )}
        {!audioEnabled && (
          <svg className="w-3.5 h-3.5 text-red-400 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 19L17.591 17.591L5.409 5.409L4 4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-3.75-6.75V6a3 3 0 00-6 0v6m0 0a3 3 0 01-.879 2.121" />
          </svg>
        )}
      </div>
    </div>
  )
}

// ── Composant principal ──

export default function ConferenceRoom({ roomId, userId, userName, userRole, callType = 'video', onLeave }: ConferenceRoomProps) {
  const [showWhiteboard, setShowWhiteboard] = useState(false)
  const [showModeration, setShowModeration] = useState(false)

  const isAudioOnly = callType === 'audio'
  const rtcOptions: UseWebRTCGroupOptions = { roomId, userId, userName, userRole, callType }
  const {
    localStream,
    peers,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    forceMutePeer,
    forceMuteAll,
    forceDisableVideoPeer,
    leave,
  } = useWebRTCGroup(rtcOptions)

  const isFounder = userRole === 'founder'

  const handleLeave = useCallback(() => {
    leave()
    onLeave()
  }, [leave, onLeave])

  // Grille responsive : colonnes selon le nombre de participants
  const totalTiles = 1 + peers.length
  const gridCols = totalTiles <= 1 ? 'grid-cols-1' :
    totalTiles <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
    totalTiles <= 4 ? 'grid-cols-2' :
    totalTiles <= 6 ? 'grid-cols-2 sm:grid-cols-3' :
    'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'

  return (
    <div className="h-full flex flex-col">
      {/* ── Grille vidéo / Whiteboard ── */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {showWhiteboard ? (
          <div className="w-full h-full">
            <Whiteboard roomId={roomId} userId={userId} userName={userName} />
          </div>
        ) : isAudioOnly ? (
          /* ── Mode appel audio : avatars centrés ── */
          <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-4">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {/* Avatar local */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-display font-semibold ${isAudioEnabled ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-[#0a0a0a]' : ''}`}
                  style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)' }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Vous</span>
                {!isAudioEnabled && (
                  <span className="text-[10px] text-red-400">Micro coupé</span>
                )}
              </div>

              {/* Avatars distants */}
              {peers.map((peer) => (
                <div key={peer.peerId} className="flex flex-col items-center gap-2">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-display font-semibold ${peer.audioEnabled ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-[#0a0a0a]' : ''}`}
                    style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)' }}>
                    {peer.peerName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{peer.peerName}</span>
                  {!peer.audioEnabled && (
                    <span className="text-[10px] text-red-400">Micro coupé</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Appel audio en cours
              </span>
            </div>
          </div>
        ) : (
          <div className={`grid ${gridCols} gap-2 p-2 h-full auto-rows-fr`}>
            {/* Vidéo locale */}
            <VideoTile
              stream={localStream}
              name={userName}
              role={userRole}
              muted={true}
              isLocal={true}
              audioEnabled={isAudioEnabled}
              videoEnabled={isVideoEnabled}
            />

            {/* Vidéos distantes */}
            {peers.map((peer) => (
              <VideoTile
                key={peer.peerId}
                stream={peer.stream}
                name={peer.peerName}
                role={peer.peerRole}
                muted={false}
                isLocal={false}
                audioEnabled={peer.audioEnabled}
                videoEnabled={peer.videoEnabled}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Panneau de modération (fondateur seulement) ── */}
      {isFounder && showModeration && peers.length > 0 && (
        <div className="mx-2 mb-2 rounded-xl p-3 space-y-2"
          style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
              Modération
            </span>
            <button onClick={forceMuteAll}
              className="text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-all"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
              Couper tous les micros
            </button>
          </div>
          <div className="space-y-1.5">
            {peers.map((peer) => (
              <div key={peer.peerId} className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
                    style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)' }}>
                    {peer.peerName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {peer.peerName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => forceMutePeer(peer.peerId)} title="Couper le micro"
                    className="p-1.5 rounded-lg cursor-pointer transition-all"
                    style={{ background: peer.audioEnabled ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)', color: peer.audioEnabled ? '#ef4444' : 'var(--text-muted)' }}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5M12 18.75a6 6 0 01-6-6v-1.5M12 18.75v3.75m-3.75 0h7.5M9 4.5v7.568a3 3 0 006 0V4.5m-6 0a3 3 0 016 0" />
                    </svg>
                  </button>
                  <button onClick={() => forceDisableVideoPeer(peer.peerId)} title="Couper la caméra"
                    className="p-1.5 rounded-lg cursor-pointer transition-all"
                    style={{ background: peer.videoEnabled ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)', color: peer.videoEnabled ? '#ef4444' : 'var(--text-muted)' }}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Barre de contrôle ── */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 px-4 py-3"
        style={{ background: 'var(--dark-card)', borderTop: '1px solid var(--dark-border)' }}>
        {/* Micro */}
        <button onClick={toggleAudio}
          className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all"
          style={{
            background: isAudioEnabled ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.2)',
            color: isAudioEnabled ? 'var(--text-primary)' : '#ef4444',
          }}>
          {isAudioEnabled ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5M12 18.75a6 6 0 01-6-6v-1.5M12 18.75v3.75m-3.75 0h7.5M9 4.5v7.568a3 3 0 006 0V4.5m-6 0a3 3 0 016 0" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-3.75-6.75V6a3 3 0 00-6 0v6m0 0a3 3 0 01-.879 2.121M3 3l18 18" />
            </svg>
          )}
        </button>

        {/* Caméra (masqué en mode audio) */}
        {!isAudioOnly && (
          <button onClick={toggleVideo}
            className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all"
            style={{
              background: isVideoEnabled ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.2)',
              color: isVideoEnabled ? 'var(--text-primary)' : '#ef4444',
            }}>
            {isVideoEnabled ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9M3.75 3.75l16.5 16.5" />
              </svg>
            )}
          </button>
        )}

        {/* Partage d'écran (masqué en mode audio) */}
        {!isAudioOnly && (
          <button onClick={toggleScreenShare}
            className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all"
            style={{
              background: isScreenSharing ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)',
              color: isScreenSharing ? '#22c55e' : 'var(--text-primary)',
            }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
            </svg>
          </button>
        )}

        {/* Tableau blanc */}
        <button onClick={() => setShowWhiteboard(!showWhiteboard)}
          className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all"
          style={{
            background: showWhiteboard ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.08)',
            color: showWhiteboard ? '#60a5fa' : 'var(--text-primary)',
          }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
          </svg>
        </button>

        {/* Modération (fondateur only) */}
        {isFounder && peers.length > 0 && (
          <button onClick={() => setShowModeration(!showModeration)}
            className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all"
            style={{
              background: showModeration ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.08)',
              color: showModeration ? 'var(--gold)' : 'var(--text-primary)',
            }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        )}

        {/* Séparateur */}
        <div className="w-px h-8 mx-1" style={{ background: 'var(--dark-border)' }} />

        {/* Raccrocher */}
        <button onClick={handleLeave}
          className="w-14 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all hover:opacity-90"
          style={{ background: '#ef4444' }}>
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75L18 6m0 0l2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 016.75 2.25H9a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75H6.108a9.747 9.747 0 006.47 6.47V12a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a2.25 2.25 0 01-2.25 2.25h-.372" />
          </svg>
        </button>
      </div>

      {/* Compteur de participants */}
      <div className="text-center py-1">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {1 + peers.length} participant{peers.length > 0 ? 's' : ''} &middot; {isAudioOnly ? 'Audio' : 'Vidéo'} &middot; WebRTC E2EE
        </span>
      </div>
    </div>
  )
}
