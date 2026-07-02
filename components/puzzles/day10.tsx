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

  // Stop on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  const toggle = useCallback(
    (e: React.MouseEvent) => {
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
    },
    [url, playing]
  )

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
  imageIndex: number  // index in the shuffled image list
  isDragging: boolean
  onDragStart: (imageIndex: number) => void
  onDragEnd: () => void
  checkState?: 'correct' | 'wrong' | null
}

function DraggableImage({ pair, imageIndex, isDragging, onDragStart, onDragEnd, checkState }: DraggableImageProps) {
  const borderCls =
    checkState === 'correct' ? 'border-primary ring-2 ring-primary/30' :
    checkState === 'wrong'   ? 'border-destructive ring-2 ring-destructive/20' :
    isDragging               ? 'border-accent opacity-40 scale-95' :
                               'border-border hover:border-primary/60'

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
      className={`relative rounded-xl border-2 overflow-hidden cursor-grab active:cursor-grabbing transition-all select-none ${borderCls}`}
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
      {checkState === 'correct' && (
        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1.5 5l2.5 2.5 4.5-4.5" />
          </svg>
        </div>
      )}
      {checkState === 'wrong' && (
        <div className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 2l6 6M8 2l-6 6" />
          </svg>
        </div>
      )}
      <p className="text-center text-[10px] font-semibold text-muted-foreground py-1 bg-card/80 truncate px-1">
        Bild {imageIndex + 1}
      </p>
    </div>
  )
}

// ── Clip drop zone row ────────────────────────────────────────────────────────
interface ClipRowProps {
  clipIndex: number
  clip: HitsterPair
  assignedImage: { pair: HitsterPair; imageIndex: number } | null
  isDragOver: boolean
  dragState: number | null  // currently dragged image index
  checkState?: 'correct' | 'wrong' | null
  onDragOver: (e: React.DragEvent, clipIndex: number) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, clipIndex: number) => void
  onDragStart: (imageIndex: number) => void
  onDragEnd: () => void
}

