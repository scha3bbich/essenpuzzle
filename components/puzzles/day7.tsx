'use client'

import { useState } from 'react'
import PuzzleShell from '@/components/puzzle-shell'

import type { HangmanWord } from '@/lib/config'

const DEFAULT_WORDS_POOL: HangmanWord[] = [
  { word: 'MITTAGESSEN', hint: 'Was man mittags zu sich nimmt' },
  { word: 'LAGERFEUER', hint: 'Wärmt und erhellt das Zeltlager' },
  { word: 'KOCHLOEFFEL', hint: 'Wichtiges Küchenwerkzeug' },
]

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const MAX_WRONG = 6

interface Props { onSolved: () => void; content?: { words?: HangmanWord[] } }

export default function Day7({ onSolved, content }: Props) {
  const WORDS_POOL = content?.words?.length ? content.words : DEFAULT_WORDS_POOL
  const [wordIdx, setWordIdx] = useState(0)
  const [guessed, setGuessed] = useState<string[]>([])
  const [solved, setSolved] = useState(false)

  const { word, hint } = WORDS_POOL[wordIdx]
  const wrongGuesses = guessed.filter(l => !word.includes(l))
  const isWon = word.split('').every(l => guessed.includes(l))
  const isLost = wrongGuesses.length >= MAX_WRONG

  const handleGuess = (letter: string) => {
    if (guessed.includes(letter) || isWon || isLost) return
    const next = [...guessed, letter]
    setGuessed(next)
    const won = word.split('').every(l => next.includes(l))
    if (won) {
      if (wordIdx + 1 >= WORDS_POOL.length) {
        setTimeout(() => setSolved(true), 700)
      } else {
        setTimeout(() => {
          setWordIdx(i => i + 1)
          setGuessed([])
        }, 700)
      }
    }
  }

  const reset = () => {
    setGuessed([])
  }

  // Simple gallows SVG
  const gallows = (wrong: number) => (
    <svg viewBox="0 0 120 120" className="w-32 h-32 mx-auto" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      {/* Base */}
      <line x1="10" y1="110" x2="110" y2="110" />
      {/* Post */}
      <line x1="30" y1="110" x2="30" y2="10" />
      {/* Top */}
      <line x1="30" y1="10" x2="75" y2="10" />
      {/* Rope */}
      <line x1="75" y1="10" x2="75" y2="28" />
      {/* Head */}
      {wrong >= 1 && <circle cx="75" cy="36" r="8" />}
      {/* Body */}
      {wrong >= 2 && <line x1="75" y1="44" x2="75" y2="75" />}
      {/* Left arm */}
      {wrong >= 3 && <line x1="75" y1="52" x2="58" y2="65" />}
      {/* Right arm */}
      {wrong >= 4 && <line x1="75" y1="52" x2="92" y2="65" />}
      {/* Left leg */}
      {wrong >= 5 && <line x1="75" y1="75" x2="60" y2="95" />}
      {/* Right leg */}
      {wrong >= 6 && <line x1="75" y1="75" x2="90" y2="95" />}
    </svg>
  )

  return (
    <PuzzleShell
      day={7}
      title="Galgenmännchen"
      description="Rate das Zeltlager-Wort, bevor der Koch am Galgen hängt!"
    >
      {solved ? (
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="text-6xl animate-bounce-in">🎊</div>
          <p className="font-heading text-3xl text-primary">Alle Wörter geraten!</p>
          <button onClick={onSolved} className="mt-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl hover:opacity-90 active:scale-95 transition-all">
            Weiter
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between text-sm text-muted-foreground font-semibold">
            <span>Wort {wordIdx + 1} / {WORDS_POOL.length}</span>
            <span className="text-destructive">{wrongGuesses.length} / {MAX_WRONG} Fehler</span>
          </div>

          <div className="text-muted-foreground text-center text-xs font-semibold border border-border rounded-xl py-2">
            {gallows(wrongGuesses.length)}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Hinweis: <span className="font-semibold text-foreground">{hint}</span>
          </p>

          {/* Word display */}
          <div className="flex justify-center gap-2 flex-wrap">
            {word.split('').map((l, i) => (
              <span key={i} className="w-8 h-10 flex flex-col items-center justify-end gap-1">
                <span className="font-heading text-xl text-foreground">
                  {guessed.includes(l) ? l : ''}
                </span>
                <span className="w-full border-b-2 border-foreground" />
              </span>
            ))}
          </div>

          {isLost ? (
            <div className="text-center">
              <p className="text-destructive font-bold">Das Wort war: <span className="text-foreground">{word}</span></p>
              <button onClick={reset} className="mt-2 bg-destructive/10 border border-destructive text-destructive font-bold px-4 py-2 rounded-xl text-sm hover:bg-destructive/20 transition-all">
                Nochmal versuchen
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 justify-center">
              {ALPHABET.map(l => {
                const isGuessed = guessed.includes(l)
                const isCorrect = isGuessed && word.includes(l)
                const isWrong = isGuessed && !word.includes(l)
                return (
                  <button
                    key={l}
                    onClick={() => handleGuess(l)}
                    disabled={isGuessed}
                    className={`w-8 h-8 text-xs font-bold rounded-lg border-2 transition-all ${isCorrect ? 'bg-primary/20 border-primary text-primary' :
                        isWrong ? 'bg-muted border-muted text-muted-foreground opacity-40' :
                          'bg-secondary border-border text-foreground hover:bg-muted active:scale-95'
                      }`}
                  >
                    {l}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </PuzzleShell>
  )
}
