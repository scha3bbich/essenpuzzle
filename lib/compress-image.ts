/**
 * Client-side image compression.
 *
 * Server upload routes on Vercel are limited to ~4.5 MB request bodies, and
 * phone photos are frequently larger. This helper downscales and re-encodes an
 * image in the browser (via <canvas>) before it is uploaded, so the resulting
 * file comfortably fits under the limit while staying visually fine.
 *
 * Non-image files (e.g. audio) are returned unchanged.
 */

interface CompressOptions {
  /** Longest edge in pixels the image is scaled down to. */
  maxDimension?: number
  /** JPEG/WebP quality between 0 and 1. */
  quality?: number
  /** Only compress if the file is larger than this many bytes. */
  minSizeBytes?: number
}

const DEFAULTS: Required<CompressOptions> = {
  maxDimension: 2000,
  quality: 0.8,
  minSizeBytes: 1_000_000, // 1 MB — smaller files are left as-is
}

export async function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  const { maxDimension, quality, minSizeBytes } = { ...DEFAULTS, ...options }

  // Only touch raster images. Skip SVG (not rasterisable this way) and non-images.
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return file
  // Small enough already — no need to recompress.
  if (file.size <= minSizeBytes) return file

  try {
    const bitmap = await loadBitmap(file)
    const { width, height } = bitmap

    // Work out the scaled dimensions, preserving aspect ratio.
    const scale = Math.min(1, maxDimension / Math.max(width, height))
    const targetW = Math.round(width * scale)
    const targetH = Math.round(height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, targetW, targetH)
    if ('close' in bitmap && typeof bitmap.close === 'function') bitmap.close()

    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    )
    if (!blob) return file

    // If compression somehow made it bigger, keep the original.
    if (blob.size >= file.size) return file

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() })
  } catch {
    // On any failure, fall back to the original file so the upload still works.
    return file
  }
}

/** Decode a File into an ImageBitmap (fast) or an HTMLImageElement fallback. */
async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file)
    } catch {
      // fall through to the <img> path
    }
  }
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Bild konnte nicht geladen werden'))
    }
    img.src = url
  })
}
