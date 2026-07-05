'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import type { MemoryPair } from '@/lib/config'

// Each card in the deck has an id, a pairIndex (which pair it belongs to),
// and a slot: 'A' = image card, 'B' = name/text card.
interface Card {
  id: number
  pairIndex: number
  slot: 'A' | 'B'
  imageUrl: string  // only used when slot === 'A'
  name: string      // displayed on slot B card (and as alt text for A)
}

function buildDeck(pairs: MemoryPair[]): Card[] {
  const deck: Card[] = []
  pairs.forEach((p, i) => {
    deck.push({ id: i * 2,     pairIndex: i, slot: 'A', imageUrl: p.imageA, name: p.name })
    deck.push({ id: i * 2 + 1, pairIndex: i, slot: 'B', imageUrl: '',       name: p.name })
  })
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

interface Props {
  onSolved: () => void
  content?: { pairs?: MemoryPair[] }
}

const COLS = 7

export default function Day2({ onSolved, content }: Props) {
  const pairs = content?.pairs?.filter(p => p.imageA && p.name) ?? []

  const [deck, setDeck] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)
  const [lock, setLock] = useState(false)

  // Measure the available grid area so cards fill it exactly
  const gridRef = useRef<HTMLDivElement>(null)
  const [cardSize, setCardSize] = useState(0)

  useEffect(() => {
    if (pairs.length > 0) setDeck(buildDeck(pairs))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const rows = Math.ceil((pairs.length * 2) / COLS)
    const gap = 4 // px — matches gap-1

    function measure() {
      if (!gridRef.current) return
      const { width, height } = gridRef.current.getBoundingClientRect()
      const totalGapW = gap * (COLS - 1)
      const totalGapH = gap * (rows - 1)
      const byWidth  = (width  - totalGapW) / COLS
      const byHeight = (height - totalGapH) / rows
      setCardSize(Math.floor(Math.min(byWidth, byHeight)))
    }

    measure()
    const ro = new ResizeObserver(measure)
    if (gridRef.current) ro.observe(gridRef.current)
    return () => ro.disconnect()
  }, [pairs.length])

  const handleFlip = useCallback((deckIdx: number) => {
    if (lock) return
    const card = deck[deckIdx]
    if (!card) return
    if (matched.has(card.id)) return
    if (flipped.includes(deckIdx)) return

    const newFlipped = [...flipped, deckIdx]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      setLock(true)
      const [ai, bi] = newFlipped
      const cardA = deck[ai]
      const cardB = deck[bi]

      if (cardA.pairIndex === cardB.pairIndex && cardA.slot !== cardB.slot) {
        const newMatched = new Set(matched)
        newMatched.add(cardA.id)
        newMatched.add(cardB.id)
        setMatched(newMatched)
        setFlipped([])
        setLock(false)
        if (newMatched.size === deck.length) setWon(true)
      } else {
        setTimeout(() => {
          setFlipped([])
          setLock(false)
        }, 900)
      }
    }
  }, [lock, flipped, matched, deck])

  // ── Won screen ──────────────────────────────────────────────────────────────
  if (won) {
    return (
      <main className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-6 p-6 text-center">
        <p className="font-heading text-4xl text-primary">Alle Paare gefunden!</p>
        <p className="text-muted-foreground text-lg">{moves} Züge</p>
        <button
          onClick={onSolved}
          className="bg-primary text-primary-foreground font-bold px-8 py-4 rounded-2xl text-xl hover:opacity-90 active:scale-95 transition-all"
        >
          Weiter
        </button>
      </main>
    )
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (pairs.length === 0) {
    return (
      <main className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-3 text-center p-6 text-muted-foreground">
        <p className="text-lg font-semibold">Noch keine Bilder hinterlegt.</p>
        <p className="text-sm">Bitte im Admin-Panel unter Tag 2 die Bildpaare hinzufügen.</p>
      </main>
    )
  }

  // ── Game ────────────────────────────────────────────────────────────────────
  // Layout: fixed full-screen, stats bar on top, grid fills the rest
  const STATS_H = 36 // px — height of the stats bar + gap

  return (
    <main className="fixed inset-0 bg-background flex flex-col p-1.5 gap-1">
      {/* Stats bar */}
      <div
        className="flex justify-between items-center px-2 shrink-0"
        style={{ height: STATS_H }}
      >
        <span className="text-sm text-muted-foreground font-semibold">
          Paare: {matched.size / 2}&thinsp;/&thinsp;{pairs.length}
        </span>
        <span className="font-heading text-lg text-foreground text-balance text-center leading-none">
          Gruppenleiter Memory
        </span>
        <span className="text-sm bg-primary/10 text-primary rounded-full px-3 py-0.5 font-bold">
          Züge: {moves}
        </span>
      </div>

      {/*
        Grid wrapper — fills all remaining space.
        We measure this element and compute the card size that fits without overflow.
      */}
      <div ref={gridRef} className="flex-1 min-h-0 flex items-center justify-center">
        {cardSize > 0 && (
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${COLS}, ${cardSize}px)`,
              gap: 4,
            }}
          >
            {deck.map((card, deckIdx) => {
              const isFlipped = flipped.includes(deckIdx)
              const isMatched = matched.has(card.id)
              const faceUp = isFlipped || isMatched

              return (
                <button
                  key={card.id}
                  onClick={() => handleFlip(deckIdx)}
                  className={`relative overflow-hidden rounded-lg border-2 transition-all duration-200 select-none touch-manipulation focus:outline-none ${
                    isMatched
                      ? 'border-primary opacity-60 scale-95'
                      : isFlipped
                      ? 'border-accent shadow-md'
                      : 'border-border bg-secondary hover:bg-muted active:scale-95 cursor-pointer'
                  }`}
                  style={{ width: cardSize, height: cardSize }}
                  aria-label={faceUp ? card.name : 'Verdeckte Karte'}
                >
                  {faceUp ? (
                    card.slot === 'A' ? (
                      <Image
                        src={card.imageUrl}
                        alt={card.name}
                        fill
                        sizes={`${cardSize}px`}
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center bg-accent/20 p-1">
                        <span
                          className="text-center font-bold text-accent-foreground leading-tight break-words hyphens-auto"
                          style={{ fontSize: Math.max(10, Math.round(cardSize * 0.18)) }}
                        >
                          {card.name}
                        </span>
                      </span>
                    )
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-muted-foreground font-bold select-none"
                      style={{ fontSize: Math.max(12, Math.round(cardSize * 0.35)) }}>
                      ?
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
