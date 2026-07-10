'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useEffect } from 'react'
import type { GeoGuessrRound } from '@/lib/config'

// Leaflet must be loaded client-side only
const MapView = dynamic(() => import('./day4-map'), { ssr: false })

// Haversine distance in km
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

interface Props {
  onSolved: () => void
  content: { rounds: GeoGuessrRound[] }
}

type GuessResult = {
  distKm: number
  correct: boolean
  guessLat: number
  guessLng: number
}

export default function Day4({ onSolved, content }: Props) {
  const rounds = content.rounds ?? []
  const [roundIdx, setRoundIdx] = useState(0)
  const [guess, setGuess] = useState<{ lat: number; lng: number } | null>(null)
  const [result, setResult] = useState<GuessResult | null>(null)
  const [allSolved, setAllSolved] = useState(false)
  const [lightbox, setLightbox] = useState(false)

  const round = rounds[roundIdx]

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (result?.correct) return
      setGuess({ lat, lng })
      setResult(null)
    },
    [result],
  )

  const handleSubmit = useCallback(() => {
    if (!guess || !round) return
    const distKm = haversineKm(guess.lat, guess.lng, round.lat, round.lng)
    const correct = distKm * 1000 <= round.thresholdM
    setResult({ distKm, correct, guessLat: guess.lat, guessLng: guess.lng })
  }, [guess, round])

  const handleNext = useCallback(() => {
    const next = roundIdx + 1
    if (next >= rounds.length) {
      setAllSolved(true)
    } else {
      setRoundIdx(next)
      setGuess(null)
      setResult(null)
    }
  }, [roundIdx, rounds.length])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setLightbox(false); return }
      if (e.key !== 'Enter') return
      if (result?.correct) handleNext()
      else if (guess && !result) handleSubmit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [guess, result, handleNext, handleSubmit])

  // All rounds solved
  if (allSolved) {
    return (
      <main className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-6 p-6 text-center">
        <p className="font-heading text-4xl text-primary">Alle Orte gefunden!</p>
        <p className="text-muted-foreground text-lg">
          Du hast alle {rounds.length} Runden gelöst.
        </p>
        <button
          onClick={onSolved}
          className="bg-primary text-primary-foreground font-bold px-8 py-4 rounded-2xl text-xl hover:opacity-90 active:scale-95 transition-all"
        >
          Weiter
        </button>
      </main>
    )
  }

  // Empty state
  if (rounds.length === 0 || !round) {
    return (
      <main className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-3 text-center p-6 text-muted-foreground">
        <p className="text-lg font-semibold">Noch keine Orte hinterlegt.</p>
        <p className="text-sm">
          Bitte im Admin-Panel unter Tag 4 die Geo-Guesser-Runden hinzufügen.
        </p>
      </main>
    )
  }

  const distLabel = (km: number) =>
    km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`

  return (
    <main className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2 border-b border-border bg-card">
        <span className="text-sm font-semibold text-muted-foreground">
          Runde {roundIdx + 1}&thinsp;/&thinsp;{rounds.length}
        </span>
        <span className="font-heading text-base text-foreground text-center leading-tight truncate">
          Geo-Guesser
        </span>
        <span className="text-sm font-bold text-primary bg-primary/10 rounded-full px-3 py-0.5">
          &le;&thinsp;{round.thresholdM}&thinsp;m
        </span>
      </div>

      {/* Photo + Map */}
      <div className="flex-1 min-h-0 flex flex-col sm:flex-row">
        {/* Photo */}
        <div
          className="sm:w-[38%] shrink-0 relative bg-black flex items-center justify-center overflow-hidden border-b sm:border-b-0 sm:border-r border-border"
          style={{ maxHeight: '45dvh', minHeight: 100 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={round.imageUrl}
            alt="Wo wurde dieses Foto aufgenommen?"
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-2 flex items-end justify-between">
            <p className="text-white text-xs font-semibold">
              Wo wurde dieses Foto aufgenommen?
            </p>
            <button
              onClick={() => setLightbox(true)}
              aria-label="Bild vergrößern"
              className="shrink-0 ml-2 bg-black/50 hover:bg-black/70 text-white rounded-lg p-1.5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Lightbox */}
        {lightbox && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={round.imageUrl}
              alt="Foto in Originalgröße"
              className="max-w-full max-h-full object-contain rounded-lg select-none"
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setLightbox(false)}
              aria-label="Schließen"
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )}

        {/* Map */}
        <div className="flex-1 min-h-0 relative">
          <MapView
            onMapClick={handleMapClick}
            guess={guess}
            result={result}
            targetLat={result?.correct ? round.lat : undefined}
            targetLng={result?.correct ? round.lng : undefined}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border bg-card px-4 py-2.5 flex items-center justify-between gap-4 min-h-[56px]">
        <div className="flex-1 min-w-0">
          {!guess && !result && (
            <p className="text-sm text-muted-foreground">
              Tippe auf die Karte, um deinen Tipp zu setzen.
            </p>
          )}
          {guess && !result && (
            <p className="text-sm text-foreground">Tipp gesetzt — bereit zum Abschicken!</p>
          )}
          {result && !result.correct && (
            <p className="text-sm text-destructive font-semibold">
              Leider falsch — du warst {distLabel(result.distKm)} entfernt. Versuche es erneut!
            </p>
          )}
          {result?.correct && (
            <p className="text-sm text-primary font-semibold">
              Richtig! Nur {distLabel(result.distKm)} entfernt.
              {round.label ? ` Das war: ${round.label}` : ''}
            </p>
          )}
        </div>

        {result?.correct ? (
          <button
            onClick={handleNext}
            className="shrink-0 bg-primary text-primary-foreground font-bold px-5 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all text-sm"
          >
            {roundIdx + 1 < rounds.length ? 'Nächste Runde' : 'Fertig'}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!guess}
            className="shrink-0 bg-primary text-primary-foreground font-bold px-5 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Abschicken
          </button>
        )}
      </div>
    </main>
  )
}
