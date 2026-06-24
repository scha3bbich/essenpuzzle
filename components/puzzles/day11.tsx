'use client'

import { useState } from 'react'
import PuzzleShell from '@/components/puzzle-shell'

const DEFAULT_ENCODED = [19, 21, 16, 16, 5]
const DEFAULT_ANSWER = 'SUPPE'
const DEFAULT_CLUES = [
  { clue: 'Erstes Buchstabe: Im Alphabet der 19. Buchstabe' },
  { clue: '4. Buchstabe: Genauso wie der 3. Buchstabe' },
  { clue: 'Letzter Buchstabe: Der 5. Buchstabe im Alphabet' },
]

interface Props {
  onSolved: () => void
  content?: {
    encoded?: number[]
    answer?: string
    clues?: Array<{ clue: string }>
  }
}

export default function Day11({ onSolved, content }: Props) {
  const ENCODED = content?.encoded?.length ? content.encoded : DEFAULT_ENCODED
  const ANSWER = content?.answer?.trim().toUpperCase() || DEFAULT_ANSWER
  const CLUES = content?.clues?.length ? content.clues : DEFAULT_CLUES
  const [inputs, setInputs] = useState<string[]>(Array(ENCODED.length).fill(''))
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')

  const handleChange = (idx: number, val: string) => {
    const ch = val.toUpperCase().slice(-1)
    setInputs(prev => {
      const next = [...prev]
      next[idx] = ch
      return next
    })
    setStatus('idle')
  }

  const check = () => {
    const word = inputs.join('')
    if (word === ANSWER) {
      setStatus('correct')
      setTimeout(onSolved, 1000)
    } else {
      setStatus('wrong')
      setTimeout(() => setStatus('idle'), 800)
    }
  }

  return (
    <PuzzleShell
      day={11}
      title="Geheimer Code"
      description="Entschlüssele das geheime Zeltlager-Wort! Jede Zahl steht für einen Buchstaben (A=1, B=2, C=3 …)"
    >
      <div className="flex flex-col gap-5">
        {/* Code hint */}
        <div className="bg-secondary rounded-2xl p-4 border border-border">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-3">Verschlüsseltes Wort</p>
          <div className="flex gap-2 justify-center">
            {ENCODED.map((num, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="bg-accent/20 border-2 border-accent text-accent font-heading text-lg w-10 h-10 flex items-center justify-center rounded-xl">
                  {num}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">{i + 1}.</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hints */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Tipps</p>
          {CLUES.map((c, i) => (
            <div key={i} className="text-sm text-foreground bg-muted/50 rounded-xl px-3 py-2 border border-border">
              {c.clue}
            </div>
          ))}
        </div>

        {/* Answer inputs */}
        <div className="flex gap-2 justify-center">
          {ENCODED.map((_, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={inputs[i]}
              onChange={e => handleChange(i, e.target.value)}
              className={`w-10 h-12 text-center font-heading text-xl border-2 rounded-xl outline-none uppercase transition-all ${
                status === 'correct' ? 'border-primary bg-primary/10 text-primary' :
                status === 'wrong' ? 'border-destructive bg-destructive/10 text-destructive' :
                'border-border bg-background text-foreground'
              }`}
            />
          ))}
        </div>

        <button
          onClick={check}
          disabled={inputs.some(c => !c)}
          className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-40 active:scale-95 transition-all"
        >
          Code knacken
        </button>

        {status === 'wrong' && (
          <p className="text-sm text-destructive text-center font-semibold animate-wiggle">
            Falscher Code — versuch es nochmal!
          </p>
        )}
        {status === 'correct' && (
          <p className="text-sm text-primary text-center font-semibold">Code geknackt!</p>
        )}
      </div>
    </PuzzleShell>
  )
}
