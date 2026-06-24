'use client'

import { useState } from 'react'
import PuzzleShell from '@/components/puzzle-shell'

const QUESTIONS = [
  {
    q: 'Was ist ein typisches Zeltlager-Gericht, das in einem großen Topf über dem Feuer gekocht wird?',
    options: ['Sushi', 'Gulasch', 'Pizza', 'Fondue'],
    answer: 1,
  },
  {
    q: 'Welches Werkzeug benutzt man zum Essen beim Zeltlager?',
    options: ['Löffel, Gabel & Messer', 'Stäbchen', 'Hände allein', 'Pinzette'],
    answer: 0,
  },
  {
    q: 'Was macht man mit Lebensmitteln im Zeltlager, damit sie frisch bleiben?',
    options: ['In die Sonne legen', 'Im Schatten & in Kühlboxen lagern', 'Vergraben', 'An Bäume hängen'],
    answer: 1,
  },
  {
    q: 'Was trinkt man beim Zeltlager am meisten?',
    options: ['Kaffee', 'Energydrinks', 'Wasser', 'Milch pur'],
    answer: 2,
  },
]

interface Props { onSolved: () => void }

export default function Day1({ onSolved }: Props) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [wrong, setWrong] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = QUESTIONS[current]

  const handleOption = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    if (idx === q.answer) {
      setScore(s => s + 1)
      setWrong(false)
    } else {
      setWrong(true)
    }
  }

  const handleNext = () => {
    if (current + 1 >= QUESTIONS.length) {
      setDone(true)
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setWrong(false)
    }
  }

  return (
    <PuzzleShell
      day={1}
      title="Zeltlager-Quiz"
      description="Beantworte alle 4 Fragen rund ums Zeltlager-Mittagessen!"
    >
      {done ? (
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="text-6xl animate-bounce-in">🏆</div>
          <p className="font-heading text-3xl text-primary">{score} / {QUESTIONS.length} richtig!</p>
          <p className="text-muted-foreground">
            {score === QUESTIONS.length ? 'Perfekt! Alles richtig!' : 'Super gemacht!'}
          </p>
          <button
            onClick={onSolved}
            className="mt-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl hover:opacity-90 active:scale-95 transition-all"
          >
            Weiter
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-semibold">
              Frage {current + 1} / {QUESTIONS.length}
            </span>
            <span className="text-sm bg-primary/10 text-primary rounded-full px-3 py-0.5 font-bold">
              {score} Punkte
            </span>
          </div>

          <p className="font-bold text-lg text-foreground text-pretty">{q.q}</p>

          <div className="grid grid-cols-1 gap-3">
            {q.options.map((opt, idx) => {
              let cls = 'border-border bg-background text-foreground hover:bg-muted'
              if (selected !== null) {
                if (idx === q.answer) cls = 'border-primary bg-primary/10 text-primary'
                else if (idx === selected && wrong) cls = 'border-destructive bg-destructive/10 text-destructive'
                else cls = 'border-border bg-background text-muted-foreground opacity-60'
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleOption(idx)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 font-semibold transition-all ${cls}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>

          {selected !== null && (
            <button
              onClick={handleNext}
              className="mt-2 self-end bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all"
            >
              {current + 1 < QUESTIONS.length ? 'Nächste Frage' : 'Ergebnis ansehen'}
            </button>
          )}
        </div>
      )}
    </PuzzleShell>
  )
}
