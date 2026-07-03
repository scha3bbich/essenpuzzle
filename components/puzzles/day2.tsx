'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import PuzzleShell from '@/components/puzzle-shell'
import type { MemoryPair } from '@/lib/config'

// Each card in the deck has an id, a pairIndex (which pair it belongs to),
// and a slot ('A' or 'B') so two different images can form a match.
interface Card {
  id: number        // unique index in the shuffled deck
  pairIndex: number // which pair this card belongs to
  slot: 'A' | 'B'  // which image of the pair
  imageUrl: string
  label: string
}

function buildDeck(pairs: MemoryPair[]): Card[] {
  const deck: Card[] = []
  pairs.forEach((p, i) => {
    deck.push({ id: i * 2,     pairIndex: i, slot: 'A', imageUrl: p.imageA, label: p.label ?? '' })
    deck.push({ id: i * 2 + 1, pairIndex: i, slot: 'B', imageUrl: p.imageB, label: p.label ?? '' })
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

// Placeholder card shown when no pairs are configured yet
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-muted-foreground">
      <p className="text-lg font-semibold">Noch keine Bilder hinterlegt.</p>
      <p className="text-sm">Bitte im Admin-Panel unter Tag 2 die Bildpaare hinzufugen.</p>
    </div>
  )
}

export default function Day2({ onSolved, content }: Props) {
  const pairs = content?.pairs?.filter(p => p.imageA && p.imageB) ?? []

  const [deck, setDeck] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<number[]>([])   // indices into deck[]
  const [matched, setMatched] = useState<Set<number>>(new Set()) // card ids
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)
  const [lock, setLock] = useState(false)

  useEffect(() => {
    if (pairs.length > 0) setDeck(buildDeck(pairs))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
        // Correct pair
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

  if (pairs.length === 0) {
    return (
      <PuzzleShell day={2} title="Zeltlager Memory" description="Finde alle passenden Bildpaare!">
        <EmptyState />
      </PuzzleShell>
    )
  }

  // 7-column grid; rows fill automatically
  const COLS = 7

  return (
    <PuzzleShell
      day={2}
      title="Zeltlager Memory"
      description="Finde alle passenden Bildpaare!"
    >
      {won ? (
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="text-6xl">🎉</div>
          <p className="font-heading text-3xl text-primary">Alle Paare gefunden!</p>
          <p className="text-muted-foreground">Du hast {moves} Züge gebraucht.</p>
          <button
            onClick={onSolved}
            className="mt-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl hover:opacity-90 active:scale-95 transition-all"
          >
            Weiter
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Stats bar */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-semibold">
              Paare: {matched.size / 2} / {pairs.length}
            </span>
            <span className="text-sm bg-primary/10 text-primary rounded-full px-3 py-0.5 font-bold">
              Züge: {moves}
            </span>
          </div>

          {/*
            The grid fills the available width. Each card is square.
            We use a fixed 7-column grid and rely on aspect-ratio to keep cards square.
            The outer wrapper uses overflow-auto so it scrolls only if truly needed
            (e.g. portrait mode with many pairs).
          */}
          <div
            className="w-full overflow-auto"
            style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
            >
              {deck.map((card, deckIdx) => {
                const isFlipped = flipped.includes(deckIdx)
                const isMatched = matched.has(card.id)
                const faceUp = isFlipped || isMatched

                return (
                  <button
                    key={card.id}
                    onClick={() => handleFlip(deckIdx)}
                    className={`relative w-full rounded-xl overflow-hidden border-2 transition-all duration-200 select-none touch-manipulation focus:outline-none ${
                      isMatched
                        ? 'border-primary ring-1 ring-primary/40 opacity-70 scale-95'
                        : isFlipped
                        ? 'border-accent shadow-md scale-100'
                        : 'border-border bg-secondary hover:bg-muted active:scale-95 cursor-pointer'
                    }`}
                    style={{ aspectRatio: '1 / 1' }}
                    aria-label={faceUp ? (card.label || `Bild ${card.pairIndex + 1}${card.slot}`) : 'Verdeckte Karte'}
                  >
                    {faceUp ? (
                      <Image
                        src={card.imageUrl}
                        alt={card.label || `Bild ${card.pairIndex + 1}${card.slot}`}
                        fill
                        sizes="(max-width: 768px) 14vw, 10vw"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-muted-foreground font-bold text-lg select-none">
                        ?
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </PuzzleShell>
  )
}
