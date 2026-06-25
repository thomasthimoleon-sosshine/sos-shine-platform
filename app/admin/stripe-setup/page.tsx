'use client'

import { useState } from 'react'

interface PriceResult {
  product_id: string
  price_id: string
  env_var: string
}

export default function StripeSetupPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Record<string, PriceResult> | null>(null)
  const [envBlock, setEnvBlock] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSetup = async () => {
    setLoading(true)
    setError('')
    setResults(null)
    setEnvBlock('')
    setCopied(false)

    try {
      const res = await fetch('/api/stripe/setup-prices', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur inconnue')
        return
      }

      setResults(data.details)
      setEnvBlock(data.env_vars)
    } catch (err) {
      setError(`Erreur réseau: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(envBlock)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8, color: '#C9A961' }}>
        Configuration Stripe - SOS Shine
      </h1>
      <p style={{ color: '#aaa', marginBottom: 32 }}>
        Cette page crée automatiquement tous les produits et prix dans votre compte Stripe,
        puis vous donne les variables d&apos;environnement à ajouter dans Vercel.
      </p>

      {!results && (
        <div style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 12, padding: 32, textAlign: 'center' }}>
          <p style={{ color: '#ccc', marginBottom: 20, fontSize: 16 }}>
            Cliquez sur le bouton ci-dessous pour créer les 9 prix dans Stripe :
          </p>
          <ul style={{ textAlign: 'left', color: '#999', marginBottom: 24, lineHeight: 2 }}>
            <li>Essentielle - Mensuel (9,90 EUR/mois) — ARCHIVÉ</li>
            <li>SOS Shine / Sérénité - Mensuel (29,90 EUR/mois)</li>
            <li>Sérénité - 3 mois, 6 mois, Annuel</li>
            <li>Premium - Mensuel (99,90 EUR/mois)</li>
            <li>Premium - 3 mois, 6 mois, Annuel</li>
          </ul>
          <button
            onClick={handleSetup}
            disabled={loading}
            style={{
              background: loading ? '#555' : '#C9A961',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              padding: '14px 32px',
              fontSize: 18,
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Création en cours...' : 'Créer les prix Stripe'}
          </button>
        </div>
      )}

      {error && (
        <div style={{ background: '#2d1b1b', border: '1px solid #ff4444', borderRadius: 8, padding: 16, marginTop: 20, color: '#ff6666' }}>
          {error}
        </div>
      )}

      {results && (
        <div style={{ marginTop: 24 }}>
          <div style={{ background: '#1a2e1a', border: '1px solid #55EFC4', borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <h2 style={{ color: '#55EFC4', marginBottom: 12 }}>
              Produits et prix créés avec succès !
            </h2>
            <p style={{ color: '#aaa', marginBottom: 16 }}>
              Maintenant, copiez les variables ci-dessous et ajoutez-les dans
              <strong style={{ color: '#fff' }}> Vercel → Settings → Environment Variables</strong>
            </p>

            <div style={{ position: 'relative' }}>
              <pre style={{
                background: '#0d0d0d',
                border: '1px solid #333',
                borderRadius: 8,
                padding: 16,
                color: '#55EFC4',
                fontSize: 13,
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}>
                {envBlock}
              </pre>
              <button
                onClick={handleCopy}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: copied ? '#55EFC4' : '#333',
                  color: copied ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 14px',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>
          </div>

          <div style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 12, padding: 24 }}>
            <h3 style={{ color: '#C9A961', marginBottom: 16 }}>Détails des prix créés</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <th style={{ textAlign: 'left', padding: 8, color: '#888' }}>Plan</th>
                  <th style={{ textAlign: 'left', padding: 8, color: '#888' }}>Price ID</th>
                  <th style={{ textAlign: 'left', padding: 8, color: '#888' }}>Product ID</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(results).map(([key, val]) => (
                  <tr key={key} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: 8, color: '#fff' }}>{key}</td>
                    <td style={{ padding: 8, color: '#55EFC4', fontFamily: 'monospace', fontSize: 12 }}>{val.price_id}</td>
                    <td style={{ padding: 8, color: '#999', fontFamily: 'monospace', fontSize: 12 }}>{val.product_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: '#2e2a1a', border: '1px solid #C9A961', borderRadius: 12, padding: 24, marginTop: 24 }}>
            <h3 style={{ color: '#C9A961', marginBottom: 8 }}>Prochaines étapes</h3>
            <ol style={{ color: '#ccc', lineHeight: 2, paddingLeft: 20 }}>
              <li>Copiez les variables ci-dessus</li>
              <li>Allez dans <strong>Vercel → Settings → Environment Variables</strong></li>
              <li>Ajoutez chaque variable (une par une ou en bulk)</li>
              <li>Cliquez <strong>Redeploy</strong> dans Vercel</li>
              <li>Testez un abonnement !</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
