'use client'

import { useEffect, useState } from 'react'
import {
  getCurrentDay,
  isDaySolved,
  TOTAL_DAYS,
  getDayUnlockTime,
} from '@/lib/days'
import WaitingScreen from '@/components/waiting-screen'
import SolvedScreen from '@/components/solved-screen'
import DayPuzzle from '@/components/day-puzzle'

export default function Home() {
  const [currentDay, setCurrentDay] = useState<number | null | 'loading'>('loading')
  const [solved, setSolved] = useState(false)

  useEffect(() => {
    // Dev/preview override: ?tag=N in URL forces a specific day
    const params = new URLSearchParams(window.location.search)
    const previewDay = params.get('tag')
    if (previewDay) {
      const n = parseInt(previewDay, 10)
      if (n >= 1 && n <= 12) {
        setCurrentDay(n)
        setSolved(isDaySolved(n))
        return
      }
    }

    const refresh = () => {
      const day = getCurrentDay()
      setCurrentDay(day)
      if (day !== null) {
        setSolved(isDaySolved(day))
      }
    }
    refresh()
    const interval = setInterval(refresh, 30_000)
    return () => clearInterval(interval)
  }, [])

  const handleSolved = () => {
    setSolved(true)
  }

  if (currentDay === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (currentDay === null) {
    const now = new Date()
    const isAfterCamp = now > getDayUnlockTime(TOTAL_DAYS)
    return <WaitingScreen isAfterCamp={isAfterCamp} />
  }

  if (solved) {
    return (
      <SolvedScreen
        day={currentDay}
        onDayChange={() => {
          const newDay = getCurrentDay()
          setCurrentDay(newDay)
          if (newDay !== null) setSolved(isDaySolved(newDay))
        }}
      />
    )
  }

  return <DayPuzzle day={currentDay} onSolved={handleSolved} />
}
