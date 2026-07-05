'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon paths broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const GUESS_ICON = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#ef4444;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const TARGET_ICON = L.divIcon({
  className: '',
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#22c55e;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

interface Props {
  onMapClick: (lat: number, lng: number) => void
  guess: { lat: number; lng: number } | null
  result: { distKm: number; correct: boolean; guessLat: number; guessLng: number } | null
  targetLat?: number
  targetLng?: number
}

export default function Day4Map({ onMapClick, guess, result, targetLat, targetLng }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const guessMarkerRef = useRef<L.Marker | null>(null)
  const targetMarkerRef = useRef<L.Marker | null>(null)
  const lineRef = useRef<L.Polyline | null>(null)

  // Initialise map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [48.5, 10.0], // central Europe as default
      zoom: 5,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep click handler fresh (avoids stale closure)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const handler = (e: L.LeafletMouseEvent) => onMapClick(e.latlng.lat, e.latlng.lng)
    map.on('click', handler)
    return () => { map.off('click', handler) }
  }, [onMapClick])

  // Update guess marker
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (guessMarkerRef.current) {
      guessMarkerRef.current.remove()
      guessMarkerRef.current = null
    }
    if (guess) {
      guessMarkerRef.current = L.marker([guess.lat, guess.lng], { icon: GUESS_ICON })
        .addTo(map)
        .bindPopup('Dein Tipp')
    }
  }, [guess])

  // Show target + line when correct answer revealed
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (targetMarkerRef.current) { targetMarkerRef.current.remove(); targetMarkerRef.current = null }
    if (lineRef.current) { lineRef.current.remove(); lineRef.current = null }

    if (targetLat !== undefined && targetLng !== undefined && result) {
      targetMarkerRef.current = L.marker([targetLat, targetLng], { icon: TARGET_ICON })
        .addTo(map)
        .bindPopup('Richtiger Ort')
        .openPopup()

      // Draw a dashed line from guess to target
      lineRef.current = L.polyline(
        [[result.guessLat, result.guessLng], [targetLat, targetLng]],
        { color: '#6366f1', weight: 2, dashArray: '6 4' }
      ).addTo(map)

      // Fit bounds to show both markers
      map.fitBounds(
        L.latLngBounds(
          [result.guessLat, result.guessLng],
          [targetLat, targetLng]
        ),
        { padding: [40, 40] }
      )
    }
  }, [targetLat, targetLng, result])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ cursor: 'crosshair' }}
    />
  )
}
