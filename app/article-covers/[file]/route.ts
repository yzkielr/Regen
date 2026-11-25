import { readCover } from '@/lib/article-store'

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const image = await readCover((await params).file, true)
  if (!image) return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } })
  return new Response(new Uint8Array(image), {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
