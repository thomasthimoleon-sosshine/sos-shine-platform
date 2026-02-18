'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── STUN + TURN servers pour le NAT traversal ──
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // TURN relay gratuit Metered — assure la connectivité derrière NAT symétrique / firewalls
  {
    urls: 'turn:a.relay.metered.ca:80',
    username: 'e8dd65e092c0bd94e6b82469',
    credential: '1jHWbndMX/s8pScP',
  },
  {
    urls: 'turn:a.relay.metered.ca:443',
    username: 'e8dd65e092c0bd94e6b82469',
    credential: '1jHWbndMX/s8pScP',
  },
  {
    urls: 'turn:a.relay.metered.ca:443?transport=tcp',
    username: 'e8dd65e092c0bd94e6b82469',
    credential: '1jHWbndMX/s8pScP',
  },
]

// ── Types ──

export interface PeerState {
  peerId: string
  peerName: string
  peerRole: string
  stream: MediaStream
  audioEnabled: boolean
  videoEnabled: boolean
}

interface PresencePayload {
  userId: string
  userName: string
  userRole: string
}

type SignalType = 'offer' | 'answer' | 'ice-candidate' | 'moderation' | 'media-state'

interface SignalPayload {
  type: SignalType
  from: string
  to: string
  fromName?: string
  fromRole?: string
  data: unknown
}

interface ModerationPayload {
  action: 'FORCE_MUTE_MIC' | 'FORCE_MUTE_VIDEO' | 'FORCE_MUTE_ALL_MIC'
  target?: string
}

interface MediaStatePayload {
  audio: boolean
  video: boolean
}

interface PeerConnection {
  pc: RTCPeerConnection
  dataChannel: RTCDataChannel | null
  peerName: string
  peerRole: string
  makingOffer: boolean
  iceCandidateBuffer: RTCIceCandidateInit[]
}

export interface UseWebRTCGroupOptions {
  roomId: string
  userId: string
  userName: string
  userRole: string
  callType?: 'audio' | 'video'
}

export interface UseWebRTCGroupReturn {
  localStream: MediaStream | null
  peers: PeerState[]
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isScreenSharing: boolean
  toggleAudio: () => void
  toggleVideo: () => void
  toggleScreenShare: () => Promise<void>
  forceMutePeer: (peerId: string) => void
  forceMuteAll: () => void
  forceDisableVideoPeer: (peerId: string) => void
  leave: () => void
}

