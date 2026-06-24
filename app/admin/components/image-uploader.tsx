'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

interface Props {
  day: number
  value: string
  onChange: (url: string) => void
}

export default function ImageUploader({ day, value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [error, setError] = useState('')

  const upload = async (file: File) => {
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('day', String(day))
    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload fehlgeschlagen')
      onChange(json.url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fehler')
    } finally {
      setUploading(false)
    }
  }

  const applyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      setUrlInput('')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Preview */}
      {value && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-muted">
          <Image
            src={value}
            alt={`Erfolgsbild Tag ${day}`}
            fill
            className="object-cover"
            unoptimized
          />
          <button
            onClick={() => onChange('/camp-success.png')}
            className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-lg opacity-80 hover:opacity-100 transition-opacity"
          >
            Entfernen
          </button>
        </div>
      )}

      {/* Drop zone / file button */}
      <div
        className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) upload(file)
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) upload(f)
            e.target.value = ''
          }}
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Hochladen...
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Bild hier ablegen oder{' '}
            <span className="text-primary font-semibold">klicken zum Auswahlen</span>
          </p>
        )}
      </div>

      {/* URL input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && applyUrl()}
          placeholder="Oder Bild-URL eingeben..."
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          onClick={applyUrl}
          className="bg-secondary text-secondary-foreground font-semibold text-sm px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
        >
          Ubernehmen
        </button>
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}
