'use client'

import { useState } from 'react'
import PuzzleShell from '@/components/puzzle-shell'

interface Props { onSolved: () => void }

type SlotKey = 'fun' | 'favorite' | 'wish'

interface SlotDef {
  key: SlotKey
  title: string
  description: string
}

const SLOTS: SlotDef[] = [
  {
    key: 'fun',
    title: 'Foto 1',
    description: 'Ein Foto, das zeigt wie viel Spaß euch der Kalender gemacht hat.',
  },
  {
    key: 'favorite',
    title: 'Foto 2',
    description: 'Euer Lieblings-Zeltlager Bild.',
  },
  {
    key: 'wish',
    title: 'Foto 3',
    description: 'Ein Essen, das ihr am liebsten mal im Zeltlager auf dem Essensplan haben wollt.',
  },
]

export default function Day12({ onSolved }: Props) {
  const [photos, setPhotos] = useState<Record<SlotKey, string>>({ fun: '', favorite: '', wish: '' })
  const [uploading, setUploading] = useState<SlotKey | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const setPhoto = (key: SlotKey, url: string) => setPhotos(p => ({ ...p, [key]: url }))

  const uploadFile = async (key: SlotKey, file: File) => {
    setUploading(key)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('day', '12')
      const res = await fetch('/api/upload-image', { method: 'POST', body: formData })
      const data = (await res.json()) as { url?: string; error?: string }
      if (data.url) setPhoto(key, data.url)
      else setError(data.error ?? 'Upload fehlgeschlagen.')
    } catch {
      setError('Upload fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setUploading(null)
    }
  }

  const allFilled = SLOTS.every(s => photos[s.key].trim() !== '')

  const handleSubmit = async () => {
    if (!allFilled) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/day12-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photos),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? 'Absenden fehlgeschlagen.')
        setSubmitting(false)
        return
      }
      onSolved()
    } catch {
      setError('Absenden fehlgeschlagen. Bitte versuche es erneut.')
      setSubmitting(false)
    }
  }

  return (
    <PuzzleShell
      day={12}
      title="Fotos für Johannes"
      description="Zum Abschluss: Ladet drei Fotos hoch (oder fügt einen Foto-Link ein). Wenn alle drei da sind, könnt ihr sie abschicken."
    >
      <div className="flex flex-col gap-5">
        {SLOTS.map((slot, idx) => {
          const url = photos[slot.key]
          const isUploading = uploading === slot.key
          return (
            <div key={slot.key} className="bg-secondary rounded-2xl p-4 border border-border flex flex-col gap-3">
              <div>
                <p className="font-bold text-foreground">{slot.title}</p>
                <p className="text-sm text-muted-foreground text-pretty">{slot.description}</p>
              </div>

              {url ? (
                <div className="flex flex-col gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Vorschau ${slot.title}`}
                    className="w-full max-h-56 object-contain rounded-xl border border-border bg-background"
                  />
                  <div className="flex gap-2">
                    <label className="flex-1 text-center text-sm font-bold text-primary border border-primary/40 rounded-xl px-3 py-2 cursor-pointer hover:bg-primary/10 transition-colors">
                      Ändern
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) uploadFile(slot.key, file)
                          e.target.value = ''
                        }}
                      />
                    </label>
                    <button
                      onClick={() => setPhoto(slot.key, '')}
                      className="flex-1 text-sm font-bold text-destructive border border-destructive/40 rounded-xl px-3 py-2 hover:bg-destructive/10 transition-colors"
                    >
                      Entfernen
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className={`text-center text-sm font-bold rounded-xl px-3 py-3 cursor-pointer transition-colors ${
                    isUploading
                      ? 'bg-muted text-muted-foreground cursor-wait'
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}>
                    {isUploading ? 'Wird hochgeladen…' : 'Foto hochladen'}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) uploadFile(slot.key, file)
                        e.target.value = ''
                      }}
                    />
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">oder Foto-Link einfügen</span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <input
                    type="url"
                    inputMode="url"
                    placeholder="https://…"
                    value={url}
                    onChange={e => setPhoto(slot.key, e.target.value)}
                    className="border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              )}

              <p className="text-xs text-muted-foreground font-semibold">
                {idx + 1} / {SLOTS.length} {url ? '· bereit' : '· fehlt noch'}
              </p>
            </div>
          )
        })}

        {error && (
          <p className="text-sm text-destructive font-semibold text-center">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!allFilled || submitting}
          className="bg-primary text-primary-foreground font-bold px-6 py-3.5 rounded-2xl text-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? 'Wird abgeschickt…' : allFilled ? 'Abschicken' : `Noch ${SLOTS.filter(s => !photos[s.key].trim()).length} Foto(s) fehlen`}
        </button>
      </div>
    </PuzzleShell>
  )
}
