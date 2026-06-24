import { ReactNode } from 'react'

interface PuzzleShellProps {
  day: number
  title: string
  description: string
  children: ReactNode
}

export default function PuzzleShell({ day, title, description, children }: PuzzleShellProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <span className="bg-primary text-primary-foreground rounded-full px-4 py-1 text-sm font-bold uppercase tracking-widest">
            Tag {day} von 12
          </span>
          <h1 className="font-heading text-3xl md:text-4xl text-foreground text-balance">{title}</h1>
          <p className="text-muted-foreground text-base max-w-sm text-pretty">{description}</p>
        </div>

        {/* Puzzle content */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  )
}
