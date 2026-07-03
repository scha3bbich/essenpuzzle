'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import PuzzleShell from '@/components/puzzle-shell'
import type { HitsterPair } from '@/lib/config'

const DEMO_PAIRS: HitsterPair[] = [
  { audioUrl: '', imageUrl: '', label: 'Beispiel 1' },
  { audioUrl: '', imageUrl: '', label: 'Beispiel 2' },
  { audioUrl: '', imageUrl: '', label: 'Beispiel 3' },
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

interface Props {
  onSolved: () => void
  content?: { hitsterPairs?: HitsterPair[] }
}

// ── Audio player button ───────────────────────────────────────────────────────
function AudioButton({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => { return () => { audioRef.current?.pause() } }, [])

  const toggle = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
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

  return (
    <button
      onClick={toggle}
      aria-label={playing ? 'Audio stoppen' : 'Audio abspielen'}
      className={`flex items-center justify-center w-9 h-9 rounded-full border-2 shrink-0 transition-all active:scale-90 touch-manipulation ${
        !url
          ? 'border-border text-muted-foreground opacity-40 cursor-not-allowed'
          : playing
          ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/30'
          : 'bg-card border-border text-foreground hover:border-primary hover:text-primary'
      }`}
    >
      {playing ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <rect x="1" y="1" width="4" height="10" rx="1" />
          <rect x="7" y="1" width="4" height="10" rx="1" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M2 1.5l9 4.5-9 4.5V1.5z" />
        </svg>
      )}
    </button>
  )
}

interface GhostState {
  imageIndex: number
  pair: HitsterPair
  x: number
  y: number
  width: number
  height: number
  offsetX: number
  offsetY: number
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Day10({ onSolved, content }: Props) {
  const rawPairs = content?.hitsterPairs?.length ? content.hitsterPairs : DEMO_PAIRS
  const hasNoPairs = rawPairs === DEMO_PAIRS

  const [clips] = useState(() => rawPairs)
  const [images] = useState(() =>
    shuffle(rawPairs.map((pair, originalIndex) => ({ pair, originalIndex })))
  )

  const [assignments, setAssignments] = useState<Record<number, number>>({})
  const assignedImageIndices = new Set(Object.values(assignments))
  const unassignedImages = images.filter((_, idx) => !assignedImageIndices.has(idx))
  const allAssigned =
    unassignedImages.length === 0 && Object.keys(assignments).length === clips.length

  const [wrongCount, setWrongCount] = useState(0)
  const [showError, setShowError] = useState(false)
  const [done, setDone] = useState(false)

  const [ghost, setGhost] = useState<GhostState | null>(null)
  const [activeDropClip, setActiveDropClip] = useState<number | null>(null)
  const [activeDropPool, setActiveDropPool] = useState(false)
  const ghostRef = useRef<GhostState | null>(null)

  // Keep ref in sync
  useEffect(() => { ghostRef.current = ghost }, [ghost])

  // ── Global pointer move / up on window so dragging anywhere works ──────────
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const g = ghostRef.current
      if (!g) return
      // Prevent scroll on touch
      e.preventDefault()

      setGhost(prev =>
        prev ? { ...prev, x: e.clientX - prev.offsetX, y: e.clientY - prev.offsetY } : null
      )

      // Temporarily hide ghost so elementFromPoint can see what's beneath
      const ghostEl = document.getElementById('hitster-ghost')
      if (ghostEl) ghostEl.style.display = 'none'
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (ghostEl) ghostEl.style.display = ''

      const clipEl = el?.closest('[data-clip-index]')
      const poolEl = el?.closest('[data-pool]')
      setActiveDropClip(clipEl ? Number(clipEl.getAttribute('data-clip-index')) : null)
      setActiveDropPool(!!poolEl && !clipEl)
    }

