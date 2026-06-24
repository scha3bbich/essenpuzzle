'use client'

import { useState } from 'react'
import PuzzleShell from '@/components/puzzle-shell'

// Match food to its category
const PAIRS: [string, string][] = [
  ['Karotte', 'Gemüse'],
  ['Apfel', 'Obst'],
  ['Salz', 'Gewürz'],
  ['Brot', 'Getreide'],
  ['Milch', 'Milchprodukt'],
  ['Rindfleisch', 'Fleisch'],
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

interface Props { onSolved: () => void }

export default function Day10({ onSolved }: Props) {
  const [lefts] = useState(() => shuffle(PAIRS.map(p => p[0])))
  const [rights] = useState(() => shuffle(PAIRS.map(p => p[1])))
  const [selLeft, setSelLeft] = useState<string | null>(null)
  const [selRight, setSelRight] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([]) // matched left items
  const [wrong, setWrong] = useState(false)
  const [done, setDone] = useState(false)

  const handleLeft = (item: string) => {
    if (matched.includes(item)) return
    setSelLeft(item)
    setWrong(false)
  }

  const handleRight = (item: string) => {
    if (!selLeft) return
    const matchedRight = PAIRS.find(([l]) => l === selLeft)?.[1]
    if (matchedRight === item) {
      const newMatched = [...matched, selLeft]
      setMatched(newMatched)
      setSelLeft(null)
      setSelRight(null)
      if (newMatched.length === PAIRS.length) setTimeout(() => setDone(true), 500)
    } else {
      setWrong(true)
      setSelRight(item)
      setTimeout(() => { setSelLeft(null); setSelRight(null); setWrong(false) }, 700)
    }
  }

  const matchedRights = matched.map(l => PAIRS.find(([pl]) => pl === l)?.[1] ?? '')

  return (
    <PuzzleShell
      day={10}
      title="Lebensmittel zuordnen"
      description="Verbinde jedes Lebensmittel mit der richtigen Kategorie! Wähle erst links, dann rechts."
    >
      {done ? (
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="text-6xl animate-bounce-in">🥦</div>
          <p className="font-heading text-3xl text-primary">Alles richtig zugeordnet!</p>
          <button onClick={onSolved} className="mt-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl hover:opacity-90 active:scale-95 transition-all">
            Weiter
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Verbunden: {matched.length} / {PAIRS.length}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest text-center mb-1">Lebensmittel</p>
              {lefts.map(item => {
                const isMatched = matched.includes(item)
                const isSel = selLeft === item
                return (
                  <button
                    key={item}
                    onClick={() => handleLeft(item)}
                    disabled={isMatched}
                    className={`py-2.5 px-3 rounded-xl border-2 text-sm font-bold transition-all ${
                      isMatched ? 'bg-primary/10 border-primary text-primary opacity-60' :
                      isSel ? 'bg-accent/20 border-accent text-foreground' :
                      'bg-secondary border-border text-foreground hover:bg-muted active:scale-95'
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest text-center mb-1">Kategorie</p>
              {rights.map(item => {
                const isMatched = matchedRights.includes(item)
                const isSel = selRight === item
                const isWrongSel = wrong && isSel
                return (
                  <button
                    key={item}
                    onClick={() => handleRight(item)}
                    disabled={isMatched || !selLeft}
                    className={`py-2.5 px-3 rounded-xl border-2 text-sm font-bold transition-all ${
                      isMatched ? 'bg-primary/10 border-primary text-primary opacity-60' :
                      isWrongSel ? 'bg-destructive/10 border-destructive text-destructive animate-wiggle' :
                      !selLeft ? 'bg-secondary border-border text-muted-foreground opacity-50' :
                      'bg-secondary border-border text-foreground hover:bg-muted active:scale-95'
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>
          {selLeft && !wrong && (
            <p className="text-xs text-accent font-semibold text-center">
              Ausgewählt: <span className="text-foreground">{selLeft}</span> — jetzt Kategorie wählen
            </p>
          )}
        </div>
      )}
    </PuzzleShell>
  )
}
