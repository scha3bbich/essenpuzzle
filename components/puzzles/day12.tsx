'use client'

import { useState } from 'react'
import PuzzleShell from '@/components/puzzle-shell'

import type { FinalStage } from '@/lib/config'

const DEFAULT_STAGES: FinalStage[] = [
  { type: 'quiz', question: 'Was ist das Lieblingsessen vieler Zeltlager-Kinder?', options: ['Rotkohl', 'Nudeln mit Tomatensauce', 'Fischsuppe', 'Blattsalat'], answer: '1' },
  { type: 'input', question: 'Wie viele Tage hat dieses Zeltlager-Abenteuer gedauert?', answer: '12', hint: 'So viele Rätsel gab es' },
  { type: 'quiz', question: 'Was ist das Wichtigste beim Kochen im Freien?', options: ['Scharfe Messer', 'Feuer und sicherer Umgang damit', 'Schnelle Zubereitung', 'Teure Zutaten'], answer: '1' },
  { type: 'input', question: 'Was serviert man traditionell am Ende eines Zeltlager-Mittagessens zum Nachtisch?', answer: 'OBST', hint: 'Wächst auf Bäumen oder Sträuchern — z.B. Apfel oder Banane' },
]

interface Props { onSolved: () => void; content?: { stages?: FinalStage[] } }

export default function Day12({ onSolved, content }: Props) {
  const STAGES = content?.stages?.length ? content.stages : DEFAULT_STAGES
  const [stage, setStage] = useState(0)
  const [input, setInput] = useState('')
  const [selected, setSelected] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [done, setDone] = useState(false)

  const current = STAGES[stage]
  const correctIdx = current.type === 'quiz' ? parseInt(current.answer, 10) : -1

  const advance = () => {
    if (stage + 1 >= STAGES.length) {
      setDone(true)
    } else {
      setStage(s => s + 1)
      setInput('')
      setSelected(null)
      setStatus('idle')
    }
  }

  const checkInput = () => {
    if (current.type !== 'input') return
    if (input.trim().toUpperCase() === current.answer.toUpperCase()) {
      setStatus('correct')
      setTimeout(advance, 800)
    } else {
      setStatus('wrong')
      setTimeout(() => setStatus('idle'), 800)
    }
  }

  const handleOption = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    if (idx === correctIdx) {
      setStatus('correct')
      setTimeout(advance, 900)
    } else {
      setStatus('wrong')
    }
  }

  const retryOption = () => {
    setSelected(null)
    setStatus('idle')
  }

  return (
    <PuzzleShell
      day={12}
      title="Das grosse Finale"
      description="Der letzte Tag im Zeltlager! Bestehe die finale Herausforderung!"
    >
      {done ? (
        <div className="flex flex-col items-center gap-5 text-center py-4">
          <div className="text-7xl animate-bounce-in">🏕️</div>
          <div>
            <p className="font-heading text-4xl text-primary mb-1">Geschafft!</p>
            <p className="text-muted-foreground text-pretty max-w-xs mx-auto">
              Du hast alle 12 Tage des Zeltlager-Abenteuers gemeistert. Was für ein Mittagessen!
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center text-2xl">
            {['🥕', '🍲', '🌽', '🥗', '🍞', '🧅'].map((e, i) => (
              <span key={i} className="animate-float" style={{ animationDelay: `${i * 0.2}s` }}>{e}</span>
            ))}
          </div>
          <button
            onClick={onSolved}
            className="mt-2 bg-primary text-primary-foreground font-bold px-8 py-3 rounded-2xl text-lg hover:opacity-90 active:scale-95 transition-all"
          >
            Zum Abschluss
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex justify-between text-sm text-muted-foreground font-semibold">
            <span>Aufgabe {stage + 1} / {STAGES.length}</span>
            <span className="text-accent font-bold">Finaltag!</span>
          </div>

          <div className="bg-secondary rounded-2xl p-4 border border-border">
            <p className="font-semibold text-foreground text-pretty">{current.question}</p>
          </div>

          {current.type === 'quiz' ? (
            <div className="flex flex-col gap-2">
              {(current.options ?? []).map((opt, idx) => {
                let cls = 'border-border bg-background text-foreground hover:bg-muted'
                if (selected !== null) {
                  if (idx === correctIdx) cls = 'border-primary bg-primary/10 text-primary'
                  else if (idx === selected) cls = 'border-destructive bg-destructive/10 text-destructive'
                  else cls = 'border-border bg-background text-muted-foreground opacity-50'
                }
                return (
                  <button key={idx} onClick={() => handleOption(idx)} className={`w-full text-left px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${cls}`}>
                    {opt}
                  </button>
                )
              })}
              {status === 'wrong' && (
                <button onClick={retryOption} className="text-sm text-destructive underline text-center mt-1">
                  Nochmal versuchen
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {current.hint && (
                <p className="text-sm text-muted-foreground">Hinweis: <span className="font-semibold text-foreground">{current.hint}</span></p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && checkInput()}
                  placeholder="Deine Antwort..."
                  className={`flex-1 border-2 rounded-xl px-4 py-2.5 font-bold text-lg uppercase outline-none transition-all ${
                    status === 'correct' ? 'border-primary bg-primary/10 text-primary' :
                    status === 'wrong' ? 'border-destructive bg-destructive/10 text-destructive' :
                    'border-border bg-background text-foreground'
                  }`}
                />
                <button onClick={checkInput} className="bg-primary text-primary-foreground font-bold px-5 rounded-xl hover:opacity-90 active:scale-95 transition-all">
                  OK
                </button>
              </div>
              {status === 'wrong' && (
                <p className="text-sm text-destructive text-center font-semibold animate-wiggle">Leider falsch!</p>
              )}
            </div>
          )}
        </div>
      )}
    </PuzzleShell>
  )
}