    const onUp = (e: PointerEvent) => {
      const g = ghostRef.current
      if (!g) return

      const ghostEl = document.getElementById('hitster-ghost')
      if (ghostEl) ghostEl.style.display = 'none'
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (ghostEl) ghostEl.style.display = ''

      const clipEl = el?.closest('[data-clip-index]')
      const poolEl = el?.closest('[data-pool]')

      if (clipEl) {
        const clipIdx = Number(clipEl.getAttribute('data-clip-index'))
        setAssignments(prev => {
          const next = { ...prev }
          for (const [k, v] of Object.entries(next)) {
            if (v === g.imageIndex) delete next[Number(k)]
          }
          next[clipIdx] = g.imageIndex
          return next
        })
      } else if (poolEl) {
        setAssignments(prev => {
          const next = { ...prev }
          for (const [k, v] of Object.entries(next)) {
            if (v === g.imageIndex) delete next[Number(k)]
          }
          return next
        })
      }

      setGhost(null)
      ghostRef.current = null
      setActiveDropClip(null)
      setActiveDropPool(false)
    }

    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  // ── Start drag ─────────────────────────────────────────────────────────────
  const startDrag = useCallback((
    e: React.PointerEvent<HTMLDivElement>,
    imageIndex: number,
    pair: HitsterPair,
  ) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()

    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    const state: GhostState = {
      imageIndex,
      pair,
      x: e.clientX - offsetX,
      y: e.clientY - offsetY,
      width: rect.width,
      height: rect.height,
      offsetX,
      offsetY,
    }
    setGhost(state)
    ghostRef.current = state
    setShowError(false)
  }, [])

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    let allCorrect = true
    for (let clipIdx = 0; clipIdx < clips.length; clipIdx++) {
      const assignedIdx = assignments[clipIdx]
      if (assignedIdx === undefined) { allCorrect = false; break }
      if (images[assignedIdx].pair.label !== clips[clipIdx].label) {
        allCorrect = false; break
      }
    }
    if (allCorrect) {
      setTimeout(() => setDone(true), 400)
    } else {
      setWrongCount(c => c + 1)
      setShowError(true)
      setAssignments({})
    }
  }

  // ── Small image card ───────────────────────────────────────────────────────
  const ImageCard = ({
    pair,
    imageIndex,
    isGhost,
  }: {
    pair: HitsterPair
    imageIndex: number
    isGhost?: boolean
  }) => (
    <div
      onPointerDown={!isGhost ? (e) => startDrag(e, imageIndex, pair) : undefined}
      style={isGhost ? { width: ghost?.width, height: ghost?.height } : undefined}
      className={`relative rounded-xl border-2 overflow-hidden select-none touch-none ${
        isGhost
          ? 'opacity-80 shadow-2xl border-accent scale-105 cursor-grabbing pointer-events-none'
          : ghost?.imageIndex === imageIndex
          ? 'border-border opacity-30 cursor-grabbing'
          : 'border-border hover:border-primary/60 cursor-grab active:cursor-grabbing'
      }`}
    >
      <div className="aspect-square w-full bg-muted">
        {pair.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pair.imageUrl} alt="" className="w-full h-full object-cover" draggable={false} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
            Bild {imageIndex + 1}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <PuzzleShell
      day={10}
      title="Gruppenleiter Hitster"
      description="Spiele den Clip ab und ziehe das passende Bild auf den Clip!"
    >
      {done ? (
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <p className="font-heading text-3xl text-primary">Alle erkannt!</p>
          <p className="text-muted-foreground text-sm text-pretty max-w-xs mx-auto">
            Du hast alle Gruppenleiter ihren Clips richtig zugeordnet!
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
        <div className="flex flex-col gap-4 relative">

          {showError && (
            <div className="rounded-2xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm font-semibold text-destructive text-center">
              Leider falsch! Alle Bilder wurden zuruckgesetzt — versuch es nochmal.
              {wrongCount > 1 && (
                <span className="ml-2 font-normal opacity-70">({wrongCount}. Versuch)</span>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">

            {/* Left: clip rows */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Clips
              </p>
              {clips.map((clip, clipIdx) => {
                const assignedIdx = assignments[clipIdx]
                const assignedEntry = assignedIdx !== undefined ? images[assignedIdx] : null
                const isOver = activeDropClip === clipIdx

                return (
                  <div
                    key={clipIdx}
                    data-clip-index={clipIdx}
                    className={`flex items-center gap-2 rounded-xl border-2 px-2 py-2 transition-all ${
                      isOver
                        ? 'border-accent bg-accent/10 shadow-inner'
                        : assignedEntry
                        ? 'border-border bg-muted/40'
                        : 'border-dashed border-border bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 shrink-0 w-24 sm:w-28">
                      <AudioButton url={clip.audioUrl} />
                      <span className="text-xs font-bold text-foreground leading-tight">
                        Clip {clipIdx + 1}
                      </span>
                    </div>

                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>

                    <div className="flex-1 min-w-0">
                      {assignedEntry ? (
                        <ImageCard pair={assignedEntry.pair} imageIndex={assignedIdx!} />
                      ) : (
                        <div className={`h-12 rounded-lg border-2 border-dashed flex items-center justify-center text-[10px] text-muted-foreground transition-all ${
                          isOver ? 'border-accent bg-accent/10' : 'border-border'
                        }`}>
                          {isOver ? 'Ablegen' : 'Bild hier ablegen'}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right: image pool */}
            <div
              data-pool="true"
              className={`rounded-2xl border-2 p-3 min-h-[80px] transition-all ${
                activeDropPool
                  ? 'border-accent bg-accent/10'
                  : unassignedImages.length === 0
                  ? 'border-transparent'
                  : 'border-dashed border-border bg-muted/20'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                {unassignedImages.length === 0 ? 'Alle Bilder zugeordnet' : 'Bilder ziehen'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {unassignedImages.map(({ pair }) => {
                  const realIdx = images.findIndex(
                    (img, i) => img.pair.label === pair.label && !assignedImageIndices.has(i)
                  )
                  return (
                    <ImageCard key={realIdx} pair={pair} imageIndex={realIdx} />
                  )
                })}
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!allAssigned}
            className={`w-full py-3 rounded-2xl font-bold text-base transition-all touch-manipulation ${
              allAssigned
                ? 'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
            }`}
          >
            {allAssigned
              ? 'Abschicken und prufen'
              : `Noch ${unassignedImages.length} Bild${unassignedImages.length !== 1 ? 'er' : ''} zuzuordnen`}
          </button>

          {/* Floating ghost */}
          {ghost && (
            <div
              id="hitster-ghost"
              className="fixed pointer-events-none z-50"
              style={{ left: ghost.x, top: ghost.y, width: ghost.width, height: ghost.height }}
            >
              <ImageCard pair={ghost.pair} imageIndex={ghost.imageIndex} isGhost />
            </div>
          )}
        </div>
      )}
    </PuzzleShell>
  )
}
