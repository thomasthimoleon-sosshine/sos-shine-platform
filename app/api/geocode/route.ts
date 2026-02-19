import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city')
  if (!city || city.trim().length < 2) {
    return NextResponse.json({ error: 'Paramètre city requis (min 2 caractères)' }, { status: 400 })
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city.trim())}`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'SOS-Shine-Platform/1.0' },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Erreur du service de géocodage' }, { status: 502 })
  }

  const data = await res.json()

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Ville introuvable' }, { status: 404 })
  }

  return NextResponse.json({
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
    display_name: data[0].display_name,
  })
}
