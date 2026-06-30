'use client'

import { useState, useRef, useCallback } from 'react'
import PuzzleShell from '@/components/puzzle-shell'
import type { HitsterPair } from '@/lib/config'

// Fallback demo pairs used when admin hasn't configured any yet
const DEMO_PAIRS: HitsterPair[] = [
  { audioUrl: '', imageUrl: '', label: 'Beispiel 1' },
  { audioUrl: '', imageUrl: '', label: 'Beispiel 2' },
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

interface Props {
  onSolved: () => void
  content?: { hitsterPairs?: HitsterPair[] }
}

// ── Single audio player button ───────────────────────────────────────────────
function AudioButton({ url, disabled }: { url: string; disabled?: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  const toggle = useCallback(() => {
    if (!url) return
    if (!audioRef.current) {
      audioRef.current = new Audio(url)
      audioRef.current.onended = () => setPlaying(false)
    }
    if (playing) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlaying(false)
    } else {
      audioRef.current.play().catch(() => setPlaying(false))
      setPlaying(true)
    }
  }, [url, playing])

  if (!url) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground text-xs font-bold select-none">
        —
      </div>
    )
  }

  return (
    <button
      onClick={toggle}
      disabled={disabled}
      aria-label={playing ? 'Audio stoppen' : 'Audio abspielen'}
      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all active:scale-95 shrink-0 ${
        playing
          ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30'
          : 'bg-card border-border text-foreground hover:border-primary hover:text-primary'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {playing ? (
        // Stop icon
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <rect x="2" y="2" width="4" height="10" rx="1" />
          <rect x="8" y="2" width="4" height="10" rx="1" />
        </svg>
      ) : (
        // Play icon
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M3 2.5l9 4.5-9 4.5V2.5z" />
        </svg>
      )}
    </button>
  )
}

// ── Image card ───────────────────────────────────────────────────────────────
interface ImageCardProps {
  pair: HitsterPair
  index: number
  state: 'idle' | 'selected' | 'matched' | 'wrong'
  onClick: () => void
}

