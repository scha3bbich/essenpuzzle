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
    console.log('[v0] config POST: parsing request body...')
    let body: AdminConfig
    try {
      body = await request.json() as AdminConfig
    } catch (parseErr) {
      console.error('[v0] config POST: failed to parse JSON body:', parseErr)
      return NextResponse.json({ error: 'Ungültiger JSON-Body', detail: String(parseErr) }, { status: 400 })
    }

    const jsonStr = JSON.stringify(body, null, 2)
    console.log(`[v0] config POST: body size = ${jsonStr.length} bytes, putting to blob...`)

    await put(BLOB_PATH, jsonStr, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
    })

    console.log('[v0] config POST: saved successfully')
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[v0] config POST: unexpected error:', err)
    return NextResponse.json(
      { error: 'Speichern fehlgeschlagen', detail: String(err) },
      { status: 500 }
    )
  }
}
