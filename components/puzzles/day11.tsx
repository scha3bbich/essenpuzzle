'use client'

import { useState } from 'react'
import PuzzleShell from '@/components/puzzle-shell'
import type { CookWord } from '@/lib/config'

interface Props {
  onSolved: () => void
  content?: {
    cooks?: CookWord[]
  }
}

export default function Day11({ onSolved, content }: Props) {
  const cooks = (content?.cooks ?? []).filter(c => c.name.trim() && c.word.trim())

  const [inputs, setInputs] = useState<string[]>(() => Array(cooks.length).fill(''))
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>('idle')

  const norm = (s: string) => s.trim().toLowerCase()

  // Which cooks are already correctly solved (live feedback per field)
  const solvedFlags = cooks.map((c, i) => norm(inputs[i] ?? '') === norm(c.word))
  const allCorrect = cooks.length > 0 && solvedFlags.every(Boolean)

  const handleChange = (idx: number, val: string) => {
    setInputs(prev => {
      const next = [...prev]
      next[idx] = val
      return next
    })
    setStatus('idle')
  }

  const check = () => {
    if (allCorrect) {
      setStatus('correct')
      setTimeout(onSolved, 1000)
    } else {
      setStatus('wrong')
      setTimeout(() => setStatus('idle'), 900)
    }
  }

  if (cooks.length === 0) {
    return (
      <PuzzleShell day={11} title="Die Köche" description="">
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-muted-foreground">
          <p className="text-lg font-semibold">Noch keine Köche hinterlegt.</p>
          <p className="text-sm">Bitte im Admin-Panel unter Tag 11 die Köche und Lösungswörter hinzufügen.</p>
        </div>
      </PuzzleShell>
    )
  }

  return (
    <PuzzleShell
      day={11}
      title="Die Köche"
      description="Überrede die Köche, dir ihr geheimes Lösungswort zu verraten — und trage es hier ein!"
    >
      <div className="flex flex-col gap-4">
        {cooks.map((cook, i) => {
          const isSolved = solvedFlags[i]
          const hasInput = (inputs[i] ?? '').length > 0
          return (
            <div
              key={i}
              className={`flex flex-col gap-2 rounded-2xl p-4 border transition-colors ${
                isSolved ? 'border-primary bg-primary/5' : 'border-border bg-secondary'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-foreground">{cook.name}</span>
                {isSolved && (
                  <span className="text-xs bg-primary/15 text-primary rounded-full px-2.5 py-0.5 font-bold shrink-0">
                    Gelöst
                  </span>
                )}
              </div>
              <input
                type="text"
                value={inputs[i] ?? ''}
                onChange={e => handleChange(i, e.target.value)}
                placeholder="Lösungswort eingeben …"
                className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none font-semibold transition-all ${
                  isSolved
                    ? 'border-primary bg-primary/10 text-primary'
                    : hasInput && status === 'wrong'
                    ? 'border-destructive bg-destructive/10 text-destructive'
                    : 'border-border bg-background text-foreground focus:border-accent'
                }`}
              />
            </div>
          )
        })}

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-semibold">
            {solvedFlags.filter(Boolean).length} / {cooks.length} Wörter richtig
          </span>
        </div>

        <button
          onClick={check}
          disabled={inputs.some(v => !v.trim())}
          className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-40 active:scale-95 transition-all"
        >
          Lösung prüfen
        </button>

        {status === 'wrong' && (
          <p className="text-sm text-destructive text-center font-semibold animate-wiggle">
            Noch nicht alle Wörter stimmen — versuch es weiter!
          </p>
        )}
        {status === 'correct' && (
          <p className="text-sm text-primary text-center font-semibold">Alle Wörter richtig!</p>
        )}
      </div>
    </PuzzleShell>
  )
}
