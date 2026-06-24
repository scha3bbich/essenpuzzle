'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { getNextDayUnlockTime, TOTAL_DAYS } from '@/lib/days'

interface SolvedScreenProps {
  day: number
  onDayChange: () => void
}

export default function SolvedScreen({ day, onDayChange }: SolvedScreenProps) {
  const nextUnlock = getNextDayUnlockTime(day)
  const [countdown, setCountdown] = useState('')
  const isLastDay = day >= TOTAL_DAYS

  useEffect(() => {
    if (!nextUnlock) return
    const tick = () => {
      const now = new Date()
      const diff = nextUnlock.getTime() - now.getTime()
      if (diff <= 0) {
        setCountdown('Neues Rätsel verfügbar!')
        onDayChange()
        return
      }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const secs = Math.floor((diff % (1000 * 60)) / 1000)
      setCountdown(
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [day, nextUnlock, onDayChange])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="animate-bounce-in w-full max-w-lg flex flex-col items-center text-center gap-6">

        <div className="bg-primary text-primary-foreground rounded-full px-5 py-1.5 text-sm font-semibold uppercase tracking-widest">
          Tag {day} geschafft!
        </div>

        <h1 className="font-heading text-4xl md:text-5xl text-primary text-balance">
          Gut gemacht!
        </h1>

        <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-lg border-4 border-primary/20">
          <Image
            src="/camp-success.png"
            alt="Zeltlager Mittagessen Szene"
            fill
            className="object-cover"
            priority
          />
        </div>

        {isLastDay ? (
          <div className="bg-accent/10 border border-accent/30 rounded-2xl px-6 py-5 w-full">
            <p className="font-heading text-2xl text-accent mb-1">Alle 12 Tage gemeistert!</p>
            <p className="text-muted-foreground">
              Ihr habt alle Rätsel des Zeltlagers gelöst. Mahlzeit!
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl px-6 py-5 w-full shadow-sm">
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mb-2">
              Nächstes Rätsel in
            </p>
            <p className="font-heading text-5xl text-accent">{countdown}</p>
            <p className="text-muted-foreground text-sm mt-2">
              Tag {day + 1} erscheint um 13:30 MEZ
            </p>
          </div>
        )}

        <p className="text-muted-foreground text-sm max-w-xs text-pretty">
          Bis zum nächsten Rätsel könnt ihr entspannen und das Lagerfeuer genießen.
        </p>
      </div>
    </main>
  )
}
