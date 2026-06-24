'use client'

import { markDaySolved } from '@/lib/days'
import Day1 from './puzzles/day1'
import Day2 from './puzzles/day2'
import Day3 from './puzzles/day3'
import Day4 from './puzzles/day4'
import Day5 from './puzzles/day5'
import Day6 from './puzzles/day6'
import Day7 from './puzzles/day7'
import Day8 from './puzzles/day8'
import Day9 from './puzzles/day9'
import Day10 from './puzzles/day10'
import Day11 from './puzzles/day11'
import Day12 from './puzzles/day12'

interface Props {
  day: number
  onSolved: () => void
}

export default function DayPuzzle({ day, onSolved }: Props) {
  const handleSolved = () => {
    markDaySolved(day)
    onSolved()
  }

  const props = { onSolved: handleSolved }

  switch (day) {
    case 1:  return <Day1  {...props} />
    case 2:  return <Day2  {...props} />
    case 3:  return <Day3  {...props} />
    case 4:  return <Day4  {...props} />
    case 5:  return <Day5  {...props} />
    case 6:  return <Day6  {...props} />
    case 7:  return <Day7  {...props} />
    case 8:  return <Day8  {...props} />
    case 9:  return <Day9  {...props} />
    case 10: return <Day10 {...props} />
    case 11: return <Day11 {...props} />
    case 12: return <Day12 {...props} />
    default:
      return (
        <main className="min-h-screen flex items-center justify-center text-muted-foreground">
          Kein Rätsel für Tag {day} gefunden.
        </main>
      )
  }
}
