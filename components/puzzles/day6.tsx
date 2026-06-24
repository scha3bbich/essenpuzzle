'use client'

import { useState } from 'react'
import PuzzleShell from '@/components/puzzle-shell'

import type { TrueFalseStatement } from '@/lib/config'

const DEFAULT_STATEMENTS: TrueFalseStatement[] = [
  { text: 'Rohes Fleisch sollte niemals bei Zimmertemperatur gelagert werden.', answer: true },
  { text: 'Man kann Nudeln auch in kaltem Wasser kochen — das spart Zeit.', answer: false },
  { text: 'Salz erhöht den Siedepunkt des Wassers leicht.', answer: true },
  { text: 'Beim Zeltlager sollte man Essensreste immer im Zelt aufbewahren.', answer: false },
  { text: 'Frisches Wasser ist die wichtigste Zutat beim Kochen draußen.', answer: true },
]

interface Props { onSolved: () => void; content?: { statements?: TrueFalseStatement[] } }

export default function Day6({ onSolved, content }: Props) {
  const STATEMENTS = content?.statements?.length ? content.statements : DEFAULT_STATEMENTS
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(STATEMENTS.length).fill(null))
  const [checked, setChecked] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const allAnswered = answers.every(a => a !== null)
  const score = answers.filter((a, i) => a === STATEMENTS[i].answer).length

  const handleAnswer = (idx: number, val: boolean) => {
    if (checked) return
    setAnswers(prev => {
      const next = [...prev]
      next[idx] = val
      return next
    })
  }

  const handleCheck = () => setChecked(true)

  return (
    <PuzzleShell
      day={6}
      title="Wahr oder Falsch?"
      description="Beantworte alle Aussagen rund ums Kochen im Zeltlager!"
    >
      {submitted ? (
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="text-6xl animate-bounce-in">🎯</div>
          <p className="font-heading text-3xl text-primary">{score} / {STATEMENTS.length} richtig!</p>
          <p className="text-muted-foreground">
            {score >= 4 ? 'Ausgezeichnet!' : score >= 3 ? 'Gut gemacht!' : 'Weiter so!'}
          </p>
          <button
            onClick={onSolved}
            className="mt-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl hover:opacity-90 active:scale-95 transition-all"
          >
            Weiter
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {STATEMENTS.map((stmt, i) => {
            const userAns = answers[i]
            const isCorrect = checked ? userAns === stmt.answer : null
            return (
              <div
                key={i}
                className={`rounded-2xl border-2 p-4 transition-all ${
                  !checked
                    ? 'border-border bg-background'
                    : isCorrect
                    ? 'border-primary bg-primary/10'
                    : 'border-destructive bg-destructive/10'
                }`}
              >
                <p className="font-semibold text-sm text-foreground mb-3 text-pretty">{stmt.text}</p>
                <div className="flex gap-2">
                  {[true, false].map(val => (
                    <button
                      key={String(val)}
                      onClick={() => handleAnswer(i, val)}
                      disabled={checked}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                        userAns === val
                          ? checked
                            ? val === stmt.answer
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'bg-destructive border-destructive text-primary-foreground'
                            : 'bg-accent/20 border-accent text-foreground'
                          : 'bg-secondary border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {val ? 'Wahr' : 'Falsch'}
                    </button>
                  ))}
                </div>
                {checked && (
                  <p className="text-xs mt-2 font-semibold" style={{ color: isCorrect ? 'var(--primary)' : 'var(--destructive)' }}>
                    {isCorrect ? 'Richtig!' : `Falsch — korrekt wäre: ${stmt.answer ? 'Wahr' : 'Falsch'}`}
                  </p>
                )}
              </div>
            )
          })}

          {!checked ? (
            <button
              onClick={handleCheck}
              disabled={!allAnswered}
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-40 active:scale-95 transition-all mt-2"
            >
              Antworten prüfen
            </button>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all mt-2"
            >
              Ergebnis ansehen
            </button>
          )}
        </div>
      )}
    </PuzzleShell>
  )
}
