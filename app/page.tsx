'use client'

import { useEffect, useState } from 'react'
import {
  isDaySolved,
  TOTAL_DAYS,
  getDayUnlockTimeWithConfig,
  getCurrentDayWithConfig,
  getNextDayUnlockTimeWithConfig,
} from '@/lib/days'
import { DEFAULT_CONFIG, type AdminConfig } from '@/lib/config'
import WaitingScreen from '@/components/waiting-screen'
import SolvedScreen from '@/components/solved-screen'
import DayPuzzle from '@/components/day-puzzle'

export default function Home() {
  const [currentDay, setCurrentDay] = useState<number | null | 'loading'>('loading')
  const [solved, setSolved] = useState(false)
  const [config, setConfig] = useState<AdminConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    // Load admin config (falls back to DEFAULT_CONFIG on error)
    fetch('/api/config', { cache: 'no-store' })
      .then(r => r.json())
      .then((cfg: AdminConfig) => {
        setConfig(cfg)
        boot(cfg)
      })
      .catch(() => boot(DEFAULT_CONFIG))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function boot(cfg: AdminConfig) {
    const unlockTimes = cfg.days.map(d => d.unlockTimeMEZ ?? null)

    // Dev/preview override: ?tag=N forces a specific day
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
      const day = getCurrentDayWithConfig(unlockTimes)
      setCurrentDay(day)
      if (day !== null) setSolved(isDaySolved(day))
    }
    refresh()
    const id = setInterval(refresh, 30_000)
    return () => clearInterval(id)
  }

  const unlockTimes = config.days.map(d => d.unlockTimeMEZ ?? null)

  const handleSolved = () => setSolved(true)

  const handleDayChange = () => {
    const newDay = getCurrentDayWithConfig(unlockTimes)
    setCurrentDay(newDay)
    if (newDay !== null) setSolved(isDaySolved(newDay))
  }

  if (currentDay === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (currentDay === null) {
    const day1Unlock = getDayUnlockTimeWithConfig(1, unlockTimes[0])
    const lastDayUnlock = getDayUnlockTimeWithConfig(TOTAL_DAYS, unlockTimes[TOTAL_DAYS - 1])
    const now = new Date()
    const isAfterCamp = now > lastDayUnlock
    return <WaitingScreen isAfterCamp={isAfterCamp} campStart={day1Unlock} />
  }

  if (solved) {
    const imageUrl = config.days[currentDay - 1]?.successImageUrl
    const nextUnlock = getNextDayUnlockTimeWithConfig(currentDay, unlockTimes)
    return (
      <SolvedScreen
        day={currentDay}
        onDayChange={handleDayChange}
        imageUrl={imageUrl}
        nextUnlockTime={nextUnlock}
      />
    )
  }

  return <DayPuzzle day={currentDay} onSolved={handleSolved} config={config} />
}
