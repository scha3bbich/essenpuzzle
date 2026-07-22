'use client'

import { useEffect, useState } from 'react'
import type {
  DayPuzzleContent,
  QuizQuestion,
  ScrambleWord,
  MathRiddle,
  TrueFalseStatement,
  HangmanWord,
  HitsterPair,
  MemoryPair,
  GeoGuessrRound,
  CookWord,
} from '@/lib/config'

// ─── Shared helpers ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{children}</p>
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="text-sm text-primary font-semibold border border-primary/40 rounded-lg px-3 py-1.5 hover:bg-primary/10 transition-colors"
    >
      + {label}
    </button>
  )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-destructive hover:underline shrink-0"
    >
      Entfernen
    </button>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/40 w-full ${className}`}
    />
  )
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/40 w-full resize-y"
    />
  )
}

function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!value)}
        className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${value ? 'bg-primary' : 'bg-muted-foreground/30'}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </label>
  )
}

function ItemCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-xl p-3 bg-card flex flex-col gap-2">
      {children}
    </div>
  )
}

// ─── Day 1: Quiz ─────────────────────────────────────────────────────────────

function QuizEditor({
  questions,
  onChange,
}: {
  questions: QuizQuestion[]
  onChange: (q: QuizQuestion[]) => void
}) {
  const update = (i: number, patch: Partial<QuizQuestion>) =>
    onChange(questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)))

  const updateOption = (qi: number, oi: number, val: string) =>
    update(qi, { options: questions[qi].options.map((o, idx) => (idx === oi ? val : o)) })

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Fragen</SectionLabel>
      {questions.map((q, i) => (
        <ItemCard key={i}>
          <div className="flex items-start gap-2">
            <span className="text-xs text-muted-foreground font-bold mt-2.5 shrink-0">F{i + 1}</span>
            <TextArea value={q.q} onChange={v => update(i, { q: v })} placeholder="Frage..." rows={2} />
            <RemoveButton onClick={() => onChange(questions.filter((_, idx) => idx !== i))} />
          </div>
          <div className="flex flex-col gap-1.5 pl-5">
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`q${i}-answer`}
                  checked={q.answer === oi}
                  onChange={() => update(i, { answer: oi })}
                  className="accent-primary shrink-0"
                  title="Als richtige Antwort markieren"
                />
                <TextInput
                  value={opt}
                  onChange={v => updateOption(i, oi, v)}
                  placeholder={`Option ${oi + 1}`}
                />
                {q.options.length > 2 && (
                  <button
                    onClick={() => {
                      const newOpts = q.options.filter((_, idx) => idx !== oi)
                      const newAnswer = q.answer >= oi && q.answer > 0 ? q.answer - 1 : q.answer
                      update(i, { options: newOpts, answer: Math.min(newAnswer, newOpts.length - 1) })
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive shrink-0"
                  >
                    x
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => update(i, { options: [...q.options, ''] })}
              className="text-xs text-primary hover:underline text-left pl-6"
            >
              + Option
            </button>
          </div>
        </ItemCard>
      ))}
      <AddButton
        onClick={() => onChange([...questions, { q: '', options: ['', '', '', ''], answer: 0 }])}
        label="Frage hinzufugen"
      />
    </div>
  )
}

// ─── Day 2: Memory ────────────────────────────────────────────────────────────

function MemoryEditor({
  pairs,
  onChange,
}: {
  pairs: MemoryPair[]
  onChange: (p: MemoryPair[]) => void
}) {
  const update = (i: number, patch: Partial<MemoryPair>) =>
    onChange(pairs.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))

  const uploadImage = async (i: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('day', '2')
    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: formData })
      const data = await res.json() as { url?: string }
      if (data.url) update(i, { imageA: data.url })
    } catch {
      alert('Upload fehlgeschlagen.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>
        Bildpaare — je ein Bild und ein Name ({pairs.length} Paare = {pairs.length * 2} Karten)
      </SectionLabel>
      {pairs.map((p, i) => (
        <ItemCard key={i}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-bold">Paar {i + 1}</span>
            <RemoveButton onClick={() => onChange(pairs.filter((_, idx) => idx !== i))} />
          </div>

          <div className="grid grid-cols-2 gap-3 items-start">
            {/* Image slot */}
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-muted-foreground font-semibold">Bild</p>
              <TextInput
                value={p.imageA}
                onChange={v => update(i, { imageA: v })}
                placeholder="URL oder nach Upload automatisch"
              />
              <label className="text-xs font-bold text-primary border border-primary/40 rounded-lg px-3 py-2 cursor-pointer hover:bg-primary/10 transition-colors text-center">
                Bild hochladen
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) uploadImage(i, file)
                    e.target.value = ''
                  }}
                />
              </label>
              {p.imageA && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageA}
                  alt={`Vorschau Paar ${i + 1}`}
                  className="w-full aspect-square object-cover rounded-xl border border-border mt-1"
                />
              )}
            </div>

            {/* Name slot */}
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-muted-foreground font-semibold">Name (Textkarte)</p>
              <TextInput
                value={p.name}
                onChange={v => update(i, { name: v })}
                placeholder="z.B. Max Mustermann"
              />
            </div>
          </div>
        </ItemCard>
      ))}
      <AddButton
        onClick={() => onChange([...pairs, { imageA: '', name: '' }])}
        label="Paar hinzufugen"
      />
    </div>
  )
}

// ─── Day 4: Geo-Guesser ───────────────────────────────────────────────────────

function GeoGuessrEditor({
  rounds,
  onChange,
}: {
  rounds: GeoGuessrRound[]
  onChange: (r: GeoGuessrRound[]) => void
}) {
  const update = (i: number, patch: Partial<GeoGuessrRound>) =>
    onChange(rounds.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))

  const uploadImage = async (i: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('day', '4')
    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: formData })
      const data = await res.json() as { url?: string }
      if (data.url) update(i, { imageUrl: data.url })
    } catch {
      alert('Upload fehlgeschlagen.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Geo-Guesser Runden ({rounds.length})</SectionLabel>
      {rounds.map((r, i) => (
        <ItemCard key={i}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-bold">Runde {i + 1}</span>
            <RemoveButton onClick={() => onChange(rounds.filter((_, idx) => idx !== i))} />
          </div>

          {/* Label */}
          <TextInput
            value={r.label}
            onChange={v => update(i, { label: v })}
            placeholder="Ortsbezeichnung (wird nach richtigem Tipp angezeigt)"
          />

          {/* Image upload */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-muted-foreground font-semibold">Foto des Ortes</p>
            <TextInput
              value={r.imageUrl}
              onChange={v => update(i, { imageUrl: v })}
              placeholder="URL oder nach Upload automatisch"
            />
            <label className="text-xs font-bold text-primary border border-primary/40 rounded-lg px-3 py-2 cursor-pointer hover:bg-primary/10 transition-colors text-center">
              Bild hochladen
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) uploadImage(i, file)
                  e.target.value = ''
                }}
              />
            </label>
            {r.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={r.imageUrl}
                alt={`Vorschau Runde ${i + 1}`}
                className="w-full max-h-40 object-cover rounded-xl border border-border mt-1"
              />
            )}
          </div>

          {/* Coordinates + threshold */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground font-semibold">Breitengrad (lat)</p>
              <input
                type="number"
                step="0.000001"
                value={r.lat || ''}
                onChange={e => update(i, { lat: parseFloat(e.target.value) || 0 })}
                placeholder="z.B. 48.1374"
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/40 w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground font-semibold">Längengrad (lng)</p>
              <input
                type="number"
                step="0.000001"
                value={r.lng || ''}
                onChange={e => update(i, { lng: parseFloat(e.target.value) || 0 })}
                placeholder="z.B. 11.5755"
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/40 w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground font-semibold">Toleranz (m)</p>
              <input
                type="number"
                min="10"
                step="50"
                value={r.thresholdM || ''}
                onChange={e => update(i, { thresholdM: parseFloat(e.target.value) || 500 })}
                placeholder="z.B. 500"
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/40 w-full"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Tipp: Koordinaten findest du auf{' '}
            <a
              href="https://www.openstreetmap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              openstreetmap.org
            </a>{' '}
            — Rechtsklick auf den Ort &rarr; &ldquo;Adresse anzeigen&rdquo;.
          </p>
        </ItemCard>
      ))}
      <AddButton
        onClick={() => onChange([...rounds, { imageUrl: '', label: '', lat: 0, lng: 0, thresholdM: 500 }])}
        label="Runde hinzufugen"
      />
    </div>
  )
}

// ─── Day 3: Scramble ──────────────────────────────────────────────────────────

function ScrambleEditor({ words, onChange }: { words: ScrambleWord[]; onChange: (w: ScrambleWord[]) => void }) {
  const update = (i: number, patch: Partial<ScrambleWord>) =>
    onChange(words.map((w, idx) => (idx === i ? { ...w, ...patch } : w)))

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Worter</SectionLabel>
      {words.map((w, i) => (
        <ItemCard key={i}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-bold shrink-0">W{i + 1}</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
              <TextInput value={w.scrambled} onChange={v => update(i, { scrambled: v })} placeholder="Durcheinander (z.B. PTEOP)" />
              <TextInput value={w.answer} onChange={v => update(i, { answer: v })} placeholder="Losung (z.B. TOPFE)" />
              <TextInput value={w.hint} onChange={v => update(i, { hint: v })} placeholder="Hinweis" />
            </div>
            <RemoveButton onClick={() => onChange(words.filter((_, idx) => idx !== i))} />
          </div>
        </ItemCard>
      ))}
      <AddButton onClick={() => onChange([...words, { scrambled: '', answer: '', hint: '' }])} label="Wort hinzufugen" />
    </div>
  )
}

// ─── Day 5: Math ──────────────────────────────────────────────────────────────

function MathEditor({ riddles, onChange }: { riddles: MathRiddle[]; onChange: (r: MathRiddle[]) => void }) {
  const update = (i: number, patch: Partial<MathRiddle>) =>
    onChange(riddles.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Rechenaufgaben</SectionLabel>
      {riddles.map((r, i) => (
        <ItemCard key={i}>
          <div className="flex items-start gap-2">
            <span className="text-xs text-muted-foreground font-bold mt-2.5 shrink-0">R{i + 1}</span>
            <div className="flex flex-col gap-2 flex-1">
              <TextArea value={r.text} onChange={v => update(i, { text: v })} placeholder="Aufgabentext" rows={2} />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={r.answer}
                  onChange={e => update(i, { answer: Number(e.target.value) })}
                  placeholder="Antwort"
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/40 w-28"
                />
                <TextInput value={r.unit} onChange={v => update(i, { unit: v })} placeholder="Einheit (z.B. Liter)" />
              </div>
            </div>
            <RemoveButton onClick={() => onChange(riddles.filter((_, idx) => idx !== i))} />
          </div>
        </ItemCard>
      ))}
      <AddButton onClick={() => onChange([...riddles, { text: '', answer: 0, unit: '' }])} label="Aufgabe hinzufugen" />
    </div>
  )
}

// ─── Day 6: True/False ────────────────────────────────────────────────────────

function TrueFalseEditor({ statements, onChange }: { statements: TrueFalseStatement[]; onChange: (s: TrueFalseStatement[]) => void }) {
  const update = (i: number, patch: Partial<TrueFalseStatement>) =>
    onChange(statements.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Aussagen</SectionLabel>
      {statements.map((s, i) => (
        <ItemCard key={i}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-bold shrink-0">A{i + 1}</span>
            <TextArea value={s.text} onChange={v => update(i, { text: v })} placeholder="Aussage..." rows={2} />
            <div className="shrink-0">
              <Toggle value={s.answer} onChange={v => update(i, { answer: v })} label={s.answer ? 'Wahr' : 'Falsch'} />
            </div>
            <RemoveButton onClick={() => onChange(statements.filter((_, idx) => idx !== i))} />
          </div>
        </ItemCard>
      ))}
      <AddButton onClick={() => onChange([...statements, { text: '', answer: true }])} label="Aussage hinzufugen" />
    </div>
  )
}

// ─── Day 7: Hangman ───────────────────────────────────────────────────────────

function HangmanEditor({ words, onChange }: { words: HangmanWord[]; onChange: (w: HangmanWord[]) => void }) {
  const update = (i: number, patch: Partial<HangmanWord>) =>
    onChange(words.map((w, idx) => (idx === i ? { ...w, ...patch } : w)))

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Worter (Grossbuchstaben)</SectionLabel>
      {words.map((w, i) => (
        <ItemCard key={i}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-bold shrink-0">W{i + 1}</span>
            <div className="flex gap-2 flex-1">
              <TextInput value={w.word} onChange={v => update(i, { word: v.toUpperCase() })} placeholder="WORT" />
              <TextInput value={w.hint} onChange={v => update(i, { hint: v })} placeholder="Hinweis" />
            </div>
            <RemoveButton onClick={() => onChange(words.filter((_, idx) => idx !== i))} />
          </div>
        </ItemCard>
      ))}
      <AddButton onClick={() => onChange([...words, { word: '', hint: '' }])} label="Wort hinzufugen" />
    </div>
  )
}

// ─── Day 8: Sorting ───────────────────────────────────────────────────────────

function SortingEditor({ steps, onChange }: { steps: string[]; onChange: (s: string[]) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Schritte (richtige Reihenfolge von oben nach unten)</SectionLabel>
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-bold w-5 shrink-0">{i + 1}.</span>
          <TextInput value={s} onChange={v => onChange(steps.map((x, idx) => (idx === i ? v : x)))} placeholder={`Schritt ${i + 1}`} />
          <div className="flex flex-col gap-0.5 shrink-0">
            {i > 0 && (
              <button onClick={() => { const a = [...steps]; [a[i-1], a[i]] = [a[i], a[i-1]]; onChange(a) }} className="text-xs text-muted-foreground hover:text-foreground leading-none">^</button>
            )}
            {i < steps.length - 1 && (
              <button onClick={() => { const a = [...steps]; [a[i], a[i+1]] = [a[i+1], a[i]]; onChange(a) }} className="text-xs text-muted-foreground hover:text-foreground leading-none">v</button>
            )}
          </div>
          {steps.length > 2 && (
            <button onClick={() => onChange(steps.filter((_, idx) => idx !== i))} className="text-xs text-destructive shrink-0">x</button>
          )}
        </div>
      ))}
      <AddButton onClick={() => onChange([...steps, ''])} label="Schritt hinzufugen" />
    </div>
  )
}

// ─── Day 9: Text Riddles ──────────────────────────────────────────────────────

function TextRiddleEditor({
  riddles,
  onChange,
}: {
  riddles: Array<{ riddle: string; answer: string; hint: string }>
  onChange: (r: Array<{ riddle: string; answer: string; hint: string }>) => void
}) {
  const update = (i: number, patch: Partial<{ riddle: string; answer: string; hint: string }>) =>
    onChange(riddles.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Ratsel</SectionLabel>
      {riddles.map((r, i) => (
        <ItemCard key={i}>
          <div className="flex items-start gap-2">
            <span className="text-xs text-muted-foreground font-bold mt-2.5 shrink-0">R{i + 1}</span>
            <div className="flex flex-col gap-2 flex-1">
              <TextArea value={r.riddle} onChange={v => update(i, { riddle: v })} placeholder="Ratseltext..." rows={3} />
              <div className="flex gap-2">
                <TextInput value={r.answer} onChange={v => update(i, { answer: v.toUpperCase() })} placeholder="Losung (GROSSBUCHSTABEN)" />
                <TextInput value={r.hint} onChange={v => update(i, { hint: v })} placeholder="Hinweis" />
              </div>
            </div>
            <RemoveButton onClick={() => onChange(riddles.filter((_, idx) => idx !== i))} />
          </div>
        </ItemCard>
      ))}
      <AddButton onClick={() => onChange([...riddles, { riddle: '', answer: '', hint: '' }])} label="Ratsel hinzufugen" />
    </div>
  )
}

// ─── Day 10: Hitster ─────────────────────────────────────────────────────────

function HitsterEditor({
  pairs,
  onChange,
}: {
  pairs: HitsterPair[]
  onChange: (p: HitsterPair[]) => void
}) {
  const update = (i: number, patch: Partial<HitsterPair>) =>
    onChange(pairs.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))

  const uploadFile = async (
    i: number,
    file: File,
    type: 'audio' | 'image'
  ) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('day', '10')
    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: formData })
      const data = await res.json() as { url?: string }
      if (data.url) {
        update(i, type === 'audio' ? { audioUrl: data.url } : { imageUrl: data.url })
      }
    } catch {
      alert('Upload fehlgeschlagen.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Audio-Bild-Paare (je ein Clip + ein Foto)</SectionLabel>
      {pairs.map((p, i) => (
        <ItemCard key={i}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-bold">Paar {i + 1}</span>
            <RemoveButton onClick={() => onChange(pairs.filter((_, idx) => idx !== i))} />
          </div>

          {/* Label */}
          <TextInput
            value={p.label}
            onChange={v => update(i, { label: v })}
            placeholder="Bezeichnung (z.B. Name des Gruppenleiters)"
          />

          {/* Audio */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-muted-foreground font-semibold">Audio-Datei</p>
            <div className="flex gap-2 items-center">
              <TextInput
                value={p.audioUrl}
                onChange={v => update(i, { audioUrl: v })}
                placeholder="URL (https://...) oder nach Upload automatisch"
                className="flex-1"
              />
              <label className="shrink-0 text-xs font-bold text-primary border border-primary/40 rounded-lg px-3 py-2 cursor-pointer hover:bg-primary/10 transition-colors whitespace-nowrap">
                Hochladen
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) uploadFile(i, file, 'audio')
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
            {p.audioUrl && (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <audio controls src={p.audioUrl} className="w-full h-9 mt-1 rounded-lg" />
            )}
          </div>

          {/* Image */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-muted-foreground font-semibold">Bild</p>
            <div className="flex gap-2 items-center">
              <TextInput
                value={p.imageUrl}
                onChange={v => update(i, { imageUrl: v })}
                placeholder="URL (https://...) oder nach Upload automatisch"
                className="flex-1"
              />
              <label className="shrink-0 text-xs font-bold text-primary border border-primary/40 rounded-lg px-3 py-2 cursor-pointer hover:bg-primary/10 transition-colors whitespace-nowrap">
                Hochladen
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) uploadFile(i, file, 'image')
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
            {p.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.imageUrl}
                alt={`Vorschau ${i + 1}`}
                className="w-24 h-24 object-cover rounded-xl border border-border mt-1"
              />
            )}
          </div>
        </ItemCard>
      ))}
      <AddButton
        onClick={() => onChange([...pairs, { audioUrl: '', imageUrl: '', label: '' }])}
        label="Paar hinzufugen"
      />
    </div>
  )
}

// ─── Day 11: Cooks ────────────────────────────────────────────────────────────

function CooksEditor({
  cooks,
  onChange,
}: {
  cooks: CookWord[]
  onChange: (c: CookWord[]) => void
}) {
  const update = (i: number, patch: Partial<CookWord>) =>
    onChange(cooks.map((c, idx) => (idx === i ? { ...c, ...patch } : c)))

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Köche & Lösungswörter ({cooks.length})</SectionLabel>
      {cooks.map((c, i) => (
        <ItemCard key={i}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-bold">Koch {i + 1}</span>
            <RemoveButton onClick={() => onChange(cooks.filter((_, idx) => idx !== i))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground font-semibold">Name des Kochs</p>
              <TextInput value={c.name} onChange={v => update(i, { name: v })} placeholder="z.B. Koch Klaus" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground font-semibold">Lösungswort</p>
              <TextInput value={c.word} onChange={v => update(i, { word: v })} placeholder="z.B. PFANNE" />
            </div>
          </div>
        </ItemCard>
      ))}
      <AddButton onClick={() => onChange([...cooks, { name: '', word: '' }])} label="Koch hinzufugen" />
    </div>
  )
}

// ─── Day 12: Foto-Einsendungen ────────────────────────────────────────────────

interface Day12Submission {
  id: string
  fun: string
  favorite: string
  wish: string
  submittedAt: string
}

const DAY12_SLOTS: Array<{ key: 'fun' | 'favorite' | 'wish'; label: string }> = [
  { key: 'fun', label: 'Spaß am Kalender' },
  { key: 'favorite', label: 'Lieblings-Zeltlager Bild' },
  { key: 'wish', label: 'Wunsch-Essen' },
]

function Day12SubmissionsViewer() {
  const [submissions, setSubmissions] = useState<Day12Submission[] | null>(null)
  const [error, setError] = useState('')

  const load = () => {
    setError('')
    fetch('/api/day12-submissions', { cache: 'no-store' })
      .then(r => r.json())
      .then((data: Day12Submission[]) => setSubmissions(data))
      .catch(() => setError('Einsendungen konnten nicht geladen werden.'))
  }

  useEffect(load, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <SectionLabel>Foto-Einsendungen ({submissions?.length ?? 0})</SectionLabel>
        <button
          onClick={load}
          className="text-xs font-bold text-primary border border-primary/40 rounded-lg px-3 py-1.5 hover:bg-primary/10 transition-colors"
        >
          Aktualisieren
        </button>
      </div>

      {error && <p className="text-sm text-destructive font-semibold">{error}</p>}

      {submissions === null && !error && (
        <p className="text-sm text-muted-foreground">Wird geladen…</p>
      )}

      {submissions?.length === 0 && (
        <p className="text-sm text-muted-foreground">Noch keine Einsendungen vorhanden.</p>
      )}

      {submissions?.map((sub, i) => (
        <ItemCard key={sub.id}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-bold">Einsendung {submissions.length - i}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(sub.submittedAt).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DAY12_SLOTS.map(slot => {
              const url = sub[slot.key]
              return (
                <div key={slot.key} className="flex flex-col gap-1.5">
                  <p className="text-xs text-muted-foreground font-semibold">{slot.label}</p>
                  {url ? (
                    <>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={slot.label}
                          className="w-full aspect-square object-cover rounded-xl border border-border hover:opacity-90 transition-opacity"
                        />
                      </a>
                      <div className="flex gap-2">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center text-xs font-bold text-primary border border-primary/40 rounded-lg px-2 py-1.5 hover:bg-primary/10 transition-colors"
                        >
                          Ansehen
                        </a>
                        <a
                          href={url}
                          download
                          className="flex-1 text-center text-xs font-bold text-foreground border border-border rounded-lg px-2 py-1.5 hover:bg-muted transition-colors"
                        >
                          Download
                        </a>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">kein Foto</p>
                  )}
                </div>
              )
            })}
          </div>
        </ItemCard>
      ))}
    </div>
  )
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

interface PuzzleEditorProps {
  day: number
  content: DayPuzzleContent
  onChange: (c: DayPuzzleContent) => void
}

export default function PuzzleContentEditor({ day, content, onChange }: PuzzleEditorProps) {
  const PUZZLE_NAMES: Record<number, string> = {
    1: 'Quiz', 2: 'Memory', 3: 'Anagramm', 4: 'Wortsuche (Gitter fix)',
    5: 'Rechenaufgaben', 6: 'Wahr / Falsch', 7: 'Galgenmanning',
    8: 'Reihenfolge sortieren', 9: 'Ratsel', 10: 'Gruppenleiter Hitster',
    11: 'Köche', 12: 'Fotos für Johannes',
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
        Ratsel-Typ: <span className="text-foreground">{PUZZLE_NAMES[day] ?? '—'}</span>
      </p>

      {day === 1 && (
        <QuizEditor
          questions={content.quizQuestions ?? []}
          onChange={q => onChange({ ...content, quizQuestions: q })}
        />
      )}
      {day === 2 && (
        <MemoryEditor
          pairs={content.memoryPairs ?? []}
          onChange={p => onChange({ ...content, memoryPairs: p })}
        />
      )}
      {day === 3 && (
        <ScrambleEditor
          words={content.scrambleWords ?? []}
          onChange={w => onChange({ ...content, scrambleWords: w })}
        />
      )}
      {day === 4 && (
        <GeoGuessrEditor
          rounds={content.geoGuessrRounds ?? []}
          onChange={r => onChange({ ...content, geoGuessrRounds: r })}
        />
      )}
      {day === 5 && (
        <MathEditor
          riddles={content.mathRiddles ?? []}
          onChange={r => onChange({ ...content, mathRiddles: r })}
        />
      )}
      {day === 6 && (
        <TrueFalseEditor
          statements={content.trueFalseStatements ?? []}
          onChange={s => onChange({ ...content, trueFalseStatements: s })}
        />
      )}
      {day === 7 && (
        <HangmanEditor
          words={content.hangmanWords ?? []}
          onChange={w => onChange({ ...content, hangmanWords: w })}
        />
      )}
      {day === 8 && (
        <SortingEditor
          steps={content.sortingSteps ?? []}
          onChange={s => onChange({ ...content, sortingSteps: s })}
        />
      )}
      {day === 9 && (
        <TextRiddleEditor
          riddles={content.textRiddles ?? []}
          onChange={r => onChange({ ...content, textRiddles: r })}
        />
      )}
      {day === 10 && (
        <HitsterEditor
          pairs={content.hitsterPairs ?? []}
          onChange={p => onChange({ ...content, hitsterPairs: p })}
        />
      )}
      {day === 11 && (
        <CooksEditor
          cooks={content.cookWords ?? []}
          onChange={c => onChange({ ...content, cookWords: c })}
        />
      )}
      {day === 12 && <Day12SubmissionsViewer />}
    </div>
  )
}
