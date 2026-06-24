'use client'

import { useState } from 'react'
import PuzzleShell from '@/components/puzzle-shell'

import type { ScrambleWord } from '@/lib/config'

const DEFAULT_WORDS: ScrambleWord[] = [
  { scrambled: 'PTEOP', answer: 'TOPFE', hint: 'Damit kocht man Suppe' },
  { scrambled: 'SAESL', answer: 'SALSE', hint: 'Damit würzt man alles' },
  { scrambled: 'EFRREU', answer: 'FEURER', hint: 'Darauf wird gekocht' },
  { scrambled: 'EGMEUS', answer: 'GEMUESE', hint: 'Gesundes Mittagessen' },
]

interface Props { onSolved: () => void; content?: { words?: ScrambleWord[] } }

export default function Day3({ onSolved, content }: Props) {
  const WORDS = content?.words?.length ? content.words : DEFAULT_WORDS
  const [current, setCurrent] = useState(0)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [done, setDone] = useState(false)

  const word = WORDS[current]

  const check = () => {
    const normalized = input.trim().toUpperCase()
    if (normalized === word.answer) {
      setStatus('correct')
      setTimeout(() => {
        if (current + 1 >= WORDS.length) {
          setDone(true)
        } else {
          setCurrent(c => c + 1)
          setInput('')
          setStatus('idle')
        }
      }, 900)
    } else {
      setStatus('wrong')
      setTimeout(() => setStatus('idle'), 800)
    }
  }

  return (
    <PuzzleShell
      day={3}
      title="Buchstaben-Chaos"
      description="Die Küche ist durcheinander! Ordne die Buchstaben, um das richtige Wort zu finden."
    >
      {done ? (
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="text-6xl animate-bounce-in">✅</div>
          <p className="font-heading text-3xl text-primary">Küche wieder in Ordnung!</p>
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
            <span>Wort {current + 1} / {WORDS.length}</span>
          </div>

          <div className="flex justify-center gap-2 my-2">
            {word.scrambled.split('').map((ch, i) => (
              <span
                key={i}
                className="w-10 h-10 flex items-center justify-center bg-accent/10 border-2 border-accent text-accent font-heading text-xl rounded-xl"
              >
                {ch}
              </span>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Hinweis: <span className="font-semibold text-foreground">{word.hint}</span>
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && check()}
              maxLength={word.answer.length + 2}
              placeholder="Deine Antwort..."
              className={`flex-1 border-2 rounded-xl px-4 py-2.5 font-bold text-lg uppercase outline-none transition-all ${
                status === 'correct'
                  ? 'border-primary bg-primary/10 text-primary'
                  : status === 'wrong'
                  ? 'border-destructive bg-destructive/10 text-destructive'
                  : 'border-border bg-background text-foreground'
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
              Leider falsch — versuch es nochmal!
            </p>
          )}
          {status === 'correct' && (
            <p className="text-sm text-primary text-center font-semibold">
              Richtig!
            </p>
          )}
        </div>
      )}
    </PuzzleShell>
  )
}