function ImageCard({ pair, index, state, onClick }: ImageCardProps) {
  const base = 'relative rounded-2xl border-2 overflow-hidden transition-all select-none cursor-pointer active:scale-95'
  const cls =
    state === 'matched' ? `${base} border-primary opacity-70 cursor-default` :
    state === 'selected' ? `${base} border-accent shadow-lg shadow-accent/20 scale-[1.02]` :
    state === 'wrong' ? `${base} border-destructive animate-wiggle` :
    `${base} border-border hover:border-primary/60`

  return (
    <button
      onClick={state === 'matched' ? undefined : onClick}
      disabled={state === 'matched'}
      className={cls}
      aria-label={`Bild ${index + 1}`}
    >
      <div className="aspect-square w-full bg-muted">
        {pair.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pair.imageUrl}
            alt={`Bild ${index + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
            Bild {index + 1}
          </div>
        )}
      </div>
      {state === 'matched' && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
          <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 7l4 4 6-6" />
            </svg>
          </div>
        </div>
      )}
      <p className="text-center text-xs font-bold text-muted-foreground py-1.5 bg-card/80 backdrop-blur-sm">
        {state === 'matched' ? pair.label : `Bild ${index + 1}`}
      </p>
    </button>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Day10({ onSolved, content }: Props) {
  const rawPairs = content?.hitsterPairs?.length ? content.hitsterPairs : DEMO_PAIRS

  // Shuffle images independently; audio order stays fixed
  const [audioPairs] = useState(() => rawPairs) // audio shown in order
  const [imagePairs] = useState(() => shuffle(rawPairs)) // images shuffled

  // Which audio index is currently selected (0-based), null if none
  const [selectedAudio, setSelectedAudio] = useState<number | null>(null)
  // Set of audio-pair indices that have been correctly matched
  const [matched, setMatched] = useState<Set<number>>(new Set())
  // Index of the last wrong image pick (briefly shown)
  const [wrongImage, setWrongImage] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  const handleAudioSelect = (idx: number) => {
    if (matched.has(idx)) return
    setSelectedAudio(prev => (prev === idx ? null : idx))
    setWrongImage(null)
  }

  const handleImageClick = (imageIdx: number) => {
    if (selectedAudio === null) return
    const clickedPair = imagePairs[imageIdx]
    const selectedPair = audioPairs[selectedAudio]
    // Match by label (unique identifier)
    if (clickedPair.label === selectedPair.label) {
      const newMatched = new Set(matched)
      newMatched.add(selectedAudio)
      setMatched(newMatched)
      setSelectedAudio(null)
      if (newMatched.size === audioPairs.length) {
        setTimeout(() => setDone(true), 600)
      }
    } else {
      setWrongImage(imageIdx)
      setTimeout(() => setWrongImage(null), 700)
    }
  }

  const getImageState = (imageIdx: number): 'idle' | 'selected' | 'matched' | 'wrong' => {
    const pair = imagePairs[imageIdx]
    // Check if this image's pair has been matched
    const audioIdx = audioPairs.findIndex(a => a.label === pair.label)
    if (matched.has(audioIdx)) return 'matched'
    if (wrongImage === imageIdx) return 'wrong'
    return 'idle'
  }

  const hasNoPairs = rawPairs === DEMO_PAIRS

  return (
    <PuzzleShell
      day={10}
      title="Gruppenleiter Hitster"
      description="Spiele den Audio-Clip ab und ordne ihn dem passenden Bild zu!"
    >
      {done ? (
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="text-6xl animate-bounce-in">🎵</div>
          <p className="font-heading text-3xl text-primary">Alle erkannt!</p>
          <p className="text-muted-foreground text-sm text-pretty max-w-xs mx-auto">
            Du hast alle Gruppenleiter ihren Clips zugeordnet!
          </p>
          <button
            onClick={onSolved}
            className="mt-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl hover:opacity-90 active:scale-95 transition-all"
          >
            Weiter
          </button>
        </div>
      ) : hasNoPairs ? (
        <div className="text-center py-10 text-muted-foreground text-sm">
          Noch keine Paare konfiguriert. Bitte im Admin-Panel Audio- und Bilddateien hinzufugen.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground text-center">
            Zugeordnet: {matched.size} / {audioPairs.length}
          </p>

          {/* Audio clips row */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Audio-Clips — Clip auswahlen, dann Bild klicken
            </p>
            <div className="flex flex-col gap-2">
              {audioPairs.map((pair, i) => {
                const isMatched = matched.has(i)
                const isSel = selectedAudio === i
                return (
                  <button
                    key={i}
                    onClick={() => handleAudioSelect(i)}
                    disabled={isMatched}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                      isMatched
                        ? 'border-primary/30 bg-primary/5 opacity-60 cursor-default'
                        : isSel
                        ? 'border-accent bg-accent/10 shadow-md'
                        : 'border-border bg-card hover:border-primary/50 active:scale-[0.98]'
                    }`}
                  >
                    <AudioButton url={pair.audioUrl} disabled={isMatched} />
                    <span className="text-sm font-semibold text-foreground flex-1">
                      {isMatched ? pair.label : `Clip ${i + 1}`}
                    </span>
                    {isSel && !isMatched && (
                      <span className="text-xs text-accent font-bold shrink-0">Ausgewahlt</span>
                    )}
                    {isMatched && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0">
                        <path d="M2 8l4 4 8-8" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Image grid */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {selectedAudio !== null ? `Clip ${selectedAudio + 1} ausgewahlt — jetzt Bild anklicken` : 'Bilder'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {imagePairs.map((pair, i) => (
                <ImageCard
                  key={i}
                  pair={pair}
                  index={i}
                  state={getImageState(i)}
                  onClick={() => handleImageClick(i)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </PuzzleShell>
  )
}