export function useWebRTCGroup(options: UseWebRTCGroupOptions | null): UseWebRTCGroupReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [peers, setPeers] = useState<PeerState[]>([])
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map())
  const localStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options

  // ── Mettre à jour l'état d'un peer ──
  const updatePeerState = useCallback((peerId: string, updates: Partial<PeerState>) => {
    setPeers(prev => prev.map(p => p.peerId === peerId ? { ...p, ...updates } : p))
  }, [])

  // ── Créer un RTCPeerConnection vers un peer ──
  const createPeerConnection = useCallback((peerId: string, peerName: string, peerRole: string): PeerConnection => {
    const opts = optionsRef.current
    if (!opts) throw new Error('Options not available')

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
    const entry: PeerConnection = {
      pc,
      dataChannel: null,
      peerName,
      peerRole,
      makingOffer: false,
      iceCandidateBuffer: [],
    }

    // Ajouter les pistes locales
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!)
      })
    }

    // Recevoir les pistes distantes
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams
      if (!remoteStream) return

      setPeers(prev => {
        const existing = prev.find(p => p.peerId === peerId)
        if (existing) {
          return prev.map(p => p.peerId === peerId ? { ...p, stream: remoteStream } : p)
        }
        return [...prev, {
          peerId,
          peerName,
          peerRole,
          stream: remoteStream,
          audioEnabled: true,
          videoEnabled: true,
        }]
      })
    }

    // ICE candidates → Broadcast via Supabase
    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'signal',
          payload: {
            type: 'ice-candidate',
            from: opts.userId,
            to: peerId,
            data: event.candidate.toJSON(),
          } satisfies SignalPayload,
        })
      }
    }

    // Renegotiation
    pc.onnegotiationneeded = async () => {
      try {
        entry.makingOffer = true
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        channelRef.current?.send({
          type: 'broadcast',
          event: 'signal',
          payload: {
            type: 'offer',
            from: opts.userId,
            to: peerId,
            fromName: opts.userName,
            fromRole: opts.userRole,
            data: pc.localDescription,
          } satisfies SignalPayload,
        })
      } catch (err) {
        console.error('[WebRTC] negotiation error:', err)
      } finally {
        entry.makingOffer = false
      }
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        removePeer(peerId)
      }
    }

    // ── DataChannel pour la modération ──
    const dc = pc.createDataChannel('moderation', { ordered: true })
    dc.onmessage = (event) => handleDataChannelMessage(event, peerId)
    entry.dataChannel = dc

    // Recevoir le DataChannel de l'autre côté
    pc.ondatachannel = (event) => {
      const remoteDc = event.channel
      if (remoteDc.label === 'moderation') {
        remoteDc.onmessage = (ev) => handleDataChannelMessage(ev, peerId)
        entry.dataChannel = remoteDc
      }
    }

    peerConnectionsRef.current.set(peerId, entry)
    return entry
  }, [updatePeerState])

  // ── Gérer un message DataChannel (modération) ──
  const handleDataChannelMessage = useCallback((event: MessageEvent, fromPeerId: string) => {
    try {
      const msg = JSON.parse(event.data) as ModerationPayload
      const peer = peerConnectionsRef.current.get(fromPeerId)

      // Seuls les fondateurs peuvent forcer la modération
      if (!peer || peer.peerRole !== 'founder') return

      if (msg.action === 'FORCE_MUTE_MIC' || msg.action === 'FORCE_MUTE_ALL_MIC') {
        const stream = localStreamRef.current
        if (stream) {
          stream.getAudioTracks().forEach(t => { t.enabled = false })
          setIsAudioEnabled(false)
        }
      }
      if (msg.action === 'FORCE_MUTE_VIDEO') {
        const stream = localStreamRef.current
        if (stream) {
          stream.getVideoTracks().forEach(t => { t.enabled = false })
          setIsVideoEnabled(false)
        }
      }
    } catch { /* ignore invalid JSON */ }
  }, [])

  // ── Supprimer un peer ──
  const removePeer = useCallback((peerId: string) => {
    const entry = peerConnectionsRef.current.get(peerId)
    if (entry) {
      entry.dataChannel?.close()
      entry.pc.close()
      peerConnectionsRef.current.delete(peerId)
    }
    setPeers(prev => prev.filter(p => p.peerId !== peerId))
  }, [])

  // ── Traiter un signal entrant ──
  const handleSignal = useCallback(async (signal: SignalPayload) => {
    const opts = optionsRef.current
    if (!opts || signal.to !== opts.userId) return

    const fromId = signal.from

    if (signal.type === 'offer') {
      let entry = peerConnectionsRef.current.get(fromId)
      if (!entry) {
        entry = createPeerConnection(fromId, signal.fromName || 'Membre', signal.fromRole || 'member')
      }

      const desc = signal.data as RTCSessionDescriptionInit

      // Perfect negotiation : ignorer si on est aussi en train de faire une offre
      // et qu'on a la priorité (userId > fromId)
      const offerCollision = entry.makingOffer || entry.pc.signalingState !== 'stable'
      const isPolite = opts.userId < fromId
      if (offerCollision && !isPolite) return

      await entry.pc.setRemoteDescription(new RTCSessionDescription(desc))

      // Vider le buffer ICE
      for (const candidate of entry.iceCandidateBuffer) {
        await entry.pc.addIceCandidate(new RTCIceCandidate(candidate))
      }
      entry.iceCandidateBuffer = []

      const answer = await entry.pc.createAnswer()
      await entry.pc.setLocalDescription(answer)
      channelRef.current?.send({
        type: 'broadcast',
        event: 'signal',
        payload: {
          type: 'answer',
          from: opts.userId,
          to: fromId,
          fromName: opts.userName,
          fromRole: opts.userRole,
          data: entry.pc.localDescription,
        } satisfies SignalPayload,
      })
    }

    if (signal.type === 'answer') {
      const entry = peerConnectionsRef.current.get(fromId)
      if (!entry) return
      const desc = signal.data as RTCSessionDescriptionInit
      await entry.pc.setRemoteDescription(new RTCSessionDescription(desc))

      // Vider le buffer ICE
      for (const candidate of entry.iceCandidateBuffer) {
        await entry.pc.addIceCandidate(new RTCIceCandidate(candidate))
      }
      entry.iceCandidateBuffer = []
    }

    if (signal.type === 'ice-candidate') {
      const entry = peerConnectionsRef.current.get(fromId)
      if (!entry) return
      const candidate = signal.data as RTCIceCandidateInit

      if (entry.pc.remoteDescription) {
        await entry.pc.addIceCandidate(new RTCIceCandidate(candidate))
      } else {
        entry.iceCandidateBuffer.push(candidate)
      }
    }

    if (signal.type === 'media-state') {
      const state = signal.data as MediaStatePayload
      updatePeerState(fromId, { audioEnabled: state.audio, videoEnabled: state.video })
    }
  }, [createPeerConnection, updatePeerState])

  // ── Diffuser l'état média local à tous les peers ──
  const broadcastMediaState = useCallback((audio: boolean, video: boolean) => {
    const opts = optionsRef.current
    if (!opts || !channelRef.current) return
    peerConnectionsRef.current.forEach((_, peerId) => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'signal',
        payload: {
          type: 'media-state',
          from: opts.userId,
          to: peerId,
          data: { audio, video } satisfies MediaStatePayload,
        } satisfies SignalPayload,
      })
    })
  }, [])

  // ══════════════════════════════════════════════════════
  // Initialisation principale
  // ══════════════════════════════════════════════════════
  useEffect(() => {
    if (!options) return

    const { roomId, userId, userName, userRole } = options
    const supabase = createClient()
    let mounted = true

    const isAudioOnly = options.callType === 'audio'

    async function init() {
      // 1. Capturer le flux local (audio seul ou audio+vidéo)
      if (isAudioOnly) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
          if (!mounted) { stream.getTracks().forEach(t => t.stop()); return }
          localStreamRef.current = stream
          setLocalStream(stream)
          setIsVideoEnabled(false)
        } catch {
          console.error('[WebRTC] No audio available')
          return
        }
      } else {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          })
          if (!mounted) { stream.getTracks().forEach(t => t.stop()); return }
          localStreamRef.current = stream
          setLocalStream(stream)
        } catch (err) {
          console.error('[WebRTC] getUserMedia failed:', err)
          // Tenter audio seul si caméra refusée
          try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            if (!mounted) { audioStream.getTracks().forEach(t => t.stop()); return }
            localStreamRef.current = audioStream
            setLocalStream(audioStream)
            setIsVideoEnabled(false)
          } catch {
            console.error('[WebRTC] No media available')
            return
          }
        }
      }

      // 2. Rejoindre le canal Supabase Realtime (Broadcast + Presence)
      const channel = supabase.channel(`room:${roomId}`, {
        config: { broadcast: { self: false }, presence: { key: userId } },
      })

      channelRef.current = channel

      // Écouter les signaux WebRTC
      channel.on('broadcast', { event: 'signal' }, ({ payload }) => {
        if (!mounted) return
        handleSignal(payload as SignalPayload)
      })

      // Écouter les événements Presence
      channel.on('presence', { event: 'join' }, ({ newPresences }) => {
        if (!mounted) return
        for (const presence of newPresences) {
          const p = presence as unknown as PresencePayload
          if (p.userId === userId) continue

          // Le peer avec le userId le plus petit crée l'offre
          if (userId < p.userId) {
            if (!peerConnectionsRef.current.has(p.userId)) {
              createPeerConnection(p.userId, p.userName, p.userRole)
            }
          }
        }
      })

      channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
        if (!mounted) return
        for (const presence of leftPresences) {
          const p = presence as unknown as PresencePayload
          removePeer(p.userId)
        }
      })

      channel.on('presence', { event: 'sync' }, () => {
        if (!mounted) return
        const state = channel.presenceState()
        for (const key of Object.keys(state)) {
          const presences = state[key] as unknown as PresencePayload[]
          for (const p of presences) {
            if (p.userId === userId) continue
            if (!peerConnectionsRef.current.has(p.userId) && userId < p.userId) {
              createPeerConnection(p.userId, p.userName, p.userRole)
            }
          }
        }
      })

      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId,
            userName,
            userRole,
          } satisfies PresencePayload)
        }
      })
    }

    init()

    // ── Cleanup ──
    return () => {
      mounted = false

      // Fermer toutes les peer connections
      peerConnectionsRef.current.forEach((entry) => {
        entry.dataChannel?.close()
        entry.pc.close()
      })
      peerConnectionsRef.current.clear()
      setPeers([])

      // Stopper les flux
      localStreamRef.current?.getTracks().forEach(t => t.stop())
      localStreamRef.current = null
      setLocalStream(null)

      screenStreamRef.current?.getTracks().forEach(t => t.stop())
      screenStreamRef.current = null
      setIsScreenSharing(false)

      // Quitter le canal Supabase
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [options?.roomId, options?.userId])

  // ══════════════════════════════════════════════════════
  // Contrôles locaux
  // ══════════════════════════════════════════════════════

  const toggleAudio = useCallback(() => {
    const stream = localStreamRef.current
    if (!stream) return
    const newState = !isAudioEnabled
    stream.getAudioTracks().forEach(t => { t.enabled = newState })
    setIsAudioEnabled(newState)
    broadcastMediaState(newState, isVideoEnabled)
  }, [isAudioEnabled, isVideoEnabled, broadcastMediaState])

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current
    if (!stream) return
    const newState = !isVideoEnabled
    stream.getVideoTracks().forEach(t => { t.enabled = newState })
    setIsVideoEnabled(newState)
    broadcastMediaState(isAudioEnabled, newState)
  }, [isAudioEnabled, isVideoEnabled, broadcastMediaState])

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Arrêter le partage : remettre la caméra
      screenStreamRef.current?.getTracks().forEach(t => t.stop())
      screenStreamRef.current = null
      setIsScreenSharing(false)

      const cameraTrack = localStreamRef.current?.getVideoTracks()[0]
      if (cameraTrack) {
        peerConnectionsRef.current.forEach((entry) => {
          const sender = entry.pc.getSenders().find(s => s.track?.kind === 'video')
          sender?.replaceTrack(cameraTrack)
        })
      }
      return
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })
      screenStreamRef.current = screenStream
      setIsScreenSharing(true)

      const screenTrack = screenStream.getVideoTracks()[0]

      // Remplacer la piste vidéo dans tous les senders
      peerConnectionsRef.current.forEach((entry) => {
        const sender = entry.pc.getSenders().find(s => s.track?.kind === 'video')
        sender?.replaceTrack(screenTrack)
      })

      // Quand l'utilisateur arrête le partage via l'UI du navigateur
      screenTrack.onended = () => {
        screenStreamRef.current = null
        setIsScreenSharing(false)
        const cameraTrack = localStreamRef.current?.getVideoTracks()[0]
        if (cameraTrack) {
          peerConnectionsRef.current.forEach((entry) => {
            const sender = entry.pc.getSenders().find(s => s.track?.kind === 'video')
            sender?.replaceTrack(cameraTrack)
          })
        }
      }
    } catch (err) {
      console.error('[WebRTC] Screen share failed:', err)
    }
  }, [isScreenSharing])

  // ══════════════════════════════════════════════════════
  // Modération (fondateur uniquement)
  // ══════════════════════════════════════════════════════

  const sendModerationCommand = useCallback((payload: ModerationPayload) => {
    if (optionsRef.current?.userRole !== 'founder') return
    peerConnectionsRef.current.forEach((entry, peerId) => {
      if (payload.target && payload.target !== peerId) return
      if (entry.dataChannel?.readyState === 'open') {
        entry.dataChannel.send(JSON.stringify(payload))
      }
    })
  }, [])

  const forceMutePeer = useCallback((peerId: string) => {
    sendModerationCommand({ action: 'FORCE_MUTE_MIC', target: peerId })
  }, [sendModerationCommand])

  const forceMuteAll = useCallback(() => {
    sendModerationCommand({ action: 'FORCE_MUTE_ALL_MIC' })
  }, [sendModerationCommand])

  const forceDisableVideoPeer = useCallback((peerId: string) => {
    sendModerationCommand({ action: 'FORCE_MUTE_VIDEO', target: peerId })
  }, [sendModerationCommand])

  const leave = useCallback(() => {
    // Fermer les connections
    peerConnectionsRef.current.forEach((entry) => {
      entry.dataChannel?.close()
      entry.pc.close()
    })
    peerConnectionsRef.current.clear()
    setPeers([])

    // Stopper les flux
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    localStreamRef.current = null
    setLocalStream(null)

    screenStreamRef.current?.getTracks().forEach(t => t.stop())
    screenStreamRef.current = null
    setIsScreenSharing(false)

    // Quitter le canal
    if (channelRef.current) {
      const supabase = createClient()
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }, [])

  return {
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
  }
}
