'use client'

import { useState } from 'react'
import PuzzleShell from '@/components/puzzle-shell'

// 8x8 grid, words: SUPPE, BROT, SALZ, TOPF
const GRID = [
  ['S', 'U', 'P', 'P', 'E', 'R', 'A', 'T'],
  ['A', 'L', 'T', 'O', 'P', 'F', 'N', 'E'],
  ['L', 'A', 'G', 'E', 'R', 'F', 'E', 'U'],
  ['Z', 'S', 'B', 'R', 'O', 'T', 'K', 'M'],
  ['K', 'E', 'I', 'N', 'S', 'A', 'L', 'Z'],
  ['T', 'O', 'P', 'F', 'C', 'H', 'I', 'P'],
  ['W', 'A', 'S', 'S', 'E', 'R', 'N', 'O'],
  ['G', 'R', 'A', 'S', 'T', 'A', 'G', 'S'],
]

// [word, [[row,col], ...]]
const SOLUTIONS: [string, [number, number][]][] = [
  ['SUPPE', [[0,0],[0,1],[0,2],[0,3],[0,4]]],
  ['TOPF',  [[1,3],[1,4],[1,5],[2,3]]],   // actually T-O-P-F: row1col1=L... let me fix
  ['SALZ',  [[0,0],[1,0],[2,0],[3,0]]],
  ['BROT',  [[3,2],[3,3],[3,4],[3,5]]],
]

// Corrected TOPF: row1=[A,L,T,O,P,F,N,E] -> col2=T,col3=O,col4=P,col5=F
const SOLUTION_MAP: Record<string, [number, number][]> = {
  'SUPPE': [[0,0],[0,1],[0,2],[0,3],[0,4]],
  'TOPF':  [[1,2],[1,3],[1,4],[1,5]],
  'SALZ':  [[0,0],[1,0],[2,0],[3,0]],
  'BROT':  [[3,2],[3,3],[3,4],[3,5]],
}

const WORDS_TO_FIND = ['SUPPE', 'TOPF', 'SALZ', 'BROT']

function cellKey(r: number, c: number) { return `${r}-${c}` }

interface Props { onSolved: () => void }

export default function Day4({ onSolved }: Props) {
  const [found, setFound] = useState<string[]>([])
  const [selecting, setSelecting] = useState<[number, number][]>([])
  const [wrong, setWrong] = useState(false)

  const foundCells = new Set<string>(
    found.flatMap(w => (SOLUTION_MAP[w] || []).map(([r, c]) => cellKey(r, c)))
  )
  const selectingCells = new Set<string>(selecting.map(([r, c]) => cellKey(r, c)))

  const toggleCell = (r: number, c: number) => {
    const key = cellKey(r, c)
    if (foundCells.has(key)) return
    setSelecting(prev => {
      if (prev.some(([pr, pc]) => pr === r && pc === c)) {
        return prev.filter(([pr, pc]) => !(pr === r && pc === c))
      }
      return [...prev, [r, c]]
    })
    setWrong(false)
  }

  const checkSelection = () => {
    for (const word of WORDS_TO_FIND) {
      if (found.includes(word)) continue
      const sol = SOLUTION_MAP[word]
      if (
        selecting.length === sol.length &&
        sol.every(([r, c]) => selecting.some(([sr, sc]) => sr === r && sc === c))
      ) {
        const newFound = [...found, word]
        setFound(newFound)
        setSelecting([])
        if (newFound.length === WORDS_TO_FIND.length) {
          setTimeout(onSolved, 800)
        }
        return
      }
    }
    setWrong(true)
    setTimeout(() => { setSelecting([]); setWrong(false) }, 700)
  }

  return (
    <PuzzleShell
      day={4}
      title="Wortsuche"
      description="Finde die 4 Zeltlager-Wörter im Buchstabengitter! Markiere die Buchstaben und bestätige."
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 flex-wrap">
          {WORDS_TO_FIND.map(w => (
            <span
              key={w}
              className={`px-3 py-1 rounded-lg text-sm font-bold border-2 transition-all ${
                found.includes(w)
                  ? 'bg-primary/15 border-primary text-primary line-through'
                  : 'bg-secondary border-border text-foreground'
              }`}
            >
              {w}
            </span>
          ))}
        </div>

        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(8, 1fr)` }}>
          {GRID.map((row, r) =>
            row.map((ch, c) => {
              const key = cellKey(r, c)
              const isFound = foundCells.has(key)
              const isSel = selectingCells.has(key)
              return (
                <button
                  key={key}
                  onClick={() => toggleCell(r, c)}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold transition-all select-none
                    ${isFound ? 'bg-primary text-primary-foreground' : ''}
                    ${isSel && !isFound ? 'bg-accent text-accent-foreground scale-110' : ''}
                    ${!isFound && !isSel ? 'bg-secondary text-foreground hover:bg-muted' : ''}
                  `}
                >
                  {ch}
                </button>
              )
            })
          )}
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={checkSelection}
            disabled={selecting.length === 0}
            className="flex-1 bg-primary text-primary-foreground font-bold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 active:scale-95 transition-all"
          >
            Prüfen ({selecting.length} Buchstaben)
          </button>
          <button
            onClick={() => setSelecting([])}
            className="px-4 py-2.5 border-2 border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-all"
          >
            Reset
          </button>
        </div>
        {wrong && (
          <p className="text-destructive text-sm text-center font-semibold animate-wiggle">
            Kein passendes Wort — versuche es nochmal!
          </p>
        )}
        <p className="text-xs text-muted-foreground text-center">
          Gefunden: {found.length} / {WORDS_TO_FIND.length}
        </p>
      </div>
    </PuzzleShell>
  )
}
