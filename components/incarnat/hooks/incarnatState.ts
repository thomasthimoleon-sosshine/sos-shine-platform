// État partagé, hors cycle de rendu React (lu dans useFrame, écrit par Lenis
// et le pointeur). Évite tout re-render à chaque frame de scroll/souris.
export const incarnatState = {
  progress: 0,   // 0 → 1 sur toute la traversée
  mouseX: 0,     // -1 → 1
  mouseY: 0,     // -1 → 1
  reveal: 0,     // 0 → 1 : révélation au chargement
  ready: false,
}

// petites aides de lissage
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt))
