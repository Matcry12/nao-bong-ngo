// Resize + JPEG-encode a picked image. → data URL, or null if unreadable / too big.
const MAX_SIDE = 1024
const MAX_B64 = 1_200_000

export async function prepareImage(file) {
  try {
    const bmp = await createImageBitmap(file)
    const k = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.max(1, Math.round(bmp.width * k))
    c.height = Math.max(1, Math.round(bmp.height * k))
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.drawImage(bmp, 0, 0, c.width, c.height)
    bmp.close?.()
    for (const q of [0.8, 0.6]) {
      const url = c.toDataURL('image/jpeg', q)
      if (url.startsWith('data:image/jpeg') && url.length - url.indexOf(',') - 1 <= MAX_B64) return url
    }
  } catch { /* fall through */ }
  return null
}
