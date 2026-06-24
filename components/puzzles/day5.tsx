'use client'

import { useState } from 'react'
import PuzzleShell from '@/components/puzzle-shell'

import type { MathRiddle } from '@/lib/config'

const DEFAULT_RIDDLES: MathRiddle[] = [
  { text: 'Im Zeltlager kochen 3 Köche. Jeder schält 8 Kartoffeln. Wie viele Kartoffeln wurden insgesamt geschält?', answer: 24, unit: 'Kartoffeln' },
  { text: 'Es gibt 5 Tische. An jedem Tisch sitzen 6 Kinder. Wie viele Kinder essen zusammen zu Mittag?', answer: 30, unit: 'Kinder' },
  { text: 'Für die Suppe braucht man 4 Liter Wasser pro Topf. Es werden 3 Töpfe gekocht. Wie viele Liter Wasser werden insgesamt benötigt?', answer: 12, unit: 'Liter' },
]

interface Props { onSolved: () => void; content?: { riddles?: MathRiddle[] } }

export default function Day5({ onSolved, content }: Props) {
  const RIDDLES = content?.riddles?.length ? content.riddles : DEFAULT_RIDDLES
  const [current, setCurrent] = useState(0)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [done, setDone] = useState(false)

  const riddle = RIDDLES[current]

  const check = () => {
    const val = parseInt(input.trim(), 10)
    if (val === riddle.answer) {
      setStatus('correct')
      setTimeout(() => {
        if (current + 1 >= RIDDLES.length) {
          setDone(true)
        } else {
          setCurrent(c => c + 1)
          setInput('')
          setStatus('idle')
        }
      }, 800)
    } else {
      setStatus('wrong')
      setTimeout(() => setStatus('idle'), 800)
    }
  }

  return (
    <PuzzleShell
      day={5}
      title="Küchenrechnung"
      description="Löse die Rechenaufgaben aus der Zeltlagerküche!"
    >
      {done ? (
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="text-6xl animate-bounce-in">🧮</div>
          <p className="font-heading text-3xl text-primary">Alle Aufgaben gelöst!</p>
          <button
            onClick={onSolved}
            className="mt-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl hover:opacity-90 active:scale-95 transition-all"
          >
            Weiter
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex justify-between text-sm text-muted-foreground font-semibold">
            <span>Aufgabe {current + 1} / {RIDDLES.length}</span>
          </div>

          <div className="bg-secondary rounded-2xl p-4 border border-border">
            <p className="font-semibold text-foreground text-pretty leading-relaxed">{riddle.text}</p>
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && check()}
              placeholder="Antwort..."
              className={`flex-1 border-2 rounded-xl px-4 py-2.5 font-bold text-lg outline-none transition-all ${
                status === 'correct'
                  ? 'border-primary bg-primary/10 text-primary'
                  : status === 'wrong'
                  ? 'border-destructive bg-destructive/10 text-destructive'
                  : 'border-border bg-background text-foreground'
              }`}
            />
            <span className="text-muted-foreground font-semibold text-sm">{riddle.unit}</span>
            <button
              onClick={check}
              className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all"
            >
              OK
            </button>
          </div>

          {status === 'wrong' && (
            <p className="text-sm text-destructive text-center font-semibold animate-wiggle">
              Nicht ganz — rechne nochmal nach!
            </p>
          )}
          {status === 'correct' && (
            <p className="text-sm text-primary text-center font-semibold">Richtig! ✓</p>
          )}
        </div>
      )}
    </PuzzleShell>
  )
}
