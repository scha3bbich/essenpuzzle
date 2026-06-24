import { put, list } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { DEFAULT_CONFIG, type AdminConfig } from '@/lib/config'

const BLOB_PATH = 'zeltlager/admin-config.json'

async function readConfig(): Promise<AdminConfig> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATH })
    if (blobs.length === 0) return DEFAULT_CONFIG
    const res = await fetch(blobs[0].url, { cache: 'no-store' })
    if (!res.ok) return DEFAULT_CONFIG
    return (await res.json()) as AdminConfig
  } catch {
    return DEFAULT_CONFIG
  }
}

export async function GET() {
  const config = await readConfig()
  return NextResponse.json(config)
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as AdminConfig
    await put(BLOB_PATH, JSON.stringify(body, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[config API] save error:', err)
    return NextResponse.json({ error: 'Speichern fehlgeschlagen' }, { status: 500 })
  }
}
