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
      {/*
        SOS Meet a sa propre charte, et le layout racine impose la sienne.
        Deux neutralisations sont nécessaires :
        1. le splash doré SOS Shine ;
        2. la règle globale « h1..h6 { color: var(--brand) !important } » de
           globals.css, qui teinte en or SOS Shine tous les titres et impose
           Cormorant. Elle porte !important et -webkit-text-fill-color, donc
           elle écrase même les styles en ligne : il faut du !important pour
           lui répondre. Sans cela, les titres de SOS Meet sortent dorés,
           alors que la charte interdit explicitement l'or ici.
      */}
      <style>{`
        .page-loader{display:none!important}
        .sos-meet-scope h1,.sos-meet-scope h2,.sos-meet-scope h3,
        .sos-meet-scope h4,.sos-meet-scope h5,.sos-meet-scope h6{
          font-family:var(--sm-serif)!important;
          color:inherit!important;
          -webkit-text-fill-color:currentColor!important;
        }
      `}</style>
      <div
        className="sos-meet-scope"
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
