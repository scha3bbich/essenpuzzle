'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { TOTAL_DAYS } from '@/lib/days'

interface SolvedScreenProps {
  day: number
  onDayChange: () => void
  imageUrl?: string
  nextUnlockTime?: Date | null
}

export default function SolvedScreen({ day, onDayChange, imageUrl, nextUnlockTime }: SolvedScreenProps) {
  const nextUnlock = nextUnlockTime ?? null
  const displayImage = imageUrl || '/camp-success.png'
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
    <main className="fixed inset-0 bg-background">
      {/* Full-screen image */}
      <Image
        src={displayImage}
        alt={`Erfolgsbild Tag ${day}`}
        fill
        className="object-cover"
        priority
        unoptimized
      />

      {/* Dark gradient overlay at bottom so text is always readable */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-6 px-5 flex flex-col items-center gap-3 text-center">

        <div className="bg-primary text-primary-foreground rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-widest">
          Tag {day} geschafft!
        </div>

        <h1 className="font-heading text-3xl md:text-4xl text-white text-balance drop-shadow">
          Gut gemacht!
        </h1>

        {isLastDay ? (
          <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 w-full max-w-sm">
            <p className="font-heading text-xl text-accent mb-0.5">Alle 12 Tage gemeistert!</p>
            <p className="text-white/80 text-sm">
              Ihr habt alle Rätsel des Zeltlagers gelöst. Mahlzeit!
            </p>
          </div>
        ) : (
          <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 w-full max-w-sm">
            <p className="text-xs text-white/60 uppercase tracking-widest font-semibold mb-1">
              Nächstes Rätsel in
            </p>
            <p className="font-heading text-4xl text-white">{countdown}</p>
            <p className="text-white/60 text-xs mt-1">
              Tag {day + 1} erscheint um 13:30 MEZ
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
