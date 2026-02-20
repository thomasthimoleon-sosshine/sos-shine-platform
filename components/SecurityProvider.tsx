'use client'

import { useEffect } from 'react'

export default function SecurityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 1. BLOCAGE DES INTERACTIONS
    const handleContextMenu = (e: MouseEvent) => e.preventDefault()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) && 
        (['c', 'v', 'a', 's', 'u'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault()
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)

    // 2. EFFET ÉCRAN NOIR (ANTI-CAPTURE / VISIBILITY)
    const overlay = document.createElement('div')
    overlay.id = 'security-overlay'
    overlay.style.position = 'fixed'
    overlay.style.inset = '0'
    overlay.style.background = 'black'
    overlay.style.color = 'white'
    overlay.style.display = 'none'
    overlay.style.flexDirection = 'column'
    overlay.style.alignItems = 'center'
    overlay.style.justifyContent = 'center'
    overlay.style.zIndex = '999999'
    overlay.style.fontFamily = 'sans-serif'
    overlay.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h2 style="margin-bottom: 10px; font-weight: bold;">CONTENU PROTÉGÉ PAR SOS SHINE</h2>
        <p>CAPTURE INTERDITE - PROTECTION ACTIVE</p>
      </div>
    `
    document.body.appendChild(overlay)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        overlay.style.display = 'flex'
      } else {
        // Optionnel: On peut laisser l'écran noir un court instant au retour
        overlay.style.display = 'none'
      }
    }

    // Détection de perte de focus (plus efficace pour certaines captures)
    const handleBlur = () => {
      overlay.style.display = 'flex'
    }
    const handleFocus = () => {
      overlay.style.display = 'none'
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      if (document.getElementById('security-overlay')) {
        document.body.removeChild(overlay)
      }
    }
  }, [])

  return <>{children}</>
}
