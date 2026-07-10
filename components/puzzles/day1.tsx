'use client'

import { useState } from 'react'
import PuzzleShell from '@/components/puzzle-shell'
import type { QuizQuestion } from '@/lib/config'

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  { q: 'Was ist ein typisches Zeltlager-Gericht, das in einem großen Topf über dem Feuer gekocht wird?', options: ['Sushi', 'Gulasch', 'Pizza', 'Fondue'], answer: 1 },
  { q: 'Welches Werkzeug benutzt man zum Essen beim Zeltlager?', options: ['Löffel, Gabel & Messer', 'Stäbchen', 'Hände allein', 'Pinzette'], answer: 0 },
  { q: 'Was macht man mit Lebensmitteln im Zeltlager, damit sie frisch bleiben?', options: ['In die Sonne legen', 'Im Schatten & in Kühlboxen lagern', 'Vergraben', 'An Bäume hängen'], answer: 1 },
  { q: 'Was trinkt man beim Zeltlager am meisten?', options: ['Kaffee', 'Energydrinks', 'Wasser', 'Milch pur'], answer: 2 },
]

interface Props { onSolved: () => void; content?: { questions?: QuizQuestion[] } }

export default function Day1({ onSolved, content }: Props) {
  const QUESTIONS = content?.questions?.length ? content.questions : DEFAULT_QUESTIONS

  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [failed, setFailed] = useState(false)   // wrong answer was chosen
  const [done, setDone] = useState(false)        // all answered correctly in one run

  const q = QUESTIONS[current]

  const handleOption = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    if (idx !== q.answer) {
      setFailed(true)
    }
  }

  const handleNext = () => {
    if (failed) {
      // Wrong answer — show message briefly, then restart from the top
      setCurrent(0)
      setSelected(null)
      setFailed(false)
      return
    }
    if (current + 1 >= QUESTIONS.length) {
      setDone(true)
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
    }
  }

  return (
    <PuzzleShell
      day={1}
      title="Zeltlager-Quiz"
      description="Beantworte alle Fragen richtig — ein Fehler und du startest von vorne!"
    >
      {done ? (
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <p className="font-heading text-3xl text-primary">Alles richtig!</p>
          <p className="text-muted-foreground">Du hast alle {QUESTIONS.length} Fragen korrekt beantwortet.</p>
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
          </div>

          <p className="font-bold text-lg text-foreground text-pretty">{q.q}</p>

          <div className="grid grid-cols-1 gap-3">
            {q.options.map((opt, idx) => {
              let cls = 'border-border bg-background text-foreground hover:bg-muted'
              if (selected !== null) {
                if (failed) {
                  // Don't reveal the correct answer — only mark the wrong pick
                  if (idx === selected) cls = 'border-destructive bg-destructive/10 text-destructive'
                  else cls = 'border-border bg-background text-muted-foreground opacity-60'
                } else {
                  if (idx === q.answer) cls = 'border-primary bg-primary/10 text-primary'
                  else cls = 'border-border bg-background text-muted-foreground opacity-60'
                }
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
            <div className="flex flex-col gap-2">
              {failed && (
                <p className="text-destructive text-sm font-semibold text-center">
                  Falsch! Du musst von vorne anfangen.
                </p>
              )}
              <button
                onClick={handleNext}
                className={`self-end font-bold px-5 py-2.5 rounded-xl active:scale-95 transition-all ${
                  failed
                    ? 'bg-destructive text-destructive-foreground hover:opacity-90'
                    : 'bg-primary text-primary-foreground hover:opacity-90'
                }`}
              >
                {failed ? 'Von vorne starten' : current + 1 < QUESTIONS.length ? 'Nächste Frage' : 'Abschliessen'}
              </button>
            </div>
          )}
        </div>
      )}
    </PuzzleShell>
  )
}
