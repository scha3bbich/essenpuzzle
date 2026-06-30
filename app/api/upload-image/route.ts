import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

// Allow up to 50 MB request bodies (default Next.js limit is 4 MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}

// Next.js App Router uses a different mechanism for the body-size limit
export const maxDuration = 60 // seconds

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const day = formData.get('day') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei angegeben' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() ?? 'bin'
    const isAudio = file.type.startsWith('audio/')
    const folder = isAudio ? 'audio' : 'images'
    const filename = `zeltlager/${folder}/tag-${day ?? 'x'}-${Date.now()}.${ext}`

    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error('[upload] error:', err)
    return NextResponse.json({ error: 'Upload fehlgeschlagen' }, { status: 500 })
  }
}
