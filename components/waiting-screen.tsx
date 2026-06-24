'use client'

import { useEffect, useState } from 'react'
import { CAMP_START, formatDateDE } from '@/lib/days'

interface WaitingScreenProps {
  isAfterCamp: boolean
}

export default function WaitingScreen({ isAfterCamp }: WaitingScreenProps) {
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    if (isAfterCamp) return
    const tick = () => {
      const now = new Date()
      const diff = CAMP_START.getTime() - now.getTime()
      if (diff <= 0) {
        setCountdown('Gleich geht es los!')
        return
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const secs = Math.floor((diff % (1000 * 60)) / 1000)
      setCountdown(`${days}T ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isAfterCamp])

  if (isAfterCamp) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
        <div className="text-8xl mb-6 animate-float">🏕️</div>
        <h1 className="font-heading text-4xl md:text-5xl text-primary mb-4">
          Das Zeltlager ist vorbei!
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Alle 12 Tage sind geschafft. Wir hoffen, es hat Spaß gemacht!
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="relative mb-8">
        <div className="text-8xl animate-float">⛺</div>
      </div>

      <h1 className="font-heading text-4xl md:text-5xl text-primary mb-3 text-balance">
        Zeltlager Mittagessen
      </h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-sm text-pretty">
        Das erste Rätsel erscheint am{' '}
        <span className="font-bold text-foreground">{formatDateDE(CAMP_START)}</span>{' '}
        um 13:30 Uhr MEZ.
      </p>

      <div className="bg-card border border-border rounded-2xl px-8 py-6 shadow-sm">
        <p className="text-sm text-muted-foreground mb-2 uppercase tracking-widest font-semibold">
          Noch bis zum Start
        </p>
        <p className="font-heading text-5xl text-accent">{countdown}</p>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Jeden Tag um 13:30 MEZ gibt es ein neues Rätsel.
      </p>
    </main>
  )
}
