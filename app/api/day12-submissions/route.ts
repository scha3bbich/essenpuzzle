import { put, list } from '@vercel/blob'
import { NextResponse } from 'next/server'

const BLOB_PATH = 'zeltlager/day12-submissions.json'

export interface Day12Submission {
  id: string
  /** Foto: wie viel Spaß der Kalender gemacht hat */
  fun: string
  /** Foto: Lieblings-Zeltlager Bild */
  favorite: string
  /** Foto: Wunsch-Essen für den Essensplan */
  wish: string
  submittedAt: string
}

async function readSubmissions(): Promise<Day12Submission[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATH })
    if (blobs.length === 0) return []
    const res = await fetch(blobs[0].url, { cache: 'no-store' })
    if (!res.ok) return []
    return (await res.json()) as Day12Submission[]
  } catch {
    return []
  }
}

export async function GET() {
  const submissions = await readSubmissions()
  return NextResponse.json(submissions)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<Day12Submission>
    if (!body.fun || !body.favorite || !body.wish) {
      return NextResponse.json({ error: 'Alle drei Fotos werden benötigt' }, { status: 400 })
    }

    const existing = await readSubmissions()
    const submission: Day12Submission = {
      id: `sub-${Date.now()}`,
      fun: body.fun,
      favorite: body.favorite,
      wish: body.wish,
      submittedAt: new Date().toISOString(),
    }
    const updated = [submission, ...existing]

    await put(BLOB_PATH, JSON.stringify(updated, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    })

    return NextResponse.json({ ok: true, id: submission.id })
  } catch (err) {
    console.error('[day12-submissions] save error:', err)
    return NextResponse.json({ error: 'Speichern fehlgeschlagen', detail: String(err) }, { status: 500 })
  }
}
