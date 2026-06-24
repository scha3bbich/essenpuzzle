'use client'

import { useState, useEffect, useCallback } from 'react'
import PuzzleShell from '@/components/puzzle-shell'

const DEFAULT_PAIRS = ['🍲', '🥗', '🥕', '🧅', '🍞', '🧀', '🥚', '🌽']

function shuffle<T>(arr: T[]): T[] {
  return [...arr, ...arr]
    .map(v => ({ v, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(x => x.v)
}

interface Props { onSolved: () => void; content?: { pairs?: string[] } }

export default function Day2({ onSolved, content }: Props) {
  const PAIRS = content?.pairs?.length ? content.pairs : DEFAULT_PAIRS
  const [cards, setCards] = useState<string[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)
  const [lock, setLock] = useState(false)

  useEffect(() => {
    setCards(shuffle(PAIRS))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFlip = useCallback((idx: number) => {
    if (lock || flipped.includes(idx) || matched.includes(idx)) return
    const newFlipped = [...flipped, idx]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      setLock(true)
      const [a, b] = newFlipped
      if (cards[a] === cards[b]) {
        const newMatched = [...matched, a, b]
        setMatched(newMatched)
        setFlipped([])
        setLock(false)
        if (newMatched.length === cards.length) setWon(true)
      } else {
        setTimeout(() => {
          setFlipped([])
          setLock(false)
        }, 900)
      }
    }
  }, [lock, flipped, matched, cards])

  return (
    <PuzzleShell
      day={2}
      title="Zeltlager Memory"
      description="Finde alle passenden Paare der Lagerküchen-Zutaten!"
    >
      {won ? (
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="text-6xl animate-bounce-in">🎉</div>
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
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-semibold">
              Paare: {matched.length / 2} / {PAIRS.length}
            </span>
            <span className="text-sm bg-primary/10 text-primary rounded-full px-3 py-0.5 font-bold">
              Züge: {moves}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {cards.map((card, idx) => {
              const isVisible = flipped.includes(idx) || matched.includes(idx)
              const isMatchedCard = matched.includes(idx)
              return (
                <button
                  key={idx}
                  onClick={() => handleFlip(idx)}
                  className={`aspect-square text-3xl rounded-2xl border-2 flex items-center justify-center transition-all duration-300 select-none ${
                    isVisible
                      ? isMatchedCard
                        ? 'bg-primary/10 border-primary text-primary scale-95'
                        : 'bg-accent/10 border-accent'
                      : 'bg-secondary border-border hover:bg-muted cursor-pointer'
                  }`}
                >
                  {isVisible ? card : '?'}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </PuzzleShell>
  )
}
