'use client'

import { useEffect, useState, useCallback } from 'react'
import { DEFAULT_CONFIG, type AdminConfig, type DayConfig } from '@/lib/config'
import ImageUploader from './components/image-uploader'
import PuzzleContentEditor from './components/puzzle-editors'

const DAY_LABELS = [
  'Tag 1 – Quiz',
  'Tag 2 – Memory',
  'Tag 3 – Anagramm',
  'Tag 4 – Wortsuche',
  'Tag 5 – Mathe',
  'Tag 6 – Wahr/Falsch',
  'Tag 7 – Galgenmann',
  'Tag 8 – Sortieren',
  'Tag 9 – Ratsel',
  'Tag 10 – Hitster',
  'Tag 11 – Code',
  'Tag 12 – Finale',
]

export default function AdminPage() {
  const [config, setConfig] = useState<AdminConfig | null>(null)
  const [activeDay, setActiveDay] = useState(0) // 0-based index
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/config', { cache: 'no-store' })
      .then(r => r.json())
      .then((cfg: AdminConfig) => setConfig(cfg))
      .catch(() => setConfig(DEFAULT_CONFIG))
      .finally(() => setLoading(false))
  }, [])

  const save = useCallback(async (cfg: AdminConfig) => {
    setSaving(true)
    setSaveStatus('idle')
    setSaveError('')
    try {
      const bodyStr = JSON.stringify(cfg)
      console.log('[v0] admin: saving config, body size =', bodyStr.length, 'bytes')
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string; detail?: string }
        const msg = data.detail ?? data.error ?? `HTTP ${res.status}`
        console.error('[v0] admin: save failed:', msg)
        setSaveError(msg)
        setSaveStatus('error')
        return
      }
      setSaveStatus('saved')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[v0] admin: save exception:', msg)
      setSaveError(msg)
      setSaveStatus('error')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveStatus('idle'), 6000)
    }
  }, [])

  const updateDay = (idx: number, patch: Partial<DayConfig>) => {
    if (!config) return
    const newConfig: AdminConfig = {
      days: config.days.map((d, i) => (i === idx ? { ...d, ...patch } : d)),
    }
    setConfig(newConfig)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!config) return null

  const day = config.days[activeDay]

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="font-heading text-lg font-extrabold text-foreground leading-tight">
            Zeltlager Admin
          </h1>
          <p className="text-xs text-muted-foreground">Versteckte Konfigurationsansicht</p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'saved' && (
            <span className="text-xs text-primary font-semibold animate-fade-in">Gespeichert</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-destructive font-semibold max-w-xs truncate" title={saveError}>
              Fehler: {saveError || 'Unbekannter Fehler'}
            </span>
          )}
          <button
            onClick={() => save(config)}
            disabled={saving}
            className="bg-primary text-primary-foreground font-bold text-sm px-5 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Speichern...
              </>
            ) : 'Speichern'}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Day tabs – scrollable on mobile */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {DAY_LABELS.map((label, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className={`shrink-0 text-xs font-bold px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeDay === i
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Day editor card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Card header */}
          <div className="bg-primary/5 border-b border-border px-5 py-4">
            <h2 className="font-heading text-xl font-extrabold text-foreground">{DAY_LABELS[activeDay]}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(2026, 6, 12 + activeDay).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="p-5 flex flex-col gap-8">
            {/* Unlock time */}
            <section>
              <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-xs font-extrabold flex items-center justify-center">1</span>
                Freischaltzeit (MEZ)
              </h3>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={day.unlockTimeMEZ}
                  onChange={e => updateDay(activeDay, { unlockTimeMEZ: e.target.value })}
                  className="border border-border rounded-xl px-4 py-2.5 text-sm font-bold bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="text-xs text-muted-foreground">
                  Standard: 13:30 — Anderung gilt sofort nach dem Speichern.
                </p>
              </div>
            </section>

            <hr className="border-border" />

            {/* Success image */}
            <section>
              <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-xs font-extrabold flex items-center justify-center">2</span>
                Erfolgsbild (nach dem Losen)
              </h3>
              <ImageUploader
                day={activeDay + 1}
                value={day.successImageUrl}
                onChange={url => updateDay(activeDay, { successImageUrl: url })}
              />
            </section>

            <hr className="border-border" />

            {/* Puzzle content */}
            <section>
              <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-xs font-extrabold flex items-center justify-center">3</span>
                Ratselinhalt
              </h3>
              <PuzzleContentEditor
                day={activeDay + 1}
                content={day.puzzleContent}
                onChange={content => updateDay(activeDay, { puzzleContent: content })}
              />
            </section>
          </div>
        </div>

        {/* Bottom save button (convenience) */}
        <div className="flex justify-end">
          <button
            onClick={() => save(config)}
            disabled={saving}
            className="bg-primary text-primary-foreground font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? 'Speichern...' : 'Alle Anderungen speichern'}
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground pb-4">
          Admin-Bereich — URL bleibt unveroffentlicht. Anderungen werden in Vercel Blob gespeichert.
        </p>
      </div>
    </div>
  )
}
