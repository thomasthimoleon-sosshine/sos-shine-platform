'use client'

import { useState } from 'react'
import { BOT_PROFILES } from '@/lib/bots/profiles'

export default function AdminBotsPage() {
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [autoRunning, setAutoRunning] = useState(false)
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  function addLog(msg: string) {
    const time = new Date().toLocaleTimeString('fr-FR')
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50))
  }

  async function seedBots() {
    setLoading(true)
    setStatus('Création des profils...')
    try {
      const res = await fetch('/api/bots/seed', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getBotSecret()}` },
      })
      const data = await res.json()
      if (data.success) {
        setStatus('Profils créés avec succès !')
        addLog(`Seed: ${JSON.stringify(data.results)}`)
      } else {
        setStatus(`Erreur: ${data.error}`)
      }
    } catch (err) {
      setStatus(`Erreur: ${err}`)
    }
    setLoading(false)
  }

  async function triggerPost(action: 'chat' | 'wall') {
    setLoading(true)
    try {
      const res = await fetch('/api/bots/post', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getBotSecret()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (data.success) {
        addLog(`${data.bot}: ${action === 'chat' ? data.message : data.title}`)
      } else {
        addLog(`Erreur: ${data.error}`)
      }
    } catch (err) {
      addLog(`Erreur: ${err}`)
    }
    setLoading(false)
  }

  async function triggerAuto() {
    try {
      const res = await fetch('/api/bots/auto', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getBotSecret()}` },
      })
      const data = await res.json()
      if (data.success) {
        for (const r of data.results) {
          addLog(`[Auto] ${r.bot}: ${r.action} → ${r.status}`)
        }
      }
    } catch (err) {
      addLog(`[Auto] Erreur: ${err}`)
    }
  }

  function startAutoMode() {
    if (autoRunning) return
    setAutoRunning(true)
    addLog('Mode automatique démarré (intervalle: 5-15 min)')
    triggerAuto()

    const id = setInterval(() => {
      const delay = (Math.random() * 10 + 5) * 60 * 1000
      setTimeout(triggerAuto, delay)
    }, 15 * 60 * 1000)

    setIntervalId(id)
  }

  function stopAutoMode() {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
    setAutoRunning(false)
    addLog('Mode automatique arrêté')
  }

  function getBotSecret(): string {
    return (document.getElementById('bot-secret') as HTMLInputElement)?.value || ''
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-semibold mb-2">Gestion des Bots</h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Gérez les membres fictifs qui animent la plateforme.
        </p>
      </div>

      <div className="glass p-6 rounded-xl space-y-4">
        <h2 className="font-display text-lg font-medium">Configuration</h2>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">BOT_SECRET</label>
          <input
            id="bot-secret"
            type="password"
            placeholder="Entrez le BOT_SECRET..."
            className="w-full px-4 py-2.5 rounded-lg text-sm"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">Clé secrète pour authentifier les requêtes bot.</p>
        </div>
        {status && <p className="text-sm" style={{ color: status.includes('Erreur') ? '#ff6b6b' : '#55EFC4' }}>{status}</p>}
      </div>

      <div className="glass p-6 rounded-xl space-y-4">
        <h2 className="font-display text-lg font-medium">Membres fictifs</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {BOT_PROFILES.map(bot => (
            <div key={bot.prenom} className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)' }}>
              <img
                src={bot.avatar_url}
                alt={bot.prenom}
                className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                style={{ border: '2px solid var(--gold)' }}
              />
              <p className="font-medium text-sm">{bot.prenom}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{bot.plan}</p>
            </div>
          ))}
        </div>
        <button
          onClick={seedBots}
          disabled={loading}
          className="px-6 py-2.5 rounded-lg text-sm font-medium"
          style={{ background: 'var(--gold)', color: '#000', opacity: loading ? 0.5 : 1 }}
        >
          {loading ? 'Création...' : 'Créer les profils dans Supabase'}
        </button>
      </div>

      <div className="glass p-6 rounded-xl space-y-4">
        <h2 className="font-display text-lg font-medium">Actions manuelles</h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => triggerPost('chat')}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: 'rgba(85, 239, 196, 0.15)', border: '1px solid rgba(85, 239, 196, 0.3)', color: '#55EFC4' }}
          >
            Envoyer un message chat
          </button>
          <button
            onClick={() => triggerPost('wall')}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: 'rgba(116, 192, 252, 0.15)', border: '1px solid rgba(116, 192, 252, 0.3)', color: '#74C0FC' }}
          >
            Publier sur le mur
          </button>
        </div>
      </div>

      <div className="glass p-6 rounded-xl space-y-4">
        <h2 className="font-display text-lg font-medium">Mode automatique</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Active l'envoi automatique de messages toutes les 5 à 15 minutes. 1-3 messages chat + parfois une publication mur.
        </p>
        <div className="flex gap-3">
          {!autoRunning ? (
            <button
              onClick={startAutoMode}
              className="px-5 py-2.5 rounded-lg text-sm font-medium"
              style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', color: 'var(--gold)' }}
            >
              Démarrer le mode auto
            </button>
          ) : (
            <button
              onClick={stopAutoMode}
              className="px-5 py-2.5 rounded-lg text-sm font-medium"
              style={{ background: 'rgba(255, 107, 107, 0.15)', border: '1px solid rgba(255, 107, 107, 0.3)', color: '#ff6b6b' }}
            >
              Arrêter le mode auto
            </button>
          )}
          <span className="flex items-center text-sm" style={{ color: autoRunning ? '#55EFC4' : 'var(--text-muted)' }}>
            {autoRunning ? '● Actif' : '○ Inactif'}
          </span>
        </div>
      </div>

      <div className="glass p-6 rounded-xl space-y-4">
        <h2 className="font-display text-lg font-medium">Journal d'activité</h2>
        <div className="max-h-64 overflow-y-auto space-y-1 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
          {logs.length === 0 ? (
            <p className="text-[var(--text-muted)]">Aucune activité pour le moment.</p>
          ) : (
            logs.map((log, i) => <p key={i}>{log}</p>)
          )}
        </div>
      </div>
    </div>
  )
}
