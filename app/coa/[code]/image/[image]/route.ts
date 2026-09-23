import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const privateHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow, noimageindex',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
}

// UBAH NAMA FILE DI SINI jika nama foto/PDF kamu berbeda.
// Slot 2, 6, 7 harus berupa PDF asli, bukan PNG yang diganti ekstensi.
// Path literal membantu Next.js menyertakan foto pada build Vercel.
// Jangan mengganti path dengan input URL dari pengunjung.
async function readReportImage(image: string) {
  switch (image) {
    case '1': return readFile(path.join(process.cwd(), 'lab-documents/retatrutide/01-janoshik-purity.png'))
    case '2': return readFile(path.join(process.cwd(), 'lab-documents/retatrutide/02-janoshik-chromatogram.pdf'))
    case '3': return readFile(path.join(process.cwd(), 'lab-documents/retatrutide/03-janoshik-endotoxin.png'))
    case '4': return readFile(path.join(process.cwd(), 'lab-documents/retatrutide/04-sample-photo.png'))
    case '5': return readFile(path.join(process.cwd(), 'lab-documents/retatrutide/05-test-photo.png'))
    case '6': return readFile(path.join(process.cwd(), 'lab-documents/retatrutide/06-uzorak-purity.pdf'))
    case '7': return readFile(path.join(process.cwd(), 'lab-documents/retatrutide/07-uzorak-endotoxin.pdf'))
    default: throw new Error('Unknown report image')
  }
}

const pdfFilenames: Partial<Record<string, string>> = {
  '2': '02-janoshik-chromatogram.pdf',
  '6': '06-uzorak-purity.pdf',
  '7': '07-uzorak-endotoxin.pdf',
}

function imageType(bytes: Uint8Array): string | null {
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, i) => bytes[i] === value)) return 'image/png'
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg'
  if (bytes.length >= 12 && Buffer.from(bytes.subarray(0, 4)).toString('ascii') === 'RIFF' && Buffer.from(bytes.subarray(8, 12)).toString('ascii') === 'WEBP') return 'image/webp'
  return null
}

function missing() {
  return new Response('Not found', { status: 404, headers: privateHeaders })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string; image: string }> },
) {
  const { code, image } = await params
  const expectedCode = process.env.REGEN_RETATRUTIDE_COA_CODE

  // Check access before touching the files. The same code protects the page.
  if (!expectedCode || !/^[A-Za-z0-9_-]{32,128}$/.test(expectedCode) || code !== expectedCode || !/^[1-7]$/.test(image)) {
    return missing()
  }

  try {
    const bytes = new Uint8Array(await readReportImage(image))
    const pdfFilename = pdfFilenames[image]
    const contentType = pdfFilename
      ? (Buffer.from(bytes.subarray(0, 5)).toString('ascii') === '%PDF-' ? 'application/pdf' : null)
      : imageType(bytes)
    if (!contentType) return missing()
    return new Response(bytes, {
      headers: {
        ...privateHeaders,
        'Content-Type': contentType,
        'Content-Length': String(bytes.byteLength),
        ...(pdfFilename ? { 'Content-Disposition': `inline; filename="${pdfFilename}"` } : {}),
      },
    })
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return missing()
    return new Response('Unable to load image', { status: 500, headers: privateHeaders })
  }
}
