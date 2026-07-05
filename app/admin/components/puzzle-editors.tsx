'use client'

import type {
  DayPuzzleContent,
  QuizQuestion,
  ScrambleWord,
  MathRiddle,
  TrueFalseStatement,
  HangmanWord,
  HitsterPair,
  MemoryPair,
  FinalStage,
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

// ─── Day 11: Code ─────────────────────────────────────────────────────────────

function CodeEditor({
  encoded,
  answer,
  clues,
  onChange,
}: {
  encoded: number[]
  answer: string
  clues: Array<{ clue: string }>
  onChange: (patch: { encoded?: number[]; answer?: string; clues?: Array<{ clue: string }> }) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <SectionLabel>Zahlencode (kommagetrennt, z.B. 19,21,16)</SectionLabel>
        <TextInput
          value={encoded.join(', ')}
          onChange={v => {
            const nums = v.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
            onChange({ encoded: nums })
          }}
          placeholder="19, 21, 16, 16, 5"
        />
      </div>
      <div>
        <SectionLabel>Losungswort (Grossbuchstaben)</SectionLabel>
        <TextInput value={answer} onChange={v => onChange({ answer: v.toUpperCase() })} placeholder="SUPPE" />
      </div>
      <div>
        <SectionLabel>Hinweise</SectionLabel>
        {clues.map((c, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <TextInput value={c.clue} onChange={v => onChange({ clues: clues.map((x, idx) => (idx === i ? { clue: v } : x)) })} placeholder={`Hinweis ${i + 1}`} />
            {clues.length > 1 && (
              <RemoveButton onClick={() => onChange({ clues: clues.filter((_, idx) => idx !== i) })} />
            )}
          </div>
        ))}
        <AddButton onClick={() => onChange({ clues: [...clues, { clue: '' }] })} label="Hinweis hinzufugen" />
      </div>
    </div>
  )
}

// ─── Day 12: Final Stages ─────────────────────────────────────────────────────

function FinalEditor({ stages, onChange }: { stages: FinalStage[]; onChange: (s: FinalStage[]) => void }) {
  const update = (i: number, patch: Partial<FinalStage>) =>
    onChange(stages.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Aufgaben</SectionLabel>
      {stages.map((s, i) => (
        <ItemCard key={i}>
          <div className="flex items-center gap-2 justify-between">
            <span className="text-xs text-muted-foreground font-bold">Aufgabe {i + 1}</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                <input type="radio" name={`stage-type-${i}`} checked={s.type === 'quiz'} onChange={() => update(i, { type: 'quiz', options: s.options ?? ['', '', '', ''], answer: '0' })} className="accent-primary" />
                Quiz
              </label>
              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                <input type="radio" name={`stage-type-${i}`} checked={s.type === 'input'} onChange={() => update(i, { type: 'input', answer: '' })} className="accent-primary" />
                Eingabe
              </label>
              <RemoveButton onClick={() => onChange(stages.filter((_, idx) => idx !== i))} />
            </div>
          </div>
          <TextArea value={s.question} onChange={v => update(i, { question: v })} placeholder="Frage..." rows={2} />
          {s.type === 'quiz' ? (
            <div className="flex flex-col gap-1.5 pl-2">
              {(s.options ?? []).map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`final-answer-${i}`}
                    checked={s.answer === String(oi)}
                    onChange={() => update(i, { answer: String(oi) })}
                    className="accent-primary shrink-0"
                    title="Richtige Antwort"
                  />
                  <TextInput
                    value={opt}
                    onChange={v => update(i, { options: (s.options ?? []).map((o, idx) => (idx === oi ? v : o)) })}
                    placeholder={`Option ${oi + 1}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
              <TextInput value={s.answer} onChange={v => update(i, { answer: v.toUpperCase() })} placeholder="Losung (GROSSBUCHSTABEN)" />
              <TextInput value={s.hint ?? ''} onChange={v => update(i, { hint: v })} placeholder="Hinweis (optional)" />
            </div>
          )}
        </ItemCard>
      ))}
      <AddButton
        onClick={() => onChange([...stages, { type: 'quiz', question: '', options: ['', '', '', ''], answer: '0' }])}
        label="Aufgabe hinzufugen"
      />
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
    11: 'Geheimcode', 12: 'Grosses Finale',
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
        <div className="bg-muted/50 border border-border rounded-xl p-4 text-sm text-muted-foreground">
          Das Buchstabengitter fur Tag 4 ist im Code fixiert und kann hier nicht bearbeitet werden.
          Die unten gezeigten Worter sind nur zur Dokumentation.
          <div className="flex flex-col gap-1.5 mt-3">
            {(content.wordSearchWords ?? []).map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <TextInput
                  value={w}
                  onChange={v => onChange({ ...content, wordSearchWords: (content.wordSearchWords ?? []).map((x, idx) => idx === i ? v : x) })}
                  placeholder="Wort"
                />
              </div>
            ))}
          </div>
        </div>
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
        <CodeEditor
          encoded={content.codeEncoded ?? []}
          answer={content.codeAnswer ?? ''}
          clues={content.codeClues ?? []}
          onChange={patch => onChange({ ...content, ...patch })}
        />
      )}
      {day === 12 && (
        <FinalEditor
          stages={content.finalStages ?? []}
          onChange={s => onChange({ ...content, finalStages: s })}
        />
      )}
    </div>
  )
}
