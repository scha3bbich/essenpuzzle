'use client'

import { useState } from 'react'
import PuzzleShell from '@/components/puzzle-shell'

// Sort steps of cooking spaghetti in the right order
const STEPS_CORRECT = [
  'Wasser in den Topf füllen',
  'Wasser zum Kochen bringen',
  'Salz ins Wasser geben',
  'Nudeln ins kochende Wasser geben',
  'Nudeln al dente kochen',
  'Nudeln abgießen und servieren',
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

interface Props { onSolved: () => void }

export default function Day8({ onSolved }: Props) {
  const [items, setItems] = useState<string[]>(() => shuffle(STEPS_CORRECT))
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)

  const moveItem = (from: number, to: number) => {
    if (from === to) return
    setItems(prev => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  const handleCheck = () => {
    const isCorrect = items.every((item, i) => item === STEPS_CORRECT[i])
    setChecked(true)
    setCorrect(isCorrect)
    if (isCorrect) setTimeout(onSolved, 1000)
  }

  const handleReset = () => {
    setItems(shuffle(STEPS_CORRECT))
    setChecked(false)
    setCorrect(false)
  }

  const moveUp = (idx: number) => { if (idx > 0) moveItem(idx, idx - 1) }
  const moveDown = (idx: number) => { if (idx < items.length - 1) moveItem(idx, idx + 1) }

  return (
    <PuzzleShell
      day={8}
      title="Die richtige Reihenfolge"
      description="Bringe die Kochschritte für Nudeln in die richtige Reihenfolge! Nutze die Pfeile zum Verschieben."
    >
      <div className="flex flex-col gap-3">
        {items.map((step, idx) => {
          const isCorrect = checked && step === STEPS_CORRECT[idx]
          const isWrong = checked && step !== STEPS_CORRECT[idx]
          return (
            <div
              key={step}
              className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 transition-all ${
                isCorrect ? 'border-primary bg-primary/10' :
                isWrong ? 'border-destructive bg-destructive/10' :
                'border-border bg-background'
              }`}
            >
              <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                isCorrect ? 'bg-primary text-primary-foreground' :
                isWrong ? 'bg-destructive text-primary-foreground' :
                'bg-secondary text-muted-foreground'
              }`}>
                {idx + 1}
              </span>
              <span className="flex-1 text-sm font-semibold text-foreground text-pretty">{step}</span>
              {!checked && (
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="w-6 h-6 flex items-center justify-center rounded-lg bg-secondary hover:bg-muted disabled:opacity-30 text-xs transition-all"
                    aria-label="Nach oben"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === items.length - 1}
                    className="w-6 h-6 flex items-center justify-center rounded-lg bg-secondary hover:bg-muted disabled:opacity-30 text-xs transition-all"
                    aria-label="Nach unten"
                  >
                    ▼
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {!checked ? (
          <button
            onClick={handleCheck}
            className="mt-1 w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all"
          >
            Reihenfolge prüfen
          </button>
        ) : correct ? (
          <p className="text-primary font-bold text-center text-sm">Perfekte Reihenfolge!</p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-destructive font-bold text-center text-sm">Nicht ganz richtig — versuche es nochmal!</p>
            <button
              onClick={handleReset}
              className="w-full border-2 border-border text-foreground font-semibold py-2.5 rounded-xl hover:bg-muted active:scale-95 transition-all text-sm"
            >
              Zurücksetzen
            </button>
          </div>
        )}
      </div>
    </PuzzleShell>
  )
}
