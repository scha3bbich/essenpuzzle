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

  useEffect(() => {
    return () => { audioRef.current?.pause() }
  }, [])

  const toggle = useCallback((e: React.MouseEvent) => {
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
      className={`flex items-center justify-center w-9 h-9 rounded-full border-2 shrink-0 transition-all active:scale-90 ${
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

// ── Draggable image card ──────────────────────────────────────────────────────
interface DraggableImageProps {
  pair: HitsterPair
  imageIndex: number
  isDragging: boolean
  onDragStart: (imageIndex: number) => void
  onDragEnd: () => void
}

function DraggableImage({ pair, imageIndex, isDragging, onDragStart, onDragEnd }: DraggableImageProps) {
  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', String(imageIndex))
        onDragStart(imageIndex)
      }}
      onDragEnd={onDragEnd}
      aria-label={`Bild ${imageIndex + 1} ziehen`}
      className={`relative rounded-xl border-2 overflow-hidden cursor-grab active:cursor-grabbing transition-all select-none ${
        isDragging ? 'border-accent opacity-40 scale-95' : 'border-border hover:border-primary/60'
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
}

// ── Clip drop zone row ────────────────────────────────────────────────────────
interface ClipRowProps {
  clipIndex: number
  clip: HitsterPair
  assignedImage: { pair: HitsterPair; imageIndex: number } | null
  isDragOver: boolean
  dragState: number | null
  onDragOver: (e: React.DragEvent, clipIndex: number) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, clipIndex: number) => void
  onDragStart: (imageIndex: number) => void
  onDragEnd: () => void
}

function ClipRow({
  clipIndex, clip, assignedImage, isDragOver, dragState,
  onDragOver, onDragLeave, onDrop, onDragStart, onDragEnd,
}: ClipRowProps) {
  return (
    <div
      onDragOver={e => onDragOver(e, clipIndex)}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, clipIndex)}
      className={`flex items-center gap-2 rounded-xl border-2 px-2 py-2 transition-all ${
        isDragOver
          ? 'border-accent bg-accent/10 shadow-inner'
          : assignedImage
          ? 'border-border bg-muted/40'
          : 'border-dashed border-border bg-muted/20'
      }`}
    >
      {/* Audio + label */}
      <div className="flex items-center gap-2 shrink-0 w-24 sm:w-28">
        <AudioButton url={clip.audioUrl} />
        <span className="text-xs font-bold text-foreground leading-tight">Clip {clipIndex + 1}</span>
      </div>

      {/* Arrow */}
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
        <path d="M3 8h10M9 4l4 4-4 4" />
      </svg>

      {/* Drop zone / assigned image thumbnail */}
      <div className="flex-1 min-w-0">
        {assignedImage ? (
          <DraggableImage
            pair={assignedImage.pair}
            imageIndex={assignedImage.imageIndex}
            isDragging={dragState === assignedImage.imageIndex}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ) : (
          <div className={`h-12 rounded-lg border-2 border-dashed flex items-center justify-center text-[10px] text-muted-foreground transition-all ${
            isDragOver ? 'border-accent bg-accent/10' : 'border-border'
          }`}>
            {isDragOver ? 'Ablegen' : 'Bild hier ablegen'}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Day10({ onSolved, content }: Props) {
  const rawPairs = content?.hitsterPairs?.length ? content.hitsterPairs : DEMO_PAIRS
  const hasNoPairs = rawPairs === DEMO_PAIRS

  const [clips] = useState(() => rawPairs)
  const [images] = useState(() =>
    shuffle(rawPairs.map((pair, originalIndex) => ({ pair, originalIndex })))
  )

  // clipIndex -> imageArrayIndex
  const [assignments, setAssignments] = useState<Record<number, number>>({})
  const assignedImageIndices = new Set(Object.values(assignments))
  const unassignedImages = images.filter((_, idx) => !assignedImageIndices.has(idx))
  const allAssigned = unassignedImages.length === 0 && Object.keys(assignments).length === clips.length

  const [draggingImageIdx, setDraggingImageIdx] = useState<number | null>(null)
  const [dragOverClip, setDragOverClip] = useState<number | null>(null)
  const [dragOverPool, setDragOverPool] = useState(false)

  const [wrongCount, setWrongCount] = useState(0)
  const [showError, setShowError] = useState(false)
  const [done, setDone] = useState(false)

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragStart = (imageIdx: number) => {
    setDraggingImageIdx(imageIdx)
    setShowError(false)
  }
  const handleDragEnd = () => {
    setDraggingImageIdx(null)
    setDragOverClip(null)
    setDragOverPool(false)
  }
  const handleDragOver = (e: React.DragEvent, clipIdx: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverClip(clipIdx)
    setDragOverPool(false)
  }
  const handleDragLeave = () => setDragOverClip(null)

  const handleDrop = (e: React.DragEvent, clipIdx: number) => {
    e.preventDefault()
    const imageIdx = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (isNaN(imageIdx)) return
    setAssignments(prev => {
      const next = { ...prev }
      for (const [k, v] of Object.entries(next)) {
        if (v === imageIdx) delete next[Number(k)]
      }
      next[clipIdx] = imageIdx
      return next
    })
    setDraggingImageIdx(null)
    setDragOverClip(null)
    setShowError(false)
  }

  const handleDropToPool = (e: React.DragEvent) => {
    e.preventDefault()
    const imageIdx = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (isNaN(imageIdx)) return
    setAssignments(prev => {
      const next = { ...prev }
      for (const [k, v] of Object.entries(next)) {
        if (v === imageIdx) delete next[Number(k)]
      }
      return next
    })
    setDraggingImageIdx(null)
    setDragOverPool(false)
    setShowError(false)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    let allCorrect = true
    for (let clipIdx = 0; clipIdx < clips.length; clipIdx++) {
      const assignedIdx = assignments[clipIdx]
      if (assignedIdx === undefined) { allCorrect = false; break }
      const assignedPair = images[assignedIdx].pair
      if (assignedPair.label !== clips[clipIdx].label) {
        allCorrect = false
        break
      }
    }
    if (allCorrect) {
      setTimeout(() => setDone(true), 400)
    } else {
      setWrongCount(c => c + 1)
      setShowError(true)
      // Reset all assignments so the user starts fresh without any hints
      setAssignments({})
    }
  }

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
        <div className="flex flex-col gap-4">

          {/* Error banner */}
          {showError && (
            <div className="rounded-2xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm font-semibold text-destructive text-center">
              Leider falsch! Alle Bilder wurden zuruckgesetzt — versuch es nochmal.
              {wrongCount > 1 && (
                <span className="ml-2 font-normal opacity-70">({wrongCount}. Versuch)</span>
              )}
            </div>
          )}

          {/* Two-column landscape layout: clips left, image pool right */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">

            {/* Left: clip rows */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Clips
              </p>
              {clips.map((clip, clipIdx) => {
                const assignedIdx = assignments[clipIdx]
                const assignedImage = assignedIdx !== undefined
                  ? { pair: images[assignedIdx].pair, imageIndex: assignedIdx }
                  : null
                return (
                  <ClipRow
                    key={clipIdx}
                    clipIndex={clipIdx}
                    clip={clip}
                    assignedImage={assignedImage}
                    isDragOver={dragOverClip === clipIdx}
                    dragState={draggingImageIdx}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                )
              })}
            </div>

            {/* Right: image pool */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOverPool(true) }}
              onDragLeave={() => setDragOverPool(false)}
              onDrop={handleDropToPool}
              className={`rounded-2xl border-2 p-3 min-h-[80px] transition-all ${
                dragOverPool
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
                  // Find the real index in the images array — must be unassigned
                  const realIdx = images.findIndex(
                    (img, i) => img.pair.label === pair.label && !assignedImageIndices.has(i)
                  )
                  return (
                    <DraggableImage
                      key={realIdx}
                      pair={pair}
                      imageIndex={realIdx}
                      isDragging={draggingImageIdx === realIdx}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!allAssigned}
            className={`w-full py-3 rounded-2xl font-bold text-base transition-all ${
              allAssigned
                ? 'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
            }`}
          >
            {allAssigned
              ? 'Abschicken und prufen'
              : `Noch ${unassignedImages.length} Bild${unassignedImages.length !== 1 ? 'er' : ''} zuzuordnen`}
          </button>
        </div>
      )}
    </PuzzleShell>
  )
}
