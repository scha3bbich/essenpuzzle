'use client'

import { useState } from 'react'
import PuzzleShell from '@/components/puzzle-shell'

const RIDDLES = [
  {
    riddle: 'Ich habe Zähne, aber kein Maul. Ich helfe beim Kochen, aber esse nichts selbst. Was bin ich?',
    answer: 'GABEL',
    hint: 'Man braucht mich zum Essen',
  },
  {
    riddle: 'Ich bin rund, ich bin hohl. Ich fasse viel Wasser und stehe auf dem Feuer. Was bin ich?',
    answer: 'TOPF',
    hint: 'Ein Kochgefäß',
  },
  {
    riddle: 'Ich weiß, aber ich bin kein Schnee. Ich würze die Suppe, aber ich bin kein Gewürz aus der Pflanzenwelt. Was bin ich?',
    answer: 'SALZ',
    hint: 'Kommt aus dem Meer oder aus der Erde',
  },
]

interface Props { onSolved: () => void }

export default function Day9({ onSolved }: Props) {
  const [current, setCurrent] = useState(0)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [showHint, setShowHint] = useState(false)
  const [done, setDone] = useState(false)

  const r = RIDDLES[current]

  const check = () => {
    if (input.trim().toUpperCase() === r.answer) {
      setStatus('correct')
      setTimeout(() => {
        if (current + 1 >= RIDDLES.length) {
          setDone(true)
        } else {
          setCurrent(c => c + 1)
          setInput('')
          setStatus('idle')
          setShowHint(false)
        }
      }, 800)
    } else {
      setStatus('wrong')
      setTimeout(() => setStatus('idle'), 800)
    }
  }

  return (
    <PuzzleShell
      day={9}
      title="Rätselzeit"
      description="Löse die Rätsel aus dem Zeltlager!"
    >
      {done ? (
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="text-6xl animate-bounce-in">🧩</div>
          <p className="font-heading text-3xl text-primary">Alle Rätsel gelöst!</p>
          <button onClick={onSolved} className="mt-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl hover:opacity-90 active:scale-95 transition-all">
            Weiter
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex justify-between text-sm text-muted-foreground font-semibold">
            <span>Rätsel {current + 1} / {RIDDLES.length}</span>
          </div>

          <div className="bg-secondary rounded-2xl p-5 border border-border">
            <p className="font-semibold text-foreground text-lg leading-relaxed text-pretty italic">
              &ldquo;{r.riddle}&rdquo;
            </p>
          </div>

          {showHint ? (
            <p className="text-sm text-accent font-semibold text-center">
              Hinweis: {r.hint}
            </p>
          ) : (
            <button
              onClick={() => setShowHint(true)}
              className="text-sm text-muted-foreground underline text-center hover:text-foreground transition-colors"
            >
              Hinweis anzeigen
            </button>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && check()}
              placeholder="Deine Antwort..."
              className={`flex-1 border-2 rounded-xl px-4 py-2.5 font-bold text-lg uppercase outline-none transition-all ${
                status === 'correct' ? 'border-primary bg-primary/10 text-primary' :
                status === 'wrong' ? 'border-destructive bg-destructive/10 text-destructive' :
                'border-border bg-background text-foreground'
              }`}
            />
            <button
              onClick={check}
              className="bg-primary text-primary-foreground font-bold px-5 rounded-xl hover:opacity-90 active:scale-95 transition-all"
            >
              OK
            </button>
          </div>

          {status === 'wrong' && (
            <p className="text-sm text-destructive text-center font-semibold animate-wiggle">
              Leider falsch!
            </p>
          )}
        </div>
      )}
    </PuzzleShell>
  )
}