function ClipRow({
  clipIndex, clip, assignedImage, isDragOver, dragState, checkState,
  onDragOver, onDragLeave, onDrop, onDragStart, onDragEnd,
}: ClipRowProps) {
  const rowBorder =
    isDragOver ? 'border-accent bg-accent/10 shadow-inner' :
    checkState === 'correct' ? 'border-primary/50 bg-primary/5' :
    checkState === 'wrong'   ? 'border-destructive/50 bg-destructive/5' :
    assignedImage            ? 'border-border bg-muted/40' :
                               'border-dashed border-border bg-muted/20'

  return (
    <div
      onDragOver={e => onDragOver(e, clipIndex)}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, clipIndex)}
      className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5 transition-all ${rowBorder}`}
    >
      {/* Clip number + audio button */}
      <div className="flex items-center gap-2 shrink-0 w-28 sm:w-32">
        <AudioButton url={clip.audioUrl} />
        <span className="text-sm font-bold text-foreground">Clip {clipIndex + 1}</span>
      </div>

      {/* Arrow */}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
        <path d="M3 8h10M9 4l4 4-4 4" />
      </svg>

      {/* Drop zone / assigned image */}
      <div className="flex-1 min-w-0">
        {assignedImage ? (
          <DraggableImage
            pair={assignedImage.pair}
            imageIndex={assignedImage.imageIndex}
            isDragging={dragState === assignedImage.imageIndex}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            checkState={checkState}
          />
        ) : (
          <div className={`h-14 rounded-xl border-2 border-dashed flex items-center justify-center text-xs text-muted-foreground transition-all ${isDragOver ? 'border-accent bg-accent/10' : 'border-border'}`}>
            {isDragOver ? 'Hier ablegen' : 'Bild hierher ziehen'}
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

  // Fixed audio order, shuffled image order
  const [clips] = useState(() => rawPairs)
  const [images] = useState(() =>
    shuffle(rawPairs.map((pair, originalIndex) => ({ pair, originalIndex })))
  )

  // Map: clipIndex -> imageIndex (the shuffled position)
  const [assignments, setAssignments] = useState<Record<number, number>>({})

  // Unassigned images (those not yet in any clip slot)
  const assignedImageIndices = new Set(Object.values(assignments))
  const unassignedImages = images.filter((_, idx) => !assignedImageIndices.has(idx))

  // Drag state
  const [draggingImageIdx, setDraggingImageIdx] = useState<number | null>(null)
  const [dragOverClip, setDragOverClip] = useState<number | null>(null)

  // Check state
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<Record<number, 'correct' | 'wrong'>>({})
  const [done, setDone] = useState(false)
  const [wrongCount, setWrongCount] = useState(0)

  const allAssigned = unassignedImages.length === 0 && Object.keys(assignments).length === clips.length

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragStart = (imageIdx: number) => {
    setDraggingImageIdx(imageIdx)
    setChecked(false)
    setResults({})
  }
  const handleDragEnd = () => {
    setDraggingImageIdx(null)
    setDragOverClip(null)
  }
  const handleDragOver = (e: React.DragEvent, clipIdx: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverClip(clipIdx)
  }
  const handleDragLeave = () => setDragOverClip(null)

  const handleDrop = (e: React.DragEvent, clipIdx: number) => {
    e.preventDefault()
    const imageIdx = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (isNaN(imageIdx)) return

    setAssignments(prev => {
      const next = { ...prev }
      // Remove this image from any existing clip slot
      for (const [k, v] of Object.entries(next)) {
        if (v === imageIdx) delete next[Number(k)]
      }
      next[clipIdx] = imageIdx
      return next
    })
    setDraggingImageIdx(null)
    setDragOverClip(null)
    setChecked(false)
    setResults({})
  }

  // Drop onto the unassigned pool (removes from a clip slot)
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
    setDragOverClip(null)
    setChecked(false)
    setResults({})
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const newResults: Record<number, 'correct' | 'wrong'> = {}
    let allCorrect = true
    for (let clipIdx = 0; clipIdx < clips.length; clipIdx++) {
      const assignedImageArrayIdx = assignments[clipIdx]
      if (assignedImageArrayIdx === undefined) { allCorrect = false; continue }
      const assignedPair = images[assignedImageArrayIdx].pair
      const correct = assignedPair.label === clips[clipIdx].label
      newResults[clipIdx] = correct ? 'correct' : 'wrong'
      if (!correct) allCorrect = false
    }
    setResults(newResults)
    setChecked(true)
    if (allCorrect) {
      setTimeout(() => setDone(true), 800)
    } else {
      setWrongCount(c => c + 1)
    }
  }

  const wrongClips = Object.entries(results).filter(([, v]) => v === 'wrong').length

  return (
    <PuzzleShell
      day={10}
      title="Gruppenleiter Hitster"
      description="Ziehe jedes Bild auf den passenden Audio-Clip!"
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
        <div className="flex flex-col gap-5">

          {/* Error feedback */}
          {checked && wrongClips > 0 && (
            <div className="rounded-2xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm font-semibold text-destructive text-center">
              {wrongClips === 1
                ? '1 Zuordnung ist falsch. Versuch es nochmal!'
                : `${wrongClips} Zuordnungen sind falsch. Versuch es nochmal!`}
            </div>
          )}

          {/* Clip rows (drop targets) */}
          <div className="flex flex-col gap-2">
            {clips.map((clip, clipIdx) => {
              const assignedImageArrayIdx = assignments[clipIdx]
              const assignedImage =
                assignedImageArrayIdx !== undefined
                  ? { pair: images[assignedImageArrayIdx].pair, imageIndex: assignedImageArrayIdx }
                  : null
              return (
                <ClipRow
                  key={clipIdx}
                  clipIndex={clipIdx}
                  clip={clip}
                  assignedImage={assignedImage}
                  isDragOver={dragOverClip === clipIdx}
                  dragState={draggingImageIdx}
                  checkState={checked ? (results[clipIdx] ?? null) : null}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              )
            })}
          </div>

          {/* Unassigned image pool */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDropToPool}
            className={`rounded-2xl border-2 p-3 transition-all min-h-[60px] ${
              unassignedImages.length === 0
                ? 'border-transparent'
                : 'border-dashed border-border bg-muted/20'
            }`}
          >
            {unassignedImages.length > 0 && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Noch zuzuordnen
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {unassignedImages.map(({ pair }, arrayIdx) => {
                    // Find the actual index in the images array
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
                        checkState={null}
                      />
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!allAssigned}
            className={`w-full py-3 rounded-2xl font-bold text-base transition-all ${
              allAssigned
                ? 'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
            }`}
          >
            {allAssigned ? 'Abschicken und prufen' : `Noch ${unassignedImages.length} Bild${unassignedImages.length !== 1 ? 'er' : ''} zuzuordnen`}
          </button>

          {wrongCount > 1 && (
            <p className="text-center text-xs text-muted-foreground">
              Versuche: {wrongCount}
            </p>
          )}
        </div>
      )}
    </PuzzleShell>
  )
}
