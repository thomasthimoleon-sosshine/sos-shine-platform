// Identité SOS Meet — indépendante de SOS Shine.
// Univers « couture après minuit » : noir & grenat, serif Bodoni Moda + sans Jost.
// Polices chargées via <link> runtime (pas de next/font → aucun impact build).

export default function SosMeetLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400;1,6..96,500&family=Jost:wght@300;400;500&display=swap"
      />
      <div
        style={
          {
            '--sm-serif': "'Bodoni Moda', Georgia, 'Times New Roman', serif",
            '--sm-sans': "'Jost', -apple-system, system-ui, sans-serif",
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </>
  )
}
